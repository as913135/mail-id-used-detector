import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from backend.database import get_db
from backend.auth import get_current_user

router = APIRouter(prefix="/api/consent", tags=["Consent Management"])

class GrantConsentRequest(BaseModel):
    finding_id: Optional[str] = None
    scope: str  # "scan", "opt_out_submission", "dpdp_legal_notice", "gdpr_erasure"
    approved_action: str

@router.post("")
def grant_consent(req: GrantConsentRequest, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    
    consent_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    cursor.execute(
        """INSERT INTO consent_records (id, user_id, finding_id, scope, approved_action, authorized_at, revoked)
           VALUES (?, ?, ?, ?, ?, ?, 0)""",
        (consent_id, user["id"], req.finding_id, req.scope, req.approved_action, now)
    )

    # Audit event
    cursor.execute(
        "INSERT INTO audit_events (id, user_id, action, details, timestamp) VALUES (?, ?, 'CONSENT_GRANTED', ?, ?)",
        (str(uuid.uuid4()), user["id"], f"Consent granted for {req.scope}: {req.approved_action}", now)
    )

    conn.commit()
    conn.close()

    return {
        "consent": {
            "id": consent_id,
            "finding_id": req.finding_id,
            "scope": req.scope,
            "approved_action": req.approved_action,
            "authorized_at": now,
            "revoked": 0
        }
    }

@router.get("")
def list_consents(user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT id, finding_id, scope, approved_action, authorized_at, revoked, revoked_at
           FROM consent_records WHERE user_id = ? ORDER BY authorized_at DESC""",
        (user["id"],)
    )
    rows = cursor.fetchall()
    conn.close()
    return {"consents": [dict(r) for r in rows]}

@router.post("/{consent_id}/revoke")
def revoke_consent(consent_id: str, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute(
        "UPDATE consent_records SET revoked = 1, revoked_at = ? WHERE id = ? AND user_id = ?",
        (now, consent_id, user["id"])
    )
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Consent record not found.")

    cursor.execute(
        "INSERT INTO audit_events (id, user_id, action, details, timestamp) VALUES (?, ?, 'CONSENT_REVOKED', ?, ?)",
        (str(uuid.uuid4()), user["id"], f"Consent {consent_id} revoked by user.", now)
    )
    conn.commit()
    conn.close()
    return {"message": "Consent successfully revoked."}
