/**
 * Database migration script.
 * Run with: npm run db:migrate
 *
 * Creates all tables for The Unsaid Page if they don't exist.
 */
import 'dotenv/config';
import { pool } from './pool.js';

const UP = `
-- ============================================================
--  USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT UNIQUE NOT NULL,
    username      TEXT UNIQUE NOT NULL,
    display_name  TEXT,
    password_hash TEXT,                           -- null for OAuth-only users
    avatar_url    TEXT,
    auth_provider TEXT DEFAULT 'email',            -- email | google | github
    sanctuary_points INT DEFAULT 0,
    is_admin      BOOLEAN DEFAULT false,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
--  POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    title             TEXT NOT NULL,
    slug              TEXT UNIQUE NOT NULL,
    body_markdown     TEXT NOT NULL,
    body_html         TEXT,
    type              TEXT CHECK (type IN ('poem', 'story', 'reflection')) NOT NULL,
    excerpt           TEXT,
    cover_image_url   TEXT,
    reading_time_sec  INT DEFAULT 0,
    reading_time_label TEXT,
    snap_count        INT DEFAULT 0,
    status            TEXT DEFAULT 'pending' CHECK (status IN ('draft','pending','published','rejected')),
    moderation_notes  TEXT,
    moods             TEXT[] DEFAULT '{}',
    tags              TEXT[] DEFAULT '{}',
    is_anonymous      BOOLEAN DEFAULT false,
    visibility        TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    published_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT now(),
    updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
--  SCHEMA UPDATES (Add missing columns to existing tables)
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS moods TEXT[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private'));

-- ============================================================
--  POST INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_author   ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status   ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_type     ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);

-- ============================================================
--  SNAPS  (one per user per post)
-- ============================================================
CREATE TABLE IF NOT EXISTS snaps (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, post_id)
);

-- ============================================================
--  ECHOES  (moderated comments)
-- ============================================================
CREATE TABLE IF NOT EXISTS echoes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
    body       TEXT NOT NULL CHECK (char_length(body) <= 500),
    status     TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','hidden')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_echoes_post ON echoes(post_id);

-- ============================================================
--  BOOKMARKS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, post_id)
);

-- ============================================================
--  DRAFTS  (auto-save snapshots)
-- ============================================================
CREATE TABLE IF NOT EXISTS drafts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    form_state  JSONB NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_drafts_user_unique ON drafts(user_id);

-- ============================================================
--  COLLECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS collections (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS collection_items (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id  UUID REFERENCES collections(id) ON DELETE CASCADE,
    post_id        UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at     TIMESTAMPTZ DEFAULT now(),
    UNIQUE(collection_id, post_id)
);

-- ============================================================
--  REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    target_type    TEXT NOT NULL CHECK (target_type IN ('post', 'echo')),
    target_id      UUID NOT NULL,
    reason         TEXT NOT NULL,
    status         TEXT DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
    created_at     TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
--  POINT LEDGER  (immutable audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS point_ledger (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    amount       INT NOT NULL,
    reason       TEXT NOT NULL CHECK (reason IN ('read_complete','submission','snap_received','echo_approved')),
    reference_id UUID,
    created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_user ON point_ledger(user_id);
`;

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('⏳ Running migrations...');
        await client.query(UP);
        console.log('✅ All tables created successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
