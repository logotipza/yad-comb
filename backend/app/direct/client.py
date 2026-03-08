"""Базовый async-клиент для Yandex Direct API v5."""

from __future__ import annotations

import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)

DIRECT_API_URL = "https://api.direct.yandex.com/json/v5/"


class DirectClient:
    """Асинхронный HTTP-клиент для Yandex Direct API v5.

    Автоматически проставляет заголовки Authorization, Client-Login и т.д.
    """

    def __init__(self, token: str, login: str = "") -> None:
        self._token = token
        self._login = login
        self._client = httpx.AsyncClient(
            base_url=DIRECT_API_URL,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept-Language": "ru",
                "Content-Type": "application/json; charset=utf-8",
                **({"Client-Login": login} if login else {}),
            },
            timeout=30.0,
        )

    async def request(
        self,
        service: str,
        method: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Универсальный запрос к Direct API.

        Args:
            service: Имя сервиса (campaigns, ads, keywords и т.д.).
            method: Имя метода (get, add, update, delete и т.д.).
            params: Параметры запроса.

        Returns:
            Распарсенный JSON-ответ.
        """
        payload = {"method": method, "params": params or {}}

        logger.debug("Direct API → %s.%s: %s", service, method, payload)

        response = await self._client.post(service, json=payload)
        response.raise_for_status()

        data = response.json()

        # Проверяем ошибки Direct API
        if "error" in data:
            error = data["error"]
            raise DirectApiError(
                code=error.get("error_code", 0),
                message=error.get("error_string", "Неизвестная ошибка"),
                detail=error.get("error_detail", ""),
            )

        return data

    async def close(self) -> None:
        await self._client.aclose()


class DirectApiError(Exception):
    """Ошибка, возвращённая Yandex Direct API."""

    def __init__(self, code: int, message: str, detail: str = "") -> None:
        self.code = code
        self.message = message
        self.detail = detail
        super().__init__(f"[{code}] {message}: {detail}")
