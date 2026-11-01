import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.database import get_db
from backend.auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(req: RegisterRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (req.email.lower().strip(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    user_id = str(uuid.uuid4())
    pw_hash = hash_password(req.password)
    now = datetime.utcnow().isoformat()
    
    cursor.execute(
        "INSERT INTO users (id, email, hashed_password, full_name, plan, created_at) VALUES (?, ?, ?, ?, 'free', ?)",
        (user_id, req.email.lower().strip(), pw_hash, req.full_name.strip(), now)
    )

    # Automatically add registered email as their first monitored identifier
    masked = req.email[0:2] + "***@" + req.email.split("@")[1]
    id_entry_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO identifiers (id, user_id, type, value, masked_value, verified, enabled, created_at) VALUES (?, ?, 'email', ?, ?, 1, 1, ?)",
        (id_entry_id, user_id, req.email.lower().strip(), masked, now)
    )
    
    # Audit event
    cursor.execute(
        "INSERT INTO audit_events (id, user_id, action, details, timestamp) VALUES (?, ?, 'USER_REGISTERED', ?, ?)",
        (str(uuid.uuid4()), user_id, f"User account created for {req.email}", now)
    )

    conn.commit()
    conn.close()

    token = create_token(user_id, req.email.lower().strip())
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": req.email.lower().strip(),
            "full_name": req.full_name.strip(),
            "plan": "free"
        }
    }

@router.post("/login")
def login(req: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, hashed_password, full_name, plan FROM users WHERE email = ?", (req.email.lower().strip(),))
    row = cursor.fetchone()
    
    if not row or not verify_password(req.password, row["hashed_password"]):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    user_id = row["id"]
    email = row["email"]
    full_name = row["full_name"]
    plan = row["plan"]

    # Audit login
    now = datetime.utcnow().isoformat()
    cursor.execute(
        "INSERT INTO audit_events (id, user_id, action, details, timestamp) VALUES (?, ?, 'USER_LOGIN', 'User logged in successfully', ?)",
        (str(uuid.uuid4()), user_id, now)
    )
    conn.commit()
    conn.close()

    token = create_token(user_id, email)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "plan": plan
        }
    }

@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    return {"user": user}
