"""Configuration base de données"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from typing import Generator, Dict

# SQLite local file. In CI, you can swap to Postgres later.
DATABASE_URL = "sqlite:///./taskmanager.db"

engine = create_engine(
    DATABASE_URL,
    # needed for SQLite + threads
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """class Base"""
    pass

def get_db() -> Generator[Session, None, None]:
    """get the database"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
