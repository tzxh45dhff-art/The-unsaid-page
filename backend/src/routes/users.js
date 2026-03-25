import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ── Award reading points (auth required, once per post) ──
router.post('/me/read-complete', authenticate, async (req, res, next) => {
    try {
        const { post_id } = req.body;
        if (!post_id) return res.status(400).json({ error: 'post_id is required' });

        // Check if already awarded for this post
        const existing = await query(
            `SELECT id FROM point_ledger WHERE user_id = $1 AND reason = 'read_complete' AND reference_id = $2`,
            [req.user.id, post_id]
        );

        if (existing.rows[0]) {
            return res.json({ awarded: false, message: 'Already awarded for this post' });
        }

        await query(
            `INSERT INTO point_ledger (user_id, amount, reason, reference_id) VALUES ($1, 5, 'read_complete', $2)`,
            [req.user.id, post_id]
        );
        await query(
            `UPDATE users SET sanctuary_points = sanctuary_points + 5 WHERE id = $1`,
            [req.user.id]
        );

        res.json({ awarded: true, points: 5 });
    } catch (err) {
        next(err);
    }
});

// ── Bookmarks (auth required) ──
router.get('/me/bookmarks', authenticate, async (req, res, next) => {
    try {
        const result = await query(
            `SELECT p.id, p.title, p.slug, p.type, p.excerpt, p.reading_time_label, b.created_at AS bookmarked_at
             FROM bookmarks b JOIN posts p ON b.post_id = p.id
             WHERE b.user_id = $1
             ORDER BY b.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.post('/me/bookmarks', authenticate, async (req, res, next) => {
    try {
        const { post_id } = req.body;
        await query(
            'INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [req.user.id, post_id]
        );
        res.status(201).json({ bookmarked: true });
    } catch (err) {
        next(err);
    }
});

// ── User profile (public) ──
router.get('/:username', async (req, res, next) => {
    try {
        const result = await query(
            `SELECT id, username, display_name, avatar_url, sanctuary_points, created_at
             FROM users WHERE username = $1`,
            [req.params.username]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });

        const postsCount = await query(
            `SELECT COUNT(*) AS count FROM posts WHERE author_id = $1 AND status = 'published'`,
            [result.rows[0].id]
        );

        res.json({ ...result.rows[0], published_count: parseInt(postsCount.rows[0].count, 10) });
    } catch (err) {
        next(err);
    }
});

export default router;
