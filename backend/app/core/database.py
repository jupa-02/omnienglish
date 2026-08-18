import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from app.core.config import settings

# Determine primary or fallback SQLite database URL
raw_db_url = settings.get_database_url()

# Fallback to local SQLite if DATABASE_URL is not specifically provided in environment
if not os.environ.get("DATABASE_URL") and ("localhost" in raw_db_url or "127.0.0.1" in raw_db_url):
    DATABASE_URL = "sqlite+aiosqlite:///./omnienglish.db"
else:
    DATABASE_URL = raw_db_url

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    """Initialize DB tables if not already present."""
    async with engine.begin() as conn:
        if "postgresql" in DATABASE_URL:
            try:
                await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
                await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "vector";'))
            except Exception as e:
                print(f"Notice: PostgreSQL extensions skipped or unavailable: {e}")
        await conn.run_sync(Base.metadata.create_all)
