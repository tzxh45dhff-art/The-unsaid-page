from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import database
from auth_utils import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


class ReadCompleteBody(BaseModel):
    post_id: str


class BookmarkBody(BaseModel):
    post_id: str


@router.post("/me/read-complete")
async def read_complete(body: ReadCompleteBody, current_user: dict = Depends(get_current_user)):
    if not body.post_id:
        raise HTTPException(400, "post_id is required")

    import uuid
    try:
        uuid.UUID(body.post_id)
    except ValueError:
        return {"awarded": False, "message": "Mock posts do not award points"}

    existing = await database.fetchrow(
        "SELECT id FROM point_ledger WHERE user_id = $1 AND reason = 'read_complete' AND reference_id = $2",
        current_user["id"], body.post_id,
    )
    if existing:
        return {"awarded": False, "message": "Already awarded for this post"}

    await database.execute(
        "INSERT INTO point_ledger (user_id, amount, reason, reference_id) VALUES ($1, 5, 'read_complete', $2)",
        current_user["id"], body.post_id,
    )
    await database.execute(
        "UPDATE users SET sanctuary_points = sanctuary_points + 5 WHERE id = $1",
        current_user["id"],
    )
    return {"awarded": True, "points": 5}


@router.get("/me/bookmarks")
async def get_bookmarks(current_user: dict = Depends(get_current_user)):
    rows = await database.query(
        """SELECT p.id, p.title, p.slug, p.type, p.excerpt, p.reading_time_label,
                  b.created_at AS bookmarked_at
           FROM bookmarks b JOIN posts p ON b.post_id = p.id
           WHERE b.user_id = $1
           ORDER BY b.created_at DESC""",
        current_user["id"],
    )
    return [dict(r) for r in rows]


@router.post("/me/bookmarks", status_code=201)
async def create_bookmark(body: BookmarkBody, current_user: dict = Depends(get_current_user)):
    await database.execute(
        "INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        current_user["id"], body.post_id,
    )
    return {"bookmarked": True}


@router.get("/{username}")
async def get_user_profile(username: str):
    row = await database.fetchrow(
        """SELECT id, username, display_name, avatar_url, sanctuary_points, created_at
           FROM users WHERE username = $1""",
        username,
    )
    if not row:
        raise HTTPException(404, "User not found")

    count = await database.fetchval(
        "SELECT COUNT(*) FROM posts WHERE author_id = $1 AND status = 'published'",
        row["id"],
    )
    result = dict(row)
    result["published_count"] = int(count)
    return result
