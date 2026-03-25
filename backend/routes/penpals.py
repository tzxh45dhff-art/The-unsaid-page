"""
Pen Pals routes — friendships, sparks, and real-time chat messages.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import database
from auth_utils import get_current_user

router = APIRouter(prefix="/api/penpals", tags=["penpals"])


# ── Pydantic Models ──

class FriendRequest(BaseModel):
    username: str

class SparkCreate(BaseModel):
    friend_id: str
    prompt_text: str
    draft_type: str = "poem"

class MessageCreate(BaseModel):
    friendship_id: str
    content: str


# ═══════════════════════════════════════════════
# FRIENDSHIPS
# ═══════════════════════════════════════════════

@router.get("/")
@router.get("")
async def get_friends(current_user: dict = Depends(get_current_user)):
    """Get all accepted friends for the current user."""
    user_id = current_user["id"]
    friends = await database.query(
        """
        SELECT u.id, u.username, u.display_name, u.avatar_url, f.id as friendship_id
        FROM friendships f
        JOIN users u ON (
            CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END = u.id
        )
        WHERE (f.user_id = $1 OR f.friend_id = $1)
          AND f.status = 'accepted'
        """,
        user_id
    )
    return friends


@router.get("/pending")
async def get_pending_requests(current_user: dict = Depends(get_current_user)):
    """Get incoming pending friend requests."""
    user_id = current_user["id"]
    requests = await database.query(
        """
        SELECT f.id as request_id, u.id as user_id, u.username,
               u.display_name, u.avatar_url, f.created_at
        FROM friendships f
        JOIN users u ON f.user_id = u.id
        WHERE f.friend_id = $1 AND f.status = 'pending'
        ORDER BY f.created_at DESC
        """,
        user_id
    )
    return requests


@router.post("/request")
async def send_friend_request(body: FriendRequest, current_user: dict = Depends(get_current_user)):
    """Send a friend request by username."""
    target = await database.fetchrow(
        "SELECT id, username FROM users WHERE LOWER(username) = LOWER($1)",
        body.username.strip()
    )
    if not target:
        raise HTTPException(404, detail="User not found")

    if str(target["id"]) == str(current_user["id"]):
        raise HTTPException(400, detail="Cannot add yourself")

    existing = await database.fetchrow(
        """
        SELECT status FROM friendships
        WHERE (user_id = $1 AND friend_id = $2)
           OR (user_id = $2 AND friend_id = $1)
        """,
        current_user["id"], target["id"]
    )
    if existing:
        raise HTTPException(400, detail=f"Already connected (status: {existing['status']})")

    await database.execute(
        "INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, 'pending')",
        current_user["id"], target["id"]
    )
    return {"message": f"Friend request sent to @{target['username']}"}


@router.post("/accept/{user_id}")
async def accept_request(user_id: str, current_user: dict = Depends(get_current_user)):
    """Accept a pending friend request."""
    result = await database.execute(
        """
        UPDATE friendships SET status = 'accepted'
        WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'
        """,
        user_id, current_user["id"]
    )
    if "UPDATE 0" in result:
        raise HTTPException(404, detail="No pending request found")
    return {"message": "Request accepted"}


@router.post("/reject/{user_id}")
async def reject_request(user_id: str, current_user: dict = Depends(get_current_user)):
    """Reject a request or remove a friend."""
    result = await database.execute(
        """
        DELETE FROM friendships
        WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
        """,
        user_id, current_user["id"]
    )
    if "DELETE 0" in result:
        raise HTTPException(404, detail="Relationship not found")
    return {"message": "Removed successfully"}


# ═══════════════════════════════════════════════
# SPARKS
# ═══════════════════════════════════════════════

@router.get("/sparks")
async def get_sparks(current_user: dict = Depends(get_current_user)):
    """Get all sparks received by the current user."""
    sparks = await database.query(
        """
        SELECT s.id, s.prompt_text, s.draft_type, s.status, s.created_at,
               u.id as sender_id, u.username as sender_username, u.display_name as sender_name
        FROM sparks s
        JOIN users u ON s.sender_id = u.id
        WHERE s.receiver_id = $1
        ORDER BY s.created_at DESC
        """,
        current_user["id"]
    )
    return sparks


@router.post("/sparks")
async def send_spark(body: SparkCreate, current_user: dict = Depends(get_current_user)):
    """Send a writing spark to a friend."""
    is_friend = await database.fetchrow(
        """
        SELECT id FROM friendships
        WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
          AND status = 'accepted'
        """,
        current_user["id"], body.friend_id
    )
    if not is_friend:
        raise HTTPException(403, detail="Can only send sparks to accepted friends")

    await database.execute(
        """
        INSERT INTO sparks (sender_id, receiver_id, prompt_text, draft_type, status)
        VALUES ($1, $2, $3, $4, 'unread')
        """,
        current_user["id"], body.friend_id, body.prompt_text, body.draft_type
    )
    return {"message": "Spark sent!"}


@router.post("/sparks/{spark_id}/read")
async def mark_spark_read(spark_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a spark as read."""
    await database.execute(
        "UPDATE sparks SET status = 'read' WHERE id = $1 AND receiver_id = $2",
        spark_id, current_user["id"]
    )
    return {"message": "Marked as read"}


# ═══════════════════════════════════════════════
# CHAT MESSAGES
# ═══════════════════════════════════════════════

@router.get("/messages/{friendship_id}")
async def get_messages(friendship_id: str, current_user: dict = Depends(get_current_user)):
    """Get messages for a friendship chat. Only participants can read."""
    # Verify the user is part of this friendship
    friendship = await database.fetchrow(
        """
        SELECT id FROM friendships
        WHERE id = $1
          AND (user_id = $2 OR friend_id = $2)
          AND status = 'accepted'
        """,
        friendship_id, current_user["id"]
    )
    if not friendship:
        raise HTTPException(403, detail="Not part of this conversation")

    messages = await database.query(
        """
        SELECT m.id, m.sender_id, m.content, m.created_at,
               u.username as sender_username, u.display_name as sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.friendship_id = $1
        ORDER BY m.created_at ASC
        LIMIT 100
        """,
        friendship_id
    )
    return messages


@router.post("/messages")
async def send_message(body: MessageCreate, current_user: dict = Depends(get_current_user)):
    """Send a chat message to a pen pal."""
    if not body.content.strip():
        raise HTTPException(400, detail="Message cannot be empty")

    # Verify the user is part of this friendship
    friendship = await database.fetchrow(
        """
        SELECT id FROM friendships
        WHERE id = $1
          AND (user_id = $2 OR friend_id = $2)
          AND status = 'accepted'
        """,
        body.friendship_id, current_user["id"]
    )
    if not friendship:
        raise HTTPException(403, detail="Not part of this conversation")

    row = await database.fetchrow(
        """
        INSERT INTO messages (friendship_id, sender_id, content)
        VALUES ($1, $2, $3)
        RETURNING id, created_at
        """,
        body.friendship_id, current_user["id"], body.content.strip()
    )
    return {
        "id": str(row["id"]),
        "sender_id": current_user["id"],
        "content": body.content.strip(),
        "created_at": str(row["created_at"]),
        "message": "Message sent"
    }
