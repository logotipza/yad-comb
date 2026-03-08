"""Агрегатор всех роутеров бэкенда."""

from fastapi import APIRouter

from app.api.settings import router as settings_router
from app.llm.router import router as llm_router
from app.direct.router import router as direct_router

api_router = APIRouter()
api_router.include_router(settings_router)
api_router.include_router(llm_router)
api_router.include_router(direct_router)
