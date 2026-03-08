"""FastAPI-роутер для Яндекс.Директ."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.core.config import settings
from app.direct.client import DirectClient, DirectApiError
from app.direct.campaigns import CampaignsService

router = APIRouter(prefix="/direct", tags=["Яндекс.Директ"])


def _get_direct_client() -> DirectClient:
    """Создать DirectClient из текущих настроек."""
    if not settings.yandex_direct_token:
        raise HTTPException(
            status_code=400,
            detail="Токен Яндекс.Директ не настроен. Укажите в настройках.",
        )
    return DirectClient(
        token=settings.yandex_direct_token,
        login=settings.yandex_direct_login,
    )


@router.get("/campaigns")
async def get_campaigns(
    field_names: str = Query(
        default="Id,Name,State,Status,Type",
        description="Поля через запятую",
    ),
):
    """Получить список кампаний из Яндекс.Директ."""
    client = _get_direct_client()
    service = CampaignsService(client)

    try:
        fields = [f.strip() for f in field_names.split(",")]
        result = await service.get(field_names=fields)
        return result
    except DirectApiError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    finally:
        await client.close()
