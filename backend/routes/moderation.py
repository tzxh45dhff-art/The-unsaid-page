from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import database
from auth_utils import get_current_user, require_admin

router = APIRouter(prefix="/api/moderation", tags=["moderation"])


class ModeratEchoBody(BaseModel):
    status: str


class ReportBody(BaseModel):
    target_type: str
    target_id: str
    reason: str


@router.get("/queue")
async def moderation_queue(admin: dict = Depends(require_admin)):
    posts = await database.query(
        "SELECT id, title, type, status, created_at FROM posts WHERE status = 'pending' ORDER BY created_at ASC"
    )
    echoes = await database.query(
        "SELECT id, post_id, body, status, created_at FROM echoes WHERE status = 'pending' ORDER BY created_at ASC"
    )
    reports = await database.query(
        "SELECT id, target_type, target_id, reason, status, created_at FROM reports WHERE status = 'open' ORDER BY created_at ASC"
    )
    return {
        "posts": [dict(r) for r in posts],
        "echoes": [dict(r) for r in echoes],
        "reports": [dict(r) for r in reports],
    }


@router.patch("/echoes/{echo_id}")
async def moderate_echo(echo_id: str, body: ModeratEchoBody, admin: dict = Depends(require_admin)):
    if body.status not in ("approved", "hidden"):
        raise HTTPException(400, "status must be approved or hidden")
    row = await database.fetchrow(
        "UPDATE echoes SET status = $1 WHERE id = $2 RETURNING *",
        body.status, echo_id,
    )
    if not row:
        raise HTTPException(404, "Echo not found")
    return dict(row)


@router.post("/report", status_code=201)
async def file_report(body: ReportBody, current_user: dict = Depends(get_current_user)):
    if not body.target_type or not body.target_id or not body.reason:
        raise HTTPException(400, "target_type, target_id, reason are required")
    if body.target_type not in ("post", "echo"):
        raise HTTPException(400, "target_type must be post or echo")

    row = await database.fetchrow(
        """INSERT INTO reports (reporter_id, target_type, target_id, reason)
           VALUES ($1, $2, $3, $4) RETURNING *""",
        current_user["id"], body.target_type, body.target_id, body.reason,
    )
    return dict(row)
