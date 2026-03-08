"""FastAPI-роутер для работы с LLM Gateway."""

from __future__ import annotations

from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from app.llm.registry import llm_registry
from app.core.config import settings

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
async def generate(req: GenerateRequest):
    """Генерация текста через выбранного LLM-провайдера."""
    # Подбираем kwargs для конструктора провайдера
    provider_kwargs = _get_provider_kwargs(req.provider)

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


def _get_provider_kwargs(provider_name: str) -> dict:
    """Получить kwargs для конструктора провайдера из настроек."""
    if provider_name == "yandexgpt":
        if not settings.yandex_gpt_api_key:
            raise HTTPException(
                status_code=400,
                detail="API-ключ YandexGPT не настроен. Укажите в настройках.",
            )
        return {
            "api_key": settings.yandex_gpt_api_key,
            "folder_id": settings.yandex_gpt_folder_id,
        }
    elif provider_name == "gigachat":
        if not settings.gigachat_credentials:
            raise HTTPException(
                status_code=400,
                detail="Credentials GigaChat не настроены. Укажите в настройках.",
            )
        return {
            "credentials": settings.gigachat_credentials,
            "scope": settings.gigachat_scope,
        }
    return {}
