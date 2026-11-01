import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from backend.database import get_db
from backend.auth import get_current_user
from backend.connectors.legal_generator import generate_legal_notice

router = APIRouter(prefix="/api/removals", tags=["Removal Workflows"])

class CreateRemovalRequest(BaseModel):
    finding_id: str
    legal_framework: Optional[str] = "DPDP_2023"  # DPDP_2023, GDPR_ART17, CCPA_1798, STANDARD
    custom_notes: Optional[str] = None

class UpdateRemovalStatusRequest(BaseModel):
    status: str  # submitted, in_progress, verified_removed, rejected, manual_required
    reason: Optional[str] = None

@router.post("")
def create_removal_request(req: CreateRemovalRequest, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()

    # Get finding
    cursor.execute("SELECT * FROM findings WHERE id = ? AND user_id = ?", (req.finding_id, user["id"]))
    finding = cursor.fetchone()
    if not finding:
        conn.close()
        raise HTTPException(status_code=404, detail="Finding not found.")
    
    finding_dict = dict(finding)

    # Get user identifier or email
    user_name = user.get("full_name") or "Concerned Citizen"
    target_fiduciary = finding_dict["source_name"]
    target_email = finding_dict.get("privacy_email") or "privacy@" + (finding_dict.get("source_url") or "example.com").replace("https://", "").replace("http://", "").split("/")[0]
    
    # Generate legal notice
    notice = generate_legal_notice(
        framework=req.legal_framework or "DPDP_2023",
        user_name=user_name,
        identifier_value=user.get("email"),
        identifier_type="email",
        target_fiduciary=target_fiduciary,
        target_email=target_email,
        listing_url=finding_dict.get("source_url")
    )

    request_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    cursor.execute(
        """INSERT INTO removal_requests (id, user_id, finding_id, request_type, target_domain,
                                       target_contact_email, direct_opt_out_url, legal_framework,
                                       generated_notice_text, status, submitted_at, notes)
           VALUES (?, ?, ?, 'formal_legal_demand', ?, ?, ?, ?, ?, 'submitted', ?, ?)""",
        (request_id, user["id"], req.finding_id, finding_dict.get("source_name"), target_email,
         finding_dict.get("opt_out_url"), req.legal_framework or "DPDP_2023", notice["body"], now, req.custom_notes)
    )

    # Update finding status to 'removal_requested'
    cursor.execute("UPDATE findings SET status = 'removal_requested' WHERE id = ?", (req.finding_id,))

    # Record status history
    cursor.execute(
        """INSERT INTO status_history (id, removal_request_id, previous_status, new_status, reason, timestamp)
           VALUES (?, ?, 'draft', 'submitted', 'Removal request formally initiated by user', ?)""",
        (str(uuid.uuid4()), request_id, now)
    )

    # Audit event
    cursor.execute(
        "INSERT INTO audit_events (id, user_id, action, details, timestamp) VALUES (?, ?, 'REMOVAL_REQUESTED', ?, ?)",
        (str(uuid.uuid4()), user["id"], f"Removal requested for {finding_dict['source_name']}", now)
    )

    conn.commit()
    conn.close()

    return {
        "removal_request": {
            "id": request_id,
            "finding_id": req.finding_id,
            "target_domain": finding_dict.get("source_name"),
            "target_contact_email": target_email,
            "direct_opt_out_url": finding_dict.get("opt_out_url"),
            "legal_framework": req.legal_framework,
            "generated_notice": notice,
            "status": "submitted",
            "submitted_at": now
        }
    }

@router.get("")
def list_removal_requests(user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT r.*, f.source_name, f.source_category, f.source_url, f.risk_level, f.confidence_level
           FROM removal_requests r
           JOIN findings f ON r.finding_id = f.id
           WHERE r.user_id = ?
           ORDER BY r.submitted_at DESC""",
        (user["id"],)
    )
    rows = cursor.fetchall()
    conn.close()
    return {"removal_requests": [dict(r) for r in rows]}

@router.patch("/{request_id}/status")
def update_request_status(request_id: str, req: UpdateRemovalStatusRequest, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM removal_requests WHERE id = ? AND user_id = ?", (request_id, user["id"]))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Removal request not found.")

    prev_status = row["status"]
    new_status = req.status
    now = datetime.utcnow().isoformat()
    verified_at = now if new_status == "verified_removed" else None

    cursor.execute(
        "UPDATE removal_requests SET status = ?, verified_at = COALESCE(?, verified_at) WHERE id = ?",
        (new_status, verified_at, request_id)
    )

    # Update corresponding finding status
    cursor.execute("UPDATE findings SET status = ? WHERE id = ?", (new_status, row["finding_id"]))

    # Record status history
    cursor.execute(
        """INSERT INTO status_history (id, removal_request_id, previous_status, new_status, reason, timestamp)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (str(uuid.uuid4()), request_id, prev_status, new_status, req.reason or f"Status updated to {new_status}", now)
    )

    # Audit event
    cursor.execute(
        "INSERT INTO audit_events (id, user_id, action, details, timestamp) VALUES (?, ?, 'STATUS_UPDATED', ?, ?)",
        (str(uuid.uuid4()), user["id"], f"Removal request {request_id} transitioned from {prev_status} to {new_status}", now)
    )

    conn.commit()
    conn.close()

    return {
        "message": f"Status updated from {prev_status} to {new_status}.",
        "status": new_status,
        "verified_at": verified_at
    }

@router.get("/{request_id}/history")
def get_request_history(request_id: str, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM removal_requests WHERE id = ? AND user_id = ?", (request_id, user["id"]))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Removal request not found.")

    cursor.execute(
        "SELECT id, previous_status, new_status, reason, timestamp FROM status_history WHERE removal_request_id = ? ORDER BY timestamp ASC",
        (request_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return {"history": [dict(r) for r in rows]}
