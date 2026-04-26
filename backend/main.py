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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    # Orice port pe localhost / 127.0.0.1 (Vite poate folosi 5173, 5174, etc.)
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
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
