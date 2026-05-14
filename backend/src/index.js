import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import snapRoutes from './routes/snaps.js';
import echoRoutes from './routes/echoes.js';
import userRoutes from './routes/users.js';
import draftRoutes from './routes/drafts.js';
import collectionRoutes from './routes/collections.js';
import promptRoutes from './routes/prompts.js';
import moderationRoutes from './routes/moderation.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// Rate limiter — 100 requests per 15 min per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/snaps', snapRoutes);
app.use('/api/echoes', echoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/moderation', moderationRoutes);

// Proxy for fetching book content (avoids CORS)
app.get('/api/proxy', async (req, res, next) => {
    try {
        const targetUrl = req.query.url;
        if (!targetUrl) return res.status(400).json({ error: 'url parameter is required' });
        
        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error(`Proxy fetch failed: ${response.statusText}`);
        
        const contentType = response.headers.get('content-type');
        const text = await response.text();
        
        res.setHeader('Content-Type', contentType || 'text/plain');
        res.send(text);
    } catch (err) {
        next(err);
    }
});

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global Error Handler ───────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('[ERROR]', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});

app.listen(PORT, () => {
    console.log(`🖋️  The Unsaid Page API running on http://localhost:${PORT}`);
});

export default app;
