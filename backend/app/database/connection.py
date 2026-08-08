"""
Neon PostgreSQL connection setup using SQLAlchemy.

The app is designed to run even if DATABASE_URL is not configured -
in that case, persistence features (alert/history logging) are skipped
gracefully rather than crashing the whole API.
"""
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import Config

Base = declarative_base()

_engine = None
_SessionLocal = None


def get_engine():
    global _engine
    if _engine is None and Config.DATABASE_URL:
        _engine = create_engine(
            Config.DATABASE_URL,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=5,
        )
    return _engine


def get_session_factory():
    global _SessionLocal
    if _SessionLocal is None:
        engine = get_engine()
        if engine is None:
            return None
        _SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return _SessionLocal


def database_available() -> bool:
    return bool(Config.DATABASE_URL)


@contextmanager
def get_db_session():
    """Yields a SQLAlchemy session, or None if the DB isn't configured."""
    factory = get_session_factory()
    if factory is None:
        yield None
        return
    session = factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_db():
    """Create tables if the database is configured and reachable."""
    engine = get_engine()
    if engine is None:
        print("[database] DATABASE_URL not set - running without persistence.")
        return False
    try:
        from app.models import location, alert, observation  # noqa: F401
        Base.metadata.create_all(bind=engine)
        print("[database] Connected to Neon PostgreSQL and ensured tables exist.")
        return True
    except Exception as exc:
        print(f"[database] Could not initialize database: {exc}")
        return False
