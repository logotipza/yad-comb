"""Утилита для получения расшифрованных API-ключей из базы данных."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.api_keys import ApiKeyStore
from app.core.security import decrypt_key

async def get_db_key(db: AsyncSession, service: str) -> str | None:
    """Получить и расшифровать API-ключ для сервиса из БД."""
    result = await db.execute(select(ApiKeyStore).where(ApiKeyStore.service == service))
    row = result.scalar_one_or_none()
    if row:
        return decrypt_key(row.encrypted_key)
    return None
