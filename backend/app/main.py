"""Точка входа FastAPI-приложения."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, init_redis, close_redis
from app.models.base import Base
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Создаём таблицы + Redis при старте, закрываем при остановке."""
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await init_redis()

    yield

    # Shutdown
    await close_redis()
    await engine.dispose()


app = FastAPI(
    title="ЯД Оптимизатор — AI Маркетинг-Комбайн",
    description="Автоматизация маркетинга в экосистеме Яндекса с помощью LLM",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Роутеры
app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
