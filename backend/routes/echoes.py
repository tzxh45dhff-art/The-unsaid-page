from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import database
from auth_utils import get_current_user

router = APIRouter(prefix="/api/echoes", tags=["echoes"])


class EchoBody(BaseModel):
    body: str


@router.get("/{post_id}")
async def list_echoes(post_id: str):
    rows = await database.query(
        """SELECT e.id, e.body, e.created_at, u.username, u.display_name
           FROM echoes e JOIN users u ON e.user_id = u.id
           WHERE e.post_id = $1 AND e.status = 'approved'
           ORDER BY e.created_at DESC""",
        post_id,
    )
    return [dict(r) for r in rows]


@router.post("/{post_id}", status_code=201)
async def create_echo(post_id: str, body: EchoBody, current_user: dict = Depends(get_current_user)):
    if not body.body or len(body.body) > 500:
        raise HTTPException(400, "Echo must be 1–500 characters")

    row = await database.fetchrow(
        "INSERT INTO echoes (user_id, post_id, body) VALUES ($1, $2, $3) RETURNING *",
        current_user["id"], post_id, body.body,
    )
    return {"echo": dict(row), "message": "Your echo is pending moderation."}
