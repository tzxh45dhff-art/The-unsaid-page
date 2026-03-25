from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from config import settings
import database

bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def _parse_expiry(expires_in: str) -> timedelta:
    unit = expires_in[-1]
    value = int(expires_in[:-1])
    if unit == "d":
        return timedelta(days=value)
    if unit == "h":
        return timedelta(hours=value)
    return timedelta(minutes=value)


def create_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + _parse_expiry(settings.jwt_expires_in)
    return jwt.encode(
        {"id": str(user_id), "email": email, "exp": expire},
        settings.jwt_secret,
        algorithm="HS256",
    )


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    """Dependency: require valid JWT."""
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    try:
        payload = decode_token(credentials.credentials)
        return {"id": payload["id"], "email": payload["email"]}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[dict]:
    """Dependency: optional JWT — returns None if no token."""
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        return {"id": payload["id"], "email": payload["email"]}
    except JWTError:
        return None


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency: require admin role."""
    row = await database.fetchrow("SELECT is_admin FROM users WHERE id = $1", current_user["id"])
    if not row or not row.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
