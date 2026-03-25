import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ── List approved echoes for a post (public) ──
router.get('/:postId', async (req, res, next) => {
    try {
        const result = await query(
            `SELECT e.id, e.body, e.created_at, u.username, u.display_name
             FROM echoes e JOIN users u ON e.user_id = u.id
             WHERE e.post_id = $1 AND e.status = 'approved'
             ORDER BY e.created_at DESC`,
            [req.params.postId]
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

// ── Post a new echo (auth required, goes to moderation) ──
router.post('/:postId', authenticate, async (req, res, next) => {
    try {
        const { body } = req.body;
        if (!body || body.length > 500) {
            return res.status(400).json({ error: 'Echo must be 1–500 characters' });
        }

        const result = await query(
            'INSERT INTO echoes (user_id, post_id, body) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, req.params.postId, body]
        );

        res.status(201).json({ echo: result.rows[0], message: 'Your echo is pending moderation.' });
    } catch (err) {
        next(err);
    }
});

export default router;
