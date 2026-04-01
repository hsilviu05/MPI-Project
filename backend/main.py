from fastapi import FastAPI
from .core.config import settings
from .db import init_db, close_db


app = FastAPI(
    title=settings.app_name,
    version="1.0.0"
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.on_event("shutdown")
def on_shutdown():
    close_db()


@app.get("/health")
def health():
    return {"status": "ok", "debug": settings.debug}