from fastapi import FastAPI
from .core.config import settings

app = FastAPI(
    title=settings.app_name,
    version="1.0.0"
)


@app.get("/health")
def health():
    return {"status": "ok", "debug": settings.debug}