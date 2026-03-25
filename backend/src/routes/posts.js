import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

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

// ── Curated cover-image pools (royalty-free Unsplash) ──
const coverPool = {
    poem: [
        'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1478641300939-0ec5188d3802?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1428592953211-077101b2021b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504198322253-cfa87a0ff25f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=800&q=80',
    ],
    story: [
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517971129774-8a2b38fa128e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    ],
};

const pickCover = (type) => {
    const pool = coverPool[type] || coverPool.poem;
    return pool[Math.floor(Math.random() * pool.length)];
};

// ── List published posts (public, with optional type filter) ──
router.get('/', async (req, res, next) => {
    try {
        const { type, q, mood, tag } = req.query;
        let sql = `SELECT id, title, slug, type, excerpt, cover_image_url, reading_time_label, snap_count, published_at, moods, tags
                    FROM posts WHERE status = 'published' AND visibility = 'public'`;
        const params = [];
        let idx = 1;

        if (type && ['poem', 'story', 'reflection'].includes(type)) {
            sql += ` AND type = $${idx++}`;
            params.push(type);
        }
        if (q) {
            sql += ` AND (title ILIKE $${idx} OR body_markdown ILIKE $${idx} OR excerpt ILIKE $${idx})`;
            params.push(`%${q}%`);
            idx++;
        }
        if (mood) {
            sql += ` AND $${idx++} = ANY(moods)`;
            params.push(mood);
        }
        if (tag) {
            sql += ` AND $${idx++} = ANY(tags)`;
            params.push(tag);
        }

        sql += ` ORDER BY published_at DESC`;
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

// ── Get single post by slug (public) ──
router.get('/:slug', optionalAuth, async (req, res, next) => {
    try {
        const result = await query(
            `SELECT p.*, u.username AS author_name, u.display_name AS author_display
             FROM posts p LEFT JOIN users u ON p.author_id = u.id
             WHERE p.slug = $1 AND p.status = 'published'`,
            [req.params.slug]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Post not found' });
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// ── Create a new post (auth required) ──
router.post('/', optionalAuth, async (req, res, next) => {
    try {
        const { title, body_markdown, type, excerpt, cover_image_url, moods = [], tags = [], is_anonymous = false, visibility = 'public' } = req.body;
        if (!title || !body_markdown || !type) {
            return res.status(400).json({ error: 'title, body_markdown, and type are required' });
        }

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            + '-' + Date.now().toString(36);

        // Auto-calculate reading time (~200 wpm)
        const wordCount = body_markdown.split(/\s+/).length;
        const reading_time_sec = Math.ceil((wordCount / 200) * 60);
        const minutes = Math.ceil(reading_time_sec / 60);
        const reading_time_label = `${minutes} min read`;

        // Auto-assign a cover image if none was provided
        const finalCover = cover_image_url || pickCover(type);
        const isAuth = Boolean(req.user?.id);
        const finalVisibility = isAuth ? visibility : 'public';
        const finalStatus = isAuth ? 'published' : 'pending';
        const authorId = isAuth ? req.user.id : null;
        const normalizedMoods = Array.isArray(moods) ? moods.slice(0, 5) : [];
        const normalizedTags = Array.isArray(tags) ? tags.slice(0, 8) : [];

        const result = await query(
            `INSERT INTO posts (author_id, title, slug, body_markdown, type, excerpt, cover_image_url, reading_time_sec, reading_time_label, status, moods, tags, is_anonymous, visibility, published_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CASE WHEN $10 = 'published' THEN now() ELSE NULL END) RETURNING *`,
            [authorId, title, slug, body_markdown, type, excerpt || null, finalCover, reading_time_sec, reading_time_label, finalStatus, normalizedMoods, normalizedTags, Boolean(is_anonymous), finalVisibility]
        );

        // Auto-award 10 points for publishing
        const post = result.rows[0];
        if (isAuth && finalStatus === 'published') {
            await query(
                `INSERT INTO point_ledger (user_id, amount, reason, reference_id) VALUES ($1, 10, 'submission', $2)`,
                [req.user.id, post.id]
            );
            await query(
                `UPDATE users SET sanctuary_points = sanctuary_points + 10 WHERE id = $1`,
                [req.user.id]
            );
        }

        res.status(201).json(post);
    } catch (err) {
        next(err);
    }
});

// ── Moderate a post (admin-only placeholder) ──
router.patch('/:id/moderate', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const { status, moderation_notes } = req.body;
        if (!['published', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'status must be "published" or "rejected"' });
        }

        const existingPost = await query('SELECT id, status, author_id FROM posts WHERE id = $1', [req.params.id]);
        if (!existingPost.rows[0]) return res.status(404).json({ error: 'Post not found' });
        const previousStatus = existingPost.rows[0].status;

        const result = await query(
            `UPDATE posts SET status = $1, moderation_notes = $2, published_at = CASE WHEN $1 = 'published' THEN now() ELSE published_at END, updated_at = now()
             WHERE id = $3 RETURNING *`,
            [status, moderation_notes || null, req.params.id]
        );

        // Award points on publish
        if (status === 'published' && previousStatus !== 'published') {
            const post = result.rows[0];
            await query(
                `INSERT INTO point_ledger (user_id, amount, reason, reference_id) VALUES ($1, 10, 'submission', $2)`,
                [post.author_id, post.id]
            );
            await query(
                `UPDATE users SET sanctuary_points = sanctuary_points + 10 WHERE id = $1`,
                [post.author_id]
            );
        }

        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

export default router;
