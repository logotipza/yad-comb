"""FastAPI-роутер для Яндекс.Директ."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.keys import get_db_key
from app.core.config import settings
from app.direct.client import DirectClient, DirectApiError
from app.direct.campaigns import CampaignsService

router = APIRouter(prefix="/direct", tags=["Яндекс.Директ"])


async def _get_direct_client(db: AsyncSession) -> DirectClient:
    """Создать DirectClient из текущих настроек."""
    token = await get_db_key(db, "yandex_direct") or settings.yandex_direct_token
    login = await get_db_key(db, "yandex_direct_login") or settings.yandex_direct_login

    if not token:
        raise HTTPException(
            status_code=400,
            detail="Токен Яндекс.Директ не настроен. Укажите в настройках.",
        )
    return DirectClient(
        token=token,
        login=login,
    )


@router.get("/campaigns")
async def get_campaigns(
    field_names: str = Query(
        default="Id,Name,State,Status,Type",
        description="Поля через запятую",
    ),
    db: AsyncSession = Depends(get_db)
):
    """Получить список кампаний из Яндекс.Директ."""
    client = await _get_direct_client(db)
    service = CampaignsService(client)

    try:
        fields = [f.strip() for f in field_names.split(",")]
        result = await service.get(field_names=fields)
        return result
    except DirectApiError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    finally:
        await client.close()
