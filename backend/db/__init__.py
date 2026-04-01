from typing import Generator, Optional
import logging

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from fastapi import HTTPException

from ..core.config import settings

logger = logging.getLogger(__name__)

engine = None
SessionLocal = None
_db_available = False


def init_db() -> None:
	"""Initialize the DB engine and session factory. Safely handles invalid URLs or connection failures."""
	global engine, SessionLocal, _db_available
	database_url: Optional[str] = settings.database_url
	if not database_url:
		logger.warning("DATABASE_URL is not set; DB disabled.")
		_db_available = False
		return
	try:
		engine = create_engine(database_url, pool_pre_ping=True)
		SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
		# quick smoke-test the connection
		with engine.connect() as conn:
			conn.execute(text("SELECT 1"))
		_db_available = True
		logger.info("Database connection established.")
	except Exception as exc:
		_db_available = False
		logger.exception("Failed to initialize database: %s", exc)


def close_db() -> None:
	"""Dispose engine and mark DB unavailable."""
	global engine, _db_available
	if engine is not None:
		try:
			engine.dispose()
		except Exception:
			logger.exception("Error disposing DB engine")
	_db_available = False


def is_db_available() -> bool:
	return _db_available and SessionLocal is not None


def get_db() -> Generator[Session, None, None]:
	"""FastAPI dependency that yields a DB session or raises 503 if DB is unavailable."""
	if not is_db_available():
		raise HTTPException(status_code=503, detail="Database not available")
	db: Session = SessionLocal()
	try:
		yield db
	finally:
		db.close()


__all__ = ["init_db", "close_db", "get_db", "is_db_available"]
