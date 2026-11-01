import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.database import get_db
from backend.auth import get_current_user

router = APIRouter(prefix="/api/identifiers", tags=["Identifiers"])

class AddIdentifierRequest(BaseModel):
    type: str  # email, phone, username, name
    value: str

def mask_val(val_type: str, val: str) -> str:
    clean = val.strip()
    if val_type == "email":
        if "@" in clean:
            parts = clean.split("@")
            return parts[0][:2] + "***@" + parts[1]
        return clean[:3] + "***"
    elif val_type == "phone":
        return clean[:3] + " **** " + clean[-4:] if len(clean) >= 7 else clean[:2] + "****"
    elif val_type == "username":
        return clean[:2] + "***" + clean[-1:] if len(clean) > 3 else clean
    return clean

@router.get("")
def list_identifiers(user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, type, value, masked_value, verified, enabled, created_at FROM identifiers WHERE user_id = ? ORDER BY created_at DESC",
        (user["id"],)
    )
    rows = cursor.fetchall()
    conn.close()
    return {"identifiers": [dict(r) for r in rows]}

@router.post("")
def add_identifier(req: AddIdentifierRequest, user: dict = Depends(get_current_user)):
    clean_val = req.value.strip()
    val_type = req.type.lower().strip()
    
    if val_type not in ["email", "phone", "username", "name"]:
        raise HTTPException(status_code=400, detail="Identifier type must be 'email', 'phone', 'username', or 'name'.")
    if not clean_val:
        raise HTTPException(status_code=400, detail="Identifier value cannot be empty.")

    masked = mask_val(val_type, clean_val)
    conn = get_db()
    cursor = conn.cursor()
    
    # Check duplicate
    cursor.execute("SELECT id FROM identifiers WHERE user_id = ? AND type = ? AND value = ?", (user["id"], val_type, clean_val))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="This identifier is already in your monitoring list.")

    now = datetime.utcnow().isoformat()
    id_entry_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO identifiers (id, user_id, type, value, masked_value, verified, enabled, created_at) VALUES (?, ?, ?, ?, ?, 1, 1, ?)",
        (id_entry_id, user["id"], val_type, clean_val, masked, now)
    )

    cursor.execute(
        "INSERT INTO audit_events (id, user_id, action, details, timestamp) VALUES (?, ?, 'IDENTIFIER_ADDED', ?, ?)",
        (str(uuid.uuid4()), user["id"], f"Added {val_type}: {masked}", now)
    )
    conn.commit()
    conn.close()

    return {
        "identifier": {
            "id": id_entry_id,
            "type": val_type,
            "value": clean_val,
            "masked_value": masked,
            "verified": 1,
            "enabled": 1,
            "created_at": now
        }
    }

@router.delete("/{identifier_id}")
def delete_identifier(identifier_id: str, user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, type, masked_value FROM identifiers WHERE id = ? AND user_id = ?", (identifier_id, user["id"]))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Identifier not found.")

    cursor.execute("DELETE FROM identifiers WHERE id = ?", (identifier_id,))
    now = datetime.utcnow().isoformat()
    cursor.execute(
        "INSERT INTO audit_events (id, user_id, action, details, timestamp) VALUES (?, ?, 'IDENTIFIER_REMOVED', ?, ?)",
        (str(uuid.uuid4()), user["id"], f"Deleted {row['type']}: {row['masked_value']}", now)
    )
    conn.commit()
    conn.close()
    return {"message": "Identifier removed successfully from monitoring."}
