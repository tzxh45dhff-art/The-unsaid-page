import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

async function requireAdmin(req, res, next) {
    try {
        const result = await query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
        if (!result.rows[0]?.is_admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    } catch (err) {
        next(err);
    }
}

router.get('/queue', authenticate, requireAdmin, async (_req, res, next) => {
    try {
        const [posts, echoes, reports] = await Promise.all([
            query(`SELECT id, title, type, status, created_at FROM posts WHERE status = 'pending' ORDER BY created_at ASC`),
            query(`SELECT id, post_id, body, status, created_at FROM echoes WHERE status = 'pending' ORDER BY created_at ASC`),
            query(`SELECT id, target_type, target_id, reason, status, created_at FROM reports WHERE status = 'open' ORDER BY created_at ASC`),
        ]);
        res.json({ posts: posts.rows, echoes: echoes.rows, reports: reports.rows });
    } catch (err) {
        next(err);
    }
});

router.patch('/echoes/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['approved', 'hidden'].includes(status)) {
            return res.status(400).json({ error: 'status must be approved or hidden' });
        }
        const result = await query(
            'UPDATE echoes SET status = $1 WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Echo not found' });
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.post('/report', authenticate, async (req, res, next) => {
    try {
        const { target_type, target_id, reason } = req.body;
        if (!target_type || !target_id || !reason) {
            return res.status(400).json({ error: 'target_type, target_id, reason are required' });
        }
        if (!['post', 'echo'].includes(target_type)) {
            return res.status(400).json({ error: 'target_type must be post or echo' });
        }
        const result = await query(
            `INSERT INTO reports (reporter_id, target_type, target_id, reason)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.user.id, target_type, target_id, reason]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

export default router;
