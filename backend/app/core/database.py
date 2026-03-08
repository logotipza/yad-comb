"""Асинхронное подключение к PostgreSQL (SQLAlchemy) и Redis."""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from redis.asyncio import Redis

from app.core.config import settings

# ── SQLAlchemy ──────────────────────────────────────────────
engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:  # type: ignore[misc]
    """FastAPI-зависимость: возвращает async-сессию БД."""
    async with async_session_factory() as session:
        yield session


# ── Redis ───────────────────────────────────────────────────
redis_client: Redis | None = None


async def get_redis() -> Redis:
    """FastAPI-зависимость: возвращает Redis-клиента."""
    assert redis_client is not None, "Redis не инициализирован"
    return redis_client


async def init_redis() -> Redis:
    """Создать глобальный Redis-клиент (вызывается в lifespan)."""
    global redis_client
    redis_client = Redis.from_url(settings.redis_url, decode_responses=True)
    return redis_client


async def close_redis() -> None:
    """Закрыть Redis-соединение (lifespan shutdown)."""
    global redis_client
    if redis_client:
        await redis_client.aclose()
        redis_client = None
