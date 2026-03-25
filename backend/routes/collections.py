from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import database
from auth_utils import get_current_user

router = APIRouter(prefix="/api/collections", tags=["collections"])


class CreateCollectionBody(BaseModel):
    name: str


class AddItemBody(BaseModel):
    post_id: str


@router.get("/me")
async def list_collections(current_user: dict = Depends(get_current_user)):
    rows = await database.query(
        """SELECT c.id, c.name, c.created_at, COUNT(ci.id)::INT AS item_count
           FROM collections c
           LEFT JOIN collection_items ci ON ci.collection_id = c.id
           WHERE c.user_id = $1
           GROUP BY c.id
           ORDER BY c.created_at DESC""",
        current_user["id"],
    )
    return [dict(r) for r in rows]


@router.post("/me", status_code=201)
async def create_collection(body: CreateCollectionBody, current_user: dict = Depends(get_current_user)):
    if not body.name or len(body.name.strip()) < 2:
        raise HTTPException(400, "Collection name must be at least 2 characters")
    try:
        row = await database.fetchrow(
            "INSERT INTO collections (user_id, name) VALUES ($1, $2) RETURNING *",
            current_user["id"], body.name.strip(),
        )
        return dict(row)
    except Exception as e:
        if "23505" in str(e) or "unique" in str(e).lower():
            raise HTTPException(409, "Collection name already exists")
        raise


@router.get("/me/{collection_id}/items")
async def list_collection_items(collection_id: str, current_user: dict = Depends(get_current_user)):
    rows = await database.query(
        """SELECT p.id, p.slug, p.title, p.type, p.excerpt, p.cover_image_url,
                  p.reading_time_label, ci.created_at AS added_at
           FROM collection_items ci
           JOIN collections c ON c.id = ci.collection_id
           JOIN posts p ON p.id = ci.post_id
           WHERE c.user_id = $1 AND c.id = $2
           ORDER BY ci.created_at DESC""",
        current_user["id"], collection_id,
    )
    return [dict(r) for r in rows]


@router.post("/me/{collection_id}/items", status_code=201)
async def add_collection_item(
    collection_id: str, body: AddItemBody, current_user: dict = Depends(get_current_user)
):
    if not body.post_id:
        raise HTTPException(400, "post_id is required")

    import uuid
    target_post_id = body.post_id
    try:
        uuid.UUID(body.post_id)
    except ValueError:
        # It's a slug, look up the UUID
        row = await database.fetchrow("SELECT id FROM posts WHERE slug = $1", body.post_id)
        if not row:
            raise HTTPException(404, "Post not found")
        target_post_id = row["id"]

    own = await database.fetchrow(
        "SELECT id FROM collections WHERE id = $1 AND user_id = $2",
        collection_id, current_user["id"],
    )
    if not own:
        raise HTTPException(404, "Collection not found")

    await database.execute(
        "INSERT INTO collection_items (collection_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        collection_id, target_post_id,
    )
    return {"added": True}


@router.delete("/me/{collection_id}")
async def delete_collection(collection_id: str, current_user: dict = Depends(get_current_user)):
    # First delete items if no cascade (safe bet)
    await database.execute("DELETE FROM collection_items WHERE collection_id = $1", collection_id)
    # Delete the collection itself
    await database.execute(
        "DELETE FROM collections WHERE id = $1 AND user_id = $2",
        collection_id, current_user["id"]
    )
    return {"deleted": True}


@router.delete("/me/{collection_id}/items/{post_id}")
async def remove_collection_item(
    collection_id: str, post_id: str, current_user: dict = Depends(get_current_user)
):
    import uuid
    target_post_id = post_id
    try:
        uuid.UUID(post_id)
    except ValueError:
        row = await database.fetchrow("SELECT id FROM posts WHERE slug = $1", post_id)
        if not row:
            raise HTTPException(404, "Post not found")
        target_post_id = row["id"]

    await database.execute(
        """DELETE FROM collection_items
           WHERE collection_id = $1
           AND post_id = $2
           AND collection_id IN (SELECT id FROM collections WHERE user_id = $3)""",
        collection_id, target_post_id, current_user["id"],
    )
    return {"removed": True}
