"""FastAPI-роутер для работы с LLM Gateway."""

from __future__ import annotations

from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from app.llm.registry import llm_registry
from app.core.config import settings
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.keys import get_db_key

router = APIRouter(prefix="/llm", tags=["LLM Gateway"])


class GenerateRequest(BaseModel):
    provider: str = Field(..., description="Имя провайдера: yandexgpt, gigachat")
    prompt: str = Field(..., min_length=1)
    system_prompt: str | None = None
    schema_: dict | None = Field(None, alias="schema")
    temperature: float = Field(0.7, ge=0.0, le=1.0)
    max_tokens: int = Field(2048, ge=1, le=8192)

    model_config = {"populate_by_name": True}


class GenerateResponse(BaseModel):
    text: str
    model: str
    usage: dict | None = None


@router.get("/providers")
async def list_providers():
    """Вернуть список доступных LLM-провайдеров."""
    return {"providers": llm_registry.available_providers}


@router.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest, db: AsyncSession = Depends(get_db)):
    """Генерация текста через выбранного LLM-провайдера."""
    # Подбираем kwargs для конструктора провайдера
    provider_kwargs = await _get_provider_kwargs(req.provider, db)

    try:
        provider = llm_registry.get_provider(req.provider, **provider_kwargs)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    try:
        result = await provider.generate(
            prompt=req.prompt,
            system_prompt=req.system_prompt,
            schema=req.schema_,
            temperature=req.temperature,
            max_tokens=req.max_tokens,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Ошибка провайдера {req.provider}: {exc}",
        )

    return GenerateResponse(
        text=result.text,
        model=result.model,
        usage=result.usage,
    )


async def _get_provider_kwargs(provider_name: str, db: AsyncSession) -> dict:
    """Получить kwargs для конструктора провайдера из БД."""
    if provider_name == "yandexgpt":
        api_key = await get_db_key(db, "yandexgpt") or settings.yandex_gpt_api_key
        folder_id = await get_db_key(db, "yandex_gpt_folder_id") or settings.yandex_gpt_folder_id
        
        if not api_key:
            raise HTTPException(
                status_code=400,
                detail="API-ключ YandexGPT не настроен. Укажите в настройках.",
            )
        return {
            "api_key": api_key,
            "folder_id": folder_id,
        }
    elif provider_name == "gigachat":
        credentials = await get_db_key(db, "gigachat") or settings.gigachat_credentials
        scope = await get_db_key(db, "gigachat_scope") or settings.gigachat_scope
        
        if not credentials:
            raise HTTPException(
                status_code=400,
                detail="Credentials GigaChat не настроены. Укажите в настройках.",
            )
        return {
            "credentials": credentials,
            "scope": scope,
        }
    return {}
