import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, async (req, res, next) => {
    try {
        const result = await query(
            'SELECT form_state, updated_at FROM drafts WHERE user_id = $1',
            [req.user.id]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        next(err);
    }
});

router.put('/me', authenticate, async (req, res, next) => {
    try {
        const { form_state } = req.body;
        if (!form_state || typeof form_state !== 'object') {
            return res.status(400).json({ error: 'form_state object is required' });
        }

        const result = await query(
            `INSERT INTO drafts (user_id, form_state, updated_at)
             VALUES ($1, $2, now())
             ON CONFLICT (user_id)
             DO UPDATE SET form_state = EXCLUDED.form_state, updated_at = now()
             RETURNING form_state, updated_at`,
            [req.user.id, form_state]
        );
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.delete('/me', authenticate, async (req, res, next) => {
    try {
        await query('DELETE FROM drafts WHERE user_id = $1', [req.user.id]);
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

export default router;
