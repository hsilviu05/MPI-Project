from fastapi import FastAPI
from .core.config import settings
from .db import init_db, close_db
from .api.routes.auth import router as auth_router
from .api.routes.portfolio import router as portfolio_router
from .api.routes.assets import router as assets_router
from .api.routes.holdings import router as holdings_router

app = FastAPI(
    title=settings.app_name,
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(portfolio_router, prefix="/portfolios", tags=["portfolios"])
app.include_router(assets_router, prefix="/assets", tags=["assets"])
app.include_router(holdings_router, prefix="/portfolios/{portfolio_id}/holdings", tags=["holdings"])

@app.on_event("startup")
def on_startup():
    init_db()


@app.on_event("shutdown")
def on_shutdown():
    close_db()


@app.get("/health")
def health():
    return {"status": "ok", "debug": settings.debug}