from fastapi import APIRouter, Depends
import database
from auth_utils import get_current_user

router = APIRouter(prefix="/api/snaps", tags=["snaps"])


@router.post("/{post_id}")
async def toggle_snap(post_id: str, current_user: dict = Depends(get_current_user)):
    existing = await database.fetchrow(
        "SELECT id FROM snaps WHERE user_id = $1 AND post_id = $2",
        current_user["id"], post_id,
    )

    if existing:
        # Un-snap
        await database.execute("DELETE FROM snaps WHERE id = $1", existing["id"])
        await database.execute("UPDATE posts SET snap_count = snap_count - 1 WHERE id = $1", post_id)
        return {"snapped": False}

    # Snap
    await database.execute(
        "INSERT INTO snaps (user_id, post_id) VALUES ($1, $2)",
        current_user["id"], post_id,
    )
    await database.execute("UPDATE posts SET snap_count = snap_count + 1 WHERE id = $1", post_id)

    # Award points to the post author
    post = await database.fetchrow("SELECT author_id FROM posts WHERE id = $1", post_id)
    if post and post["author_id"] and str(post["author_id"]) != current_user["id"]:
        await database.execute(
            "INSERT INTO point_ledger (user_id, amount, reason, reference_id) VALUES ($1, 2, 'snap_received', $2)",
            post["author_id"], post_id,
        )
        await database.execute(
            "UPDATE users SET sanctuary_points = sanctuary_points + 2 WHERE id = $1",
            post["author_id"],
        )

    return {"snapped": True}
