"""
Database module using psycopg3 (async) for PostgreSQL.
Converts $1, $2 style placeholders to psycopg %(p1)s style.
"""
import re
from typing import Any, Optional

import psycopg
from psycopg.rows import dict_row

from config import settings


def _get_conninfo() -> str:
    return (
        f"host={settings.db_host} "
        f"port={settings.db_port} "
        f"dbname={settings.db_name} "
        f"user={settings.db_user} "
        f"password={settings.db_password} "
        f"sslmode=require"
    )


def _convert_placeholders(sql: str, args: tuple) -> tuple[str, dict]:
    """
    Convert $1, $2 ... placeholders to %(p1)s, %(p2)s ... for psycopg.
    Returns (converted_sql, params_dict).
    """
    if not args:
        return sql, {}

    params: dict[str, Any] = {}
    # Find all $N in the SQL
    found = set(int(m) for m in re.findall(r'\$(\d+)', sql))
    if not found:
        return sql, {}

    for i in range(max(found), 0, -1):
        sql = sql.replace(f'${i}', f'%(p{i})s')
        if i <= len(args):
            params[f'p{i}'] = args[i - 1]

    return sql, params


async def get_pool():
    """Verify DB connectivity on startup."""
    try:
        async with await psycopg.AsyncConnection.connect(
            _get_conninfo(), autocommit=True
        ) as conn:
            await conn.execute("SELECT 1")
        print("✅ Database connection verified")
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")


async def close_pool():
    """No-op — we use per-request connections."""
    pass


async def query(sql: str, *args: Any) -> list[dict]:
    """Run a query and return list of dicts."""
    converted_sql, params = _convert_placeholders(sql, args)
    async with await psycopg.AsyncConnection.connect(
        _get_conninfo(), row_factory=dict_row, autocommit=True
    ) as conn:
        async with conn.cursor() as cur:
            await cur.execute(converted_sql, params or None)
            if cur.description:
                return [dict(row) for row in await cur.fetchall()]
            return []


async def execute(sql: str, *args: Any) -> str:
    """Run a statement (INSERT/UPDATE/DELETE)."""
    converted_sql, params = _convert_placeholders(sql, args)
    async with await psycopg.AsyncConnection.connect(
        _get_conninfo(), autocommit=True
    ) as conn:
        async with conn.cursor() as cur:
            await cur.execute(converted_sql, params or None)
            return cur.statusmessage or ""


async def fetchrow(sql: str, *args: Any) -> Optional[dict]:
    """Fetch a single row or None."""
    converted_sql, params = _convert_placeholders(sql, args)
    async with await psycopg.AsyncConnection.connect(
        _get_conninfo(), row_factory=dict_row, autocommit=True
    ) as conn:
        async with conn.cursor() as cur:
            await cur.execute(converted_sql, params or None)
            if cur.description:
                row = await cur.fetchone()
                return dict(row) if row else None
            return None


async def fetchval(sql: str, *args: Any) -> Any:
    """Fetch a single value from a single row."""
    converted_sql, params = _convert_placeholders(sql, args)
    async with await psycopg.AsyncConnection.connect(
        _get_conninfo(), autocommit=True
    ) as conn:
        async with conn.cursor() as cur:
            await cur.execute(converted_sql, params or None)
            row = await cur.fetchone()
            return row[0] if row else None
