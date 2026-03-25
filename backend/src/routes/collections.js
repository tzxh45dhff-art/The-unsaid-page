import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, async (req, res, next) => {
    try {
        const result = await query(
            `SELECT c.id, c.name, c.created_at, COUNT(ci.id)::INT AS item_count
             FROM collections c
             LEFT JOIN collection_items ci ON ci.collection_id = c.id
             WHERE c.user_id = $1
             GROUP BY c.id
             ORDER BY c.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.post('/me', authenticate, async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({ error: 'Collection name must be at least 2 characters' });
        }
        const result = await query(
            `INSERT INTO collections (user_id, name)
             VALUES ($1, $2)
             RETURNING *`,
            [req.user.id, name.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Collection name already exists' });
        }
        next(err);
    }
});

router.get('/me/:collectionId/items', authenticate, async (req, res, next) => {
    try {
        const { collectionId } = req.params;
        const result = await query(
            `SELECT p.id, p.slug, p.title, p.type, p.excerpt, p.cover_image_url, p.reading_time_label, ci.created_at AS added_at
             FROM collection_items ci
             JOIN collections c ON c.id = ci.collection_id
             JOIN posts p ON p.id = ci.post_id
             WHERE c.user_id = $1 AND c.id = $2
             ORDER BY ci.created_at DESC`,
            [req.user.id, collectionId]
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.post('/me/:collectionId/items', authenticate, async (req, res, next) => {
    try {
        const { collectionId } = req.params;
        const { post_id } = req.body;
        if (!post_id) return res.status(400).json({ error: 'post_id is required' });

        const ownCollection = await query(
            'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
            [collectionId, req.user.id]
        );
        if (!ownCollection.rows[0]) return res.status(404).json({ error: 'Collection not found' });

        await query(
            'INSERT INTO collection_items (collection_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [collectionId, post_id]
        );
        res.status(201).json({ added: true });
    } catch (err) {
        next(err);
    }
});

router.delete('/me/:collectionId/items/:postId', authenticate, async (req, res, next) => {
    try {
        const { collectionId, postId } = req.params;
        await query(
            `DELETE FROM collection_items
             WHERE collection_id = $1
             AND post_id = $2
             AND collection_id IN (SELECT id FROM collections WHERE user_id = $3)`,
            [collectionId, postId, req.user.id]
        );
        res.json({ removed: true });
    } catch (err) {
        next(err);
    }
});

export default router;
