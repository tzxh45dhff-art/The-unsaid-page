import re
import math
import time
import random
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional

import database
from auth_utils import get_current_user, get_optional_user, require_admin

router = APIRouter(prefix="/api/posts", tags=["posts"])

# ── Curated cover-image pools ──
COVER_POOL = {
    "poem": [
        "https://images.unsplash.com/photo-1473186505569-9c61870c11f9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1478641300939-0ec5188d3802?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?auto=format&fit=crop&w=800&q=80",
    ],
    "story": [
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80",
    ],
}


def pick_cover(post_type: str) -> str:
    pool = COVER_POOL.get(post_type, COVER_POOL["poem"])
    return random.choice(pool)


# ── List published posts ──
@router.get("")
async def list_posts(
    type: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    mood: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
):
    sql = """SELECT id, title, slug, type, excerpt, cover_image_url,
                    reading_time_label, snap_count, published_at, moods, tags
             FROM posts WHERE status = 'published' AND visibility = 'public'"""
    params: list = []
    idx = 1

    if type and type in ("poem", "story", "reflection"):
        sql += f" AND type = ${idx}"
        params.append(type)
        idx += 1
    if q:
        sql += f" AND (title ILIKE ${idx} OR body_markdown ILIKE ${idx} OR excerpt ILIKE ${idx})"
        params.append(f"%{q}%")
        idx += 1
    if mood:
        sql += f" AND ${idx} = ANY(moods)"
        params.append(mood)
        idx += 1
    if tag:
        sql += f" AND ${idx} = ANY(tags)"
        params.append(tag)
        idx += 1

    sql += " ORDER BY published_at DESC"
    rows = await database.query(sql, *params)
    return rows


# ── Get single post by slug ──
@router.get("/{slug}")
async def get_post(slug: str, user: Optional[dict] = Depends(get_optional_user)):
    row = await database.fetchrow(
        """SELECT p.*, u.username AS author_name, u.display_name AS author_display
           FROM posts p LEFT JOIN users u ON p.author_id = u.id
           WHERE p.slug = $1 AND p.status = 'published'""",
        slug,
    )
    if not row:
        raise HTTPException(404, "Post not found")
    return row


# ── Create a new post ──
class CreatePostBody(BaseModel):
    title: str
    body_markdown: str
    type: str
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    moods: list[str] = []
    tags: list[str] = []
    is_anonymous: bool = False
    visibility: str = "public"


@router.post("", status_code=201)
async def create_post(body: CreatePostBody, user: Optional[dict] = Depends(get_optional_user)):
    if not body.title or not body.body_markdown or not body.type:
        raise HTTPException(400, "title, body_markdown, and type are required")

    slug = re.sub(r"[^a-z0-9]+", "-", body.title.lower()).strip("-")
    slug += "-" + format(int(time.time()), "x")

    word_count = len(body.body_markdown.split())
    reading_time_sec = math.ceil((word_count / 200) * 60)
    minutes = math.ceil(reading_time_sec / 60)
    reading_time_label = f"{minutes} min read"

    final_cover = body.cover_image_url or pick_cover(body.type)
    final_visibility = body.visibility if user else "public"
    final_status = "published" if user else "pending"
    author_id = user.get("id") if user else None
    normalized_moods = list(body.moods[:5]) if body.moods else []
    normalized_tags = list(body.tags[:8]) if body.tags else []

    row = await database.fetchrow(
        """INSERT INTO posts (author_id, title, slug, body_markdown, type, excerpt,
                              cover_image_url, reading_time_sec, reading_time_label,
                              status, moods, tags, is_anonymous, visibility,
                              published_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                   CASE WHEN $10 = 'published' THEN now() ELSE NULL END)
           RETURNING *""",
        author_id, body.title, slug, body.body_markdown, body.type,
        body.excerpt, final_cover, reading_time_sec, reading_time_label,
        final_status, normalized_moods, normalized_tags,
        body.is_anonymous, final_visibility,
    )

    # Award 10 points for publishing
    if user and final_status == "published":
        await database.execute(
            "INSERT INTO point_ledger (user_id, amount, reason, reference_id) VALUES ($1, 10, 'submission', $2)",
            user["id"], row["id"],
        )
        await database.execute(
            "UPDATE users SET sanctuary_points = sanctuary_points + 10 WHERE id = $1",
            user["id"],
        )

    return row


# ── Get my works ──
@router.get("/me/works")
async def get_my_works(user: dict = Depends(get_current_user)):
    sql = """SELECT id, title, slug, type, excerpt, cover_image_url,
                    reading_time_label, snap_count, published_at, created_at, moods, tags, status
             FROM posts WHERE author_id = $1 ORDER BY created_at DESC"""
    rows = await database.query(sql, user["id"])
    return rows


# ── Delete a post ──
@router.delete("/{post_id}")
async def delete_post(post_id: str, user: dict = Depends(get_current_user)):
    row = await database.fetchrow(
        "DELETE FROM posts WHERE id = $1 AND author_id = $2 RETURNING id",
        post_id, user["id"]
    )
    if not row:
        raise HTTPException(404, "Post not found or unauthorized to delete")
    return {"deleted": True, "id": post_id}


# ── Moderate a post (admin only) ──
class ModerateBody(BaseModel):
    status: str
    moderation_notes: Optional[str] = None


@router.patch("/{post_id}/moderate")
async def moderate_post(post_id: str, body: ModerateBody, admin: dict = Depends(require_admin)):
    if body.status not in ("published", "rejected"):
        raise HTTPException(400, 'status must be "published" or "rejected"')

    existing = await database.fetchrow("SELECT id, status, author_id FROM posts WHERE id = $1", post_id)
    if not existing:
        raise HTTPException(404, "Post not found")
    previous_status = existing["status"]

    row = await database.fetchrow(
        """UPDATE posts SET status = $1, moderation_notes = $2,
              published_at = CASE WHEN $1 = 'published' THEN now() ELSE published_at END,
              updated_at = now()
           WHERE id = $3 RETURNING *""",
        body.status, body.moderation_notes, post_id,
    )

    if body.status == "published" and previous_status != "published":
        if row and row.get("author_id"):
            await database.execute(
                "INSERT INTO point_ledger (user_id, amount, reason, reference_id) VALUES ($1, 10, 'submission', $2)",
                row["author_id"], row["id"],
            )
            await database.execute(
                "UPDATE users SET sanctuary_points = sanctuary_points + 10 WHERE id = $1",
                row["author_id"],
            )

    return row
