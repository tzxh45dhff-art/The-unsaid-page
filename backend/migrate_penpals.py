import asyncio
import psycopg
from config import settings

DB_CONN = (
    f"host={settings.db_host} "
    f"port={settings.db_port} "
    f"dbname={settings.db_name} "
    f"user={settings.db_user} "
    f"password={settings.db_password} "
    f"sslmode=require"
)

async def run_migrations():
    try:
        async with await psycopg.AsyncConnection.connect(DB_CONN, autocommit=True) as conn:
            async with conn.cursor() as cur:
                # Friendships Table
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS friendships (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        status VARCHAR(20) NOT NULL DEFAULT 'pending',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE (user_id, friend_id)
                    )
                """)
                print("Created friendships table.")

                # Sparks (Prompts) Table
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS sparks (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        prompt_text TEXT NOT NULL,
                        draft_type VARCHAR(20) NOT NULL DEFAULT 'poem',
                        status VARCHAR(20) NOT NULL DEFAULT 'unread',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                print("Created sparks table.")

        print("✅ Migrations complete.")
    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    asyncio.run(run_migrations())
