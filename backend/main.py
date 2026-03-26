"""
The Unsaid Page — FastAPI Backend
Run: uvicorn main:app --reload --port 8000
"""
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import settings
import database

# ── Route imports ──
from routes.auth import router as auth_router
from routes.posts import router as posts_router
from routes.snaps import router as snaps_router
from routes.echoes import router as echoes_router
from routes.users import router as users_router
from routes.drafts import router as drafts_router
from routes.collections import router as collections_router
from routes.prompts import router as prompts_router
from routes.moderation import router as moderation_router
from routes.penpals import router as penpals_router


# ── Lifespan (startup/shutdown) ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.get_pool()
    print(f"🖋️  The Unsaid Page API running on http://localhost:{settings.port}")
    yield
    await database.close_pool()


# ── App — redirect_slashes=False prevents 307 on /api/posts vs /api/posts/ ──
app = FastAPI(
    title="The Unsaid Page API",
    version="2.0.0",
    lifespan=lifespan,
    redirect_slashes=False,
)

# ── CORS — explicit localhost ports for Vite dev server ──
# ── CORS — explicit localhost ports for Vite dev server and regex for Vercel ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://the-unsaid-page.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rate Limiter — 100/15 min per IP ──
limiter = Limiter(key_func=get_remote_address, default_limits=["100/15minutes"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Mount Routers ──
app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(snaps_router)
app.include_router(echoes_router)
app.include_router(users_router)
app.include_router(drafts_router)
app.include_router(collections_router)
app.include_router(prompts_router)
app.include_router(moderation_router)
app.include_router(penpals_router)


import httpx

# ── Proxy Endpoint ──
@app.get("/api/proxy")
async def proxy(url: str):
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            response = await client.get(url)
            return JSONResponse(
                status_code=response.status_code,
                content={"text": response.text}
            )
    except Exception as e:
        return JSONResponse(status_code=502, content={"error": f"Proxy fetch failed: {str(e)}"})

# ── Health Check ──
@app.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


# ── Global Error Handler ──
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[ERROR] {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": str(exc) or "Internal Server Error"},
    )


# ── Run directly ──
if __name__ == "__main__":
    import uvicorn
    from pathlib import Path

    _base = str(Path(__file__).resolve().parent)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,
        reload_dirs=[_base],
        reload_includes=["*.py"],
        reload_excludes=[
            f"{_base}/.venv",
            f"{_base}/node_modules",
            f"{_base}/__pycache__",
            f"{_base}/src",
        ],
    )
