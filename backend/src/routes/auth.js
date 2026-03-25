import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ── Register ───────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password, display_name } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({ error: 'email, username, and password are required' });
        }

        const password_hash = await bcrypt.hash(password, 12);
        const result = await query(
            `INSERT INTO users (email, username, display_name, password_hash)
             VALUES ($1, $2, $3, $4) RETURNING id, email, username, display_name, sanctuary_points`,
            [email, username, display_name || username, password_hash]
        );

        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({ user, token });
    } catch (err) {
        if (err.code === '23505') { // unique violation
            return res.status(409).json({ error: 'Email or username already taken' });
        }
        next(err);
    }
});

// ── Login ──────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }

        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || !user.password_hash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        const { password_hash, ...safeUser } = user;
        res.json({ user: safeUser, token });
    } catch (err) {
        next(err);
    }
});

// ── Get current user ───────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const result = await query(
            'SELECT id, email, username, display_name, avatar_url, sanctuary_points, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

export default router;
