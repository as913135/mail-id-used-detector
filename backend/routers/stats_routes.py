import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from backend.database import get_db
from backend.auth import get_current_user
from backend.connectors.broker_registry import get_data_brokers

router = APIRouter(prefix="/api/stats", tags=["Dashboard & Stats"])

@router.get("/summary")
def get_dashboard_summary(user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()

    # Total findings
    cursor.execute("SELECT COUNT(*) as count FROM findings WHERE user_id = ?", (user["id"],))
    total_findings = cursor.fetchone()["count"]

    # Critical & High risk
    cursor.execute("SELECT COUNT(*) as count FROM findings WHERE user_id = ? AND risk_level IN ('critical', 'high')", (user["id"],))
    high_risk_findings = cursor.fetchone()["count"]

    # Status breakdowns
    cursor.execute("SELECT COUNT(*) as count FROM removal_requests WHERE user_id = ? AND status = 'submitted'", (user["id"],))
    submitted_requests = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM removal_requests WHERE user_id = ? AND status = 'in_progress'", (user["id"],))
    in_progress_requests = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM removal_requests WHERE user_id = ? AND status = 'verified_removed'", (user["id"],))
    verified_removals = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM removal_requests WHERE user_id = ? AND status = 'manual_required'", (user["id"],))
    manual_required = cursor.fetchone()["count"]

    # Scans count
    cursor.execute("SELECT COUNT(*) as count FROM scans WHERE user_id = ?", (user["id"],))
    scans_count = cursor.fetchone()["count"]

    # Identifiers count
    cursor.execute("SELECT COUNT(*) as count FROM identifiers WHERE user_id = ?", (user["id"],))
    identifiers_count = cursor.fetchone()["count"]

    # Recent activity
    cursor.execute("SELECT action, details, timestamp FROM audit_events WHERE user_id = ? ORDER BY timestamp DESC LIMIT 6", (user["id"],))
    recent_activity = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return {
        "metrics": {
            "total_findings": total_findings,
            "high_risk_findings": high_risk_findings,
            "submitted_requests": submitted_requests,
            "in_progress_requests": in_progress_requests,
            "verified_removals": verified_removals,
            "manual_required": manual_required,
            "scans_count": scans_count,
            "identifiers_count": identifiers_count
        },
        "recent_activity": recent_activity
    }

@router.get("/brokers")
def list_brokers(region: str = None):
    return {"brokers": get_data_brokers(region)}

@router.get("/export")
def export_user_data(user: dict = Depends(get_current_user)):
    """
    Data Portability Export compliant with DPDP Act 2023 & GDPR Art 20.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, type, masked_value, created_at FROM identifiers WHERE user_id = ?", (user["id"],))
    identifiers = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM scans WHERE user_id = ?", (user["id"],))
    scans = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM findings WHERE user_id = ?", (user["id"],))
    findings = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM removal_requests WHERE user_id = ?", (user["id"],))
    removal_requests = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM consent_records WHERE user_id = ?", (user["id"],))
    consents = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT action, details, timestamp FROM audit_events WHERE user_id = ?", (user["id"],))
    audit_events = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return {
        "exported_at": datetime.utcnow().isoformat(),
        "user_profile": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "plan": user["plan"]
        },
        "identifiers": identifiers,
        "scans": scans,
        "findings": findings,
        "removal_requests": removal_requests,
        "consents": consents,
        "audit_trail": audit_events
    }

@router.delete("/account")
def purge_account(user: dict = Depends(get_current_user)):
    """
    Immediate Account Deletion & Data Purge (Section 12 DPDP / GDPR Art 17).
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id = ?", (user["id"],))
    conn.commit()
    conn.close()
    return {"message": "All personal identifiers, scans, findings, and account data permanently erased."}
