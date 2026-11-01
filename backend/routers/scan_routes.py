import uuid
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from backend.database import get_db
from backend.auth import get_current_user

from backend.connectors.email_breach import check_email_breaches
from backend.connectors.gravatar import check_gravatar_profile
from backend.connectors.github_osint import check_github_exposure
from backend.connectors.phone_osint import analyze_phone_exposure
from backend.connectors.username_osint import check_username_exposure
from backend.connectors.google_dorks import generate_search_engine_exposures

router = APIRouter(prefix="/api/scans", tags=["Scans"])

class StartScanRequest(BaseModel):
    identifier_id: Optional[str] = None
    target_value: Optional[str] = None
    target_type: Optional[str] = None  # email, phone, username, name

@router.post("")
def start_scan(req: StartScanRequest, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()

    target_val = ""
    target_type = ""
    identifier_id = req.identifier_id

    if identifier_id:
        cursor.execute("SELECT id, type, value FROM identifiers WHERE id = ? AND user_id = ?", (identifier_id, user["id"]))
        row = cursor.fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail="Monitored identifier not found.")
        target_val = row["value"]
        target_type = row["type"]
    else:
        if not req.target_value or not req.target_type:
            conn.close()
            raise HTTPException(status_code=400, detail="Must provide target_value and target_type, or identifier_id.")
        target_val = req.target_value.strip()
        target_type = req.target_type.lower().strip()

    scan_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    # Record initial scan in progress
    cursor.execute(
        """INSERT INTO scans (id, user_id, identifier_id, status, target_value, target_type,
                              sources_checked, total_sources, findings_count, risk_score, started_at)
           VALUES (?, ?, ?, 'scanning', ?, ?, 0, 0, 0, 0, ?)""",
        (scan_id, user["id"], identifier_id, target_val, target_type, now)
    )
    conn.commit()

    all_findings = []
    sources_count = 0

    # 1. EMAIL SCAN
    if target_type == "email":
        sources_count = 8
        # A. XposedOrNot live breach analytics
        breach_res = check_email_breaches(target_val)
        all_findings.extend(breach_res.get("breaches", []))

        # B. Gravatar public directory profile
        grav_res = check_gravatar_profile(target_val)
        if grav_res["found"] and grav_res["finding"]:
            all_findings.append(grav_res["finding"])

        # C. GitHub public commit leaks
        gh_findings = check_github_exposure(target_val, "email")
        all_findings.extend(gh_findings)

        # D. Search engine dorking & leaked docs
        dork_findings = generate_search_engine_exposures(target_val, "email")
        all_findings.extend(dork_findings)

    # 2. PHONE SCAN
    elif target_type == "phone":
        sources_count = 6
        # A. Libphonenumber carrier, Truecaller directory unlisting, TRAI / FTC DND
        phone_res = analyze_phone_exposure(target_val)
        all_findings.extend(phone_res.get("findings", []))

        # B. Search engine indexing dork
        dork_findings = generate_search_engine_exposures(target_val, "phone")
        all_findings.extend(dork_findings)

    # 3. USERNAME SCAN
    elif target_type == "username":
        sources_count = 18
        # A. 18+ live platforms
        user_findings = check_username_exposure(target_val)
        all_findings.extend(user_findings)

        # B. GitHub profile
        gh_user_findings = check_github_exposure(target_val, "username")
        all_findings.extend(gh_user_findings)

    # 4. FULL NAME SCAN
    elif target_type == "name":
        sources_count = 5
        dork_findings = generate_search_engine_exposures(target_val, "email")
        all_findings.extend(dork_findings)

    # Calculate overall risk score
    risk_score = 0
    for f in all_findings:
        rl = f.get("risk_level", "low")
        if rl == "critical":
            risk_score += 30
        elif rl == "high":
            risk_score += 20
        elif rl == "medium":
            risk_score += 10
        else:
            risk_score += 5
    risk_score = min(100, max(0, risk_score))

    # Persist findings
    completed_time = datetime.utcnow().isoformat()
    inserted_findings = []
    for f in all_findings:
        finding_id = str(uuid.uuid4())
        data_types_str = json.dumps(f.get("exposed_data_types", []))
        
        cursor.execute(
            """INSERT INTO findings (id, scan_id, user_id, identifier_id, source_name, source_category,
                                    source_url, page_reference, match_type, confidence_level, risk_level,
                                    exposed_data_types, detection_date, status, details, raw_evidence,
                                    opt_out_url, privacy_email)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'detected', ?, ?, ?, ?)""",
            (finding_id, scan_id, user["id"], identifier_id, f.get("source_name"), f.get("source_category"),
             f.get("source_url"), f.get("page_reference"), f.get("match_type"), f.get("confidence_level"),
             f.get("risk_level"), data_types_str, f.get("detection_date"), f.get("details"), f.get("raw_evidence"),
             f.get("opt_out_url"), f.get("privacy_email"))
        )
        f_copy = dict(f)
        f_copy["id"] = finding_id
        f_copy["scan_id"] = scan_id
        f_copy["status"] = "detected"
        inserted_findings.append(f_copy)

    # Update scan status
    cursor.execute(
        """UPDATE scans SET status = 'completed', sources_checked = ?, total_sources = ?,
                            findings_count = ?, risk_score = ?, completed_at = ?
           WHERE id = ?""",
        (sources_count, sources_count, len(all_findings), risk_score, completed_time, scan_id)
    )

    # Audit event
    cursor.execute(
        "INSERT INTO audit_events (id, user_id, action, details, timestamp) VALUES (?, ?, 'SCAN_COMPLETED', ?, ?)",
        (str(uuid.uuid4()), user["id"], f"Real scan completed for {target_type} ({target_val}). Discovered {len(all_findings)} exposures.", completed_time)
    )

    conn.commit()
    conn.close()

    return {
        "scan": {
            "id": scan_id,
            "target_value": target_val,
            "target_type": target_type,
            "sources_checked": sources_count,
            "total_sources": sources_count,
            "findings_count": len(all_findings),
            "risk_score": risk_score,
            "started_at": now,
            "completed_at": completed_time,
            "status": "completed"
        },
        "findings": inserted_findings
    }

@router.get("")
def list_scans(user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT id, identifier_id, status, target_value, target_type, sources_checked,
                  total_sources, findings_count, risk_score, started_at, completed_at
           FROM scans WHERE user_id = ? ORDER BY started_at DESC""",
        (user["id"],)
    )
    rows = cursor.fetchall()
    conn.close()
    return {"scans": [dict(r) for r in rows]}

@router.get("/{scan_id}/findings")
def get_scan_findings(scan_id: str, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scans WHERE id = ? AND user_id = ?", (scan_id, user["id"]))
    scan = cursor.fetchone()
    if not scan:
        conn.close()
        raise HTTPException(status_code=404, detail="Scan not found.")

    cursor.execute("SELECT * FROM findings WHERE scan_id = ? AND user_id = ? ORDER BY CASE risk_level WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END", (scan_id, user["id"]))
    rows = cursor.fetchall()
    conn.close()

    findings = []
    for r in rows:
        d = dict(r)
        try:
            d["exposed_data_types"] = json.loads(d["exposed_data_types"])
        except Exception:
            d["exposed_data_types"] = [d["exposed_data_types"]]
        findings.append(d)

    return {
        "scan": dict(scan),
        "findings": findings
    }
