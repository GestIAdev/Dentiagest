# PLATFORM_EXTRACTABLE: Database configuration - 100% reusable across all verticals
"""
Database configuration and connection management.
This entire module is extractable to PlatformGest with zero modifications.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
from typing import Generator

# Import settings to use Pydantic configuration
from .config import settings

# PLATFORM_CORE: Database URL configuration
DATABASE_URL = settings.database_url or f"postgresql://{settings.db_user}:{settings.db_password}@{settings.db_host}:{settings.db_port}/{settings.db_name}"

# PLATFORM_CORE: SQLAlchemy engine configuration
engine = create_engine(
    DATABASE_URL,
    poolclass=StaticPool,
    connect_args={
        "check_same_thread": False,  # SQLite setting
        # "options": "-c timezone=utc"  # PostgreSQL only
    },
    echo=os.getenv("DEBUG", "false").lower() == "true"
)

# PLATFORM_CORE: Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# PLATFORM_CORE: Base class for all models
Base = declarative_base()

# PLATFORM_CORE: Database dependency injection
def get_db() -> Generator:
    """
    Database session dependency for FastAPI.
    Yields a database session and ensures proper cleanup.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# PLATFORM_CORE: Database utilities
def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all database tables. Use with caution!"""
    Base.metadata.drop_all(bind=engine)

def get_table_names():
    """Get list of all table names in the database."""
    return Base.metadata.tables.keys()
