from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

import database
from auth_utils import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterBody(BaseModel):
    email: str
    username: str
    password: str
    display_name: Optional[str] = None


class LoginBody(BaseModel):
    email: str
    password: str


@router.post("/register", status_code=201)
async def register(body: RegisterBody):
    if not body.email or not body.username or not body.password:
        raise HTTPException(400, "email, username, and password are required")

    pw_hash = hash_password(body.password)
    try:
        row = await database.fetchrow(
            """INSERT INTO users (email, username, display_name, password_hash)
               VALUES ($1, $2, $3, $4)
               RETURNING id, email, username, display_name, sanctuary_points""",
            body.email, body.username, body.display_name or body.username, pw_hash,
        )
    except Exception as e:
        if "unique" in str(e).lower() or "23505" in str(e):
            raise HTTPException(409, "Email or username already taken")
        raise

    if not row:
        raise HTTPException(500, "Failed to create user")

    token = create_token(str(row["id"]), row["email"])
    return {"user": row, "token": token}


@router.post("/login")
async def login(body: LoginBody):
    if not body.email or not body.password:
        raise HTTPException(400, "email and password are required")

    row = await database.fetchrow("SELECT * FROM users WHERE email = $1", body.email)
    if not row or not row.get("password_hash"):
        raise HTTPException(401, "Invalid credentials")

    if not verify_password(body.password, row["password_hash"]):
        raise HTTPException(401, "Invalid credentials")

    user = {k: v for k, v in row.items() if k != "password_hash"}
    token = create_token(str(user["id"]), user["email"])
    return {"user": user, "token": token}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    row = await database.fetchrow(
        "SELECT id, email, username, display_name, avatar_url, sanctuary_points, created_at FROM users WHERE id = $1",
        current_user["id"],
    )
    if not row:
        raise HTTPException(404, "User not found")
    return row
