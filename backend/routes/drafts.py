from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Any
import json

import database
from auth_utils import get_current_user

router = APIRouter(prefix="/api/drafts", tags=["drafts"])


class DraftBody(BaseModel):
    form_state: dict[str, Any]


@router.get("/me")
async def get_draft(current_user: dict = Depends(get_current_user)):
    row = await database.fetchrow(
        "SELECT form_state, updated_at FROM drafts WHERE user_id = $1",
        current_user["id"],
    )
    return row if row else None


@router.put("/me")
async def save_draft(body: DraftBody, current_user: dict = Depends(get_current_user)):
    if not body.form_state or not isinstance(body.form_state, dict):
        raise HTTPException(400, "form_state object is required")

    existing = await database.fetchrow(
        "SELECT id FROM drafts WHERE user_id = $1", current_user["id"]
    )
    if existing:
        row = await database.fetchrow(
            """UPDATE drafts SET form_state = $1, updated_at = now()
               WHERE user_id = $2
               RETURNING form_state, updated_at""",
            json.dumps(body.form_state), current_user["id"],
        )
    else:
        row = await database.fetchrow(
            """INSERT INTO drafts (user_id, form_state, updated_at)
               VALUES ($1, $2, now())
               RETURNING form_state, updated_at""",
            current_user["id"], json.dumps(body.form_state),
        )
    return row


@router.delete("/me")
async def delete_draft(current_user: dict = Depends(get_current_user)):
    await database.execute("DELETE FROM drafts WHERE user_id = $1", current_user["id"])
    return {"ok": True}
