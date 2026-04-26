from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .db import init_db, close_db
from .api.routes.auth import router as auth_router
from .api.routes.portfolio import router as portfolio_router
from .api.routes.assets import router as assets_router
from .api.routes.holdings import router as holdings_router
from .api.routes.transactions import router as transactions_router
from .core.logging_config import setup_logging

app = FastAPI(
    title=settings.app_name,
    version="1.0.0"
)

setup_logging()  # Structured JSON logging to stdout

_extra_origins = [o.strip() for o in settings.cors_allowed_origins.split(",") if o.strip()]
_allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    *_extra_origins,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    # Matches any localhost/127.0.0.1 port (Vite dev server) plus any *.onrender.com deploy.
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://[a-z0-9-]+\.onrender\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(portfolio_router, prefix="/portfolios", tags=["portfolios"])
app.include_router(assets_router, prefix="/assets", tags=["assets"])
app.include_router(holdings_router, prefix="/portfolios/{portfolio_id}/holdings", tags=["holdings"])
app.include_router(transactions_router, prefix="/portfolios/{portfolio_id}/holdings/{holding_id}/transactions", tags=["transactions"])

@app.on_event("startup")
def on_startup():
    settings.validate_runtime()
    init_db()


@app.on_event("shutdown")
def on_shutdown():
    close_db()


@app.get("/health")
def health():
    return {"status": "ok", "debug": settings.debug}
