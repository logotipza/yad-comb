"""Тесты API настроек — CRUD ключей через TestClient."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_keys_empty(client: AsyncClient):
    """При пустой БД все сервисы показываются как 'не настроены'."""
    resp = await client.get("/api/settings/keys")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert all(not k["is_configured"] for k in data)


@pytest.mark.asyncio
async def test_upsert_and_list_key(client: AsyncClient):
    """Создать ключ, проверить что он появился (замаскированный)."""
    # Создаём
    resp = await client.post(
        "/api/settings/keys",
        json={"service": "yandexgpt", "api_key": "my-super-secret-key-1234"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["service"] == "yandexgpt"
    assert data["is_configured"] is True
    assert "my-s" in data["masked_key"]  # начало
    assert "1234" in data["masked_key"]  # конец
    assert "super-secret" not in data["masked_key"]  # середина скрыта

    # Читаем список
    resp = await client.get("/api/settings/keys")
    keys = resp.json()
    yandex = [k for k in keys if k["service"] == "yandexgpt"][0]
    assert yandex["is_configured"] is True


@pytest.mark.asyncio
async def test_update_existing_key(client: AsyncClient):
    """Обновить существующий ключ."""
    await client.post(
        "/api/settings/keys",
        json={"service": "gigachat", "api_key": "old-key-value-1111"},
    )
    resp = await client.post(
        "/api/settings/keys",
        json={"service": "gigachat", "api_key": "new-key-value-2222"},
    )
    assert resp.status_code == 200
    assert "2222" in resp.json()["masked_key"]


@pytest.mark.asyncio
async def test_delete_key(client: AsyncClient):
    """Удалить ключ."""
    await client.post(
        "/api/settings/keys",
        json={"service": "yandexgpt", "api_key": "delete-me-key-5678"},
    )
    resp = await client.delete("/api/settings/keys/yandexgpt")
    assert resp.status_code == 200
    assert resp.json()["deleted"] is True

    # Проверяем что удалён
    resp = await client.get("/api/settings/keys")
    yandex = [k for k in resp.json() if k["service"] == "yandexgpt"][0]
    assert yandex["is_configured"] is False


@pytest.mark.asyncio
async def test_upsert_invalid_service(client: AsyncClient):
    """Неизвестный сервис — ошибка 400."""
    resp = await client.post(
        "/api/settings/keys",
        json={"service": "openai", "api_key": "test"},
    )
    assert resp.status_code == 400
    assert "Неизвестный" in resp.json()["detail"]
