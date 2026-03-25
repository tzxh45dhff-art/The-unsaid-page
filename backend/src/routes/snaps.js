import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ── Snap a post (toggle) ──────────────────────────────────
router.post('/:postId', authenticate, async (req, res, next) => {
    try {
        const { postId } = req.params;

        // Check if already snapped
        const existing = await query(
            'SELECT id FROM snaps WHERE user_id = $1 AND post_id = $2',
            [req.user.id, postId]
        );

        if (existing.rows[0]) {
            // Un-snap
            await query('DELETE FROM snaps WHERE id = $1', [existing.rows[0].id]);
            await query('UPDATE posts SET snap_count = snap_count - 1 WHERE id = $1', [postId]);
            return res.json({ snapped: false });
        }

        // Snap
        await query(
            'INSERT INTO snaps (user_id, post_id) VALUES ($1, $2)',
            [req.user.id, postId]
        );
        await query('UPDATE posts SET snap_count = snap_count + 1 WHERE id = $1', [postId]);

        // Award points to the post author
        const post = await query('SELECT author_id FROM posts WHERE id = $1', [postId]);
        if (post.rows[0] && post.rows[0].author_id !== req.user.id) {
            await query(
                'INSERT INTO point_ledger (user_id, amount, reason, reference_id) VALUES ($1, 2, $2, $3)',
                [post.rows[0].author_id, 'snap_received', postId]
            );
            await query(
                'UPDATE users SET sanctuary_points = sanctuary_points + 2 WHERE id = $1',
                [post.rows[0].author_id]
            );
        }

        res.json({ snapped: true });
    } catch (err) {
        next(err);
    }
});

export default router;
