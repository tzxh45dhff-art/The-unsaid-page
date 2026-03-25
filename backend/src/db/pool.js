import pg from 'pg';
const { Pool } = pg;

// Use individual params to avoid URL-encoding issues with special chars in password
const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
    console.error('[DB Pool Error]', err.message);
});

// Convenience wrapper for parameterised queries
const query = (text, params) => pool.query(text, params);

export { pool, query };


