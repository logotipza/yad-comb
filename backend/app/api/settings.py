"""CRUD-эндпоинты для управления API-ключами."""

from __future__ import annotations

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete as sa_delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import encrypt_key, decrypt_key, mask_key
from app.models.api_keys import ApiKeyStore

router = APIRouter(prefix="/settings", tags=["Настройки"])

# Допустимые имена сервисов
ALLOWED_SERVICES = {
    "yandexgpt",
    "gigachat",
    "yandex_direct",
    "yandex_direct_login",
    "yandex_gpt_folder_id",
    "gigachat_scope",
}


class KeyIn(BaseModel):
    service: str = Field(..., description="Имя сервиса, например: yandexgpt")
    api_key: str = Field(..., min_length=1, description="API-ключ")


class KeyOut(BaseModel):
    service: str
    masked_key: str
    is_configured: bool


class KeyDeleteOut(BaseModel):
    service: str
    deleted: bool


@router.get("/keys", response_model=list[KeyOut])
async def list_keys(db: AsyncSession = Depends(get_db)):
    """Получить список сервисов с маскированными ключами."""
    result = await db.execute(select(ApiKeyStore))
    rows = result.scalars().all()

    # Показать все допустимые сервисы, даже не настроенные
    configured = {r.service: r for r in rows}
    output = []
    for svc in sorted(ALLOWED_SERVICES):
        if svc in configured:
            plain = decrypt_key(configured[svc].encrypted_key)
            output.append(KeyOut(service=svc, masked_key=mask_key(plain), is_configured=True))
        else:
            output.append(KeyOut(service=svc, masked_key="", is_configured=False))
    return output


@router.post("/keys", response_model=KeyOut)
async def upsert_key(body: KeyIn, db: AsyncSession = Depends(get_db)):
    """Создать или обновить API-ключ для сервиса."""
    if body.service not in ALLOWED_SERVICES:
        raise HTTPException(
            status_code=400,
            detail=f"Неизвестный сервис '{body.service}'. Допустимые: {', '.join(sorted(ALLOWED_SERVICES))}",
        )

    encrypted = encrypt_key(body.api_key)

    # Upsert
    stmt = select(ApiKeyStore).where(ApiKeyStore.service == body.service)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        existing.encrypted_key = encrypted
    else:
        db.add(ApiKeyStore(service=body.service, encrypted_key=encrypted))

    await db.commit()

    return KeyOut(
        service=body.service,
        masked_key=mask_key(body.api_key),
        is_configured=True,
    )


@router.delete("/keys/{service}", response_model=KeyDeleteOut)
async def delete_key(service: str, db: AsyncSession = Depends(get_db)):
    """Удалить API-ключ для сервиса."""
    result = await db.execute(
        sa_delete(ApiKeyStore).where(ApiKeyStore.service == service)
    )
    await db.commit()

    return KeyDeleteOut(service=service, deleted=result.rowcount > 0)
