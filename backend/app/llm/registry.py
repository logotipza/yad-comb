"""Реестр LLM-провайдеров.

Для добавления нового провайдера:
    from app.llm.registry import llm_registry
    llm_registry.register("my_llm", MyLLMProvider)
"""

from __future__ import annotations

import logging
from typing import Any

from app.llm.base import AIProvider

logger = logging.getLogger(__name__)


class LLMRegistry:
    """Фабрика + реестр всех LLM-провайдеров."""

    def __init__(self) -> None:
        self._providers: dict[str, type[AIProvider]] = {}
        self._instances: dict[str, AIProvider] = {}

    def register(self, name: str, provider_cls: type[AIProvider]) -> None:
        """Зарегистрировать класс провайдера по имени."""
        self._providers[name] = provider_cls
        logger.info("LLM-провайдер зарегистрирован: %s", name)

    def get_provider(self, name: str, **kwargs: Any) -> AIProvider:
        """Создать или вернуть инстанс провайдера.

        Kwargs передаются в конструктор (api_key, folder_id и т.д.).
        """
        # Если уже создан с такими же параметрами — вернуть из кеша
        cache_key = f"{name}:{hash(frozenset(kwargs.items()))}"
        if cache_key in self._instances:
            return self._instances[cache_key]

        if name not in self._providers:
            available = ", ".join(self._providers.keys()) or "(пусто)"
            raise ValueError(
                f"Провайдер '{name}' не найден. Доступные: {available}"
            )

        instance = self._providers[name](**kwargs)
        self._instances[cache_key] = instance
        return instance

    @property
    def available_providers(self) -> list[str]:
        """Список имён зарегистрированных провайдеров."""
        return list(self._providers.keys())

    async def close_all(self) -> None:
        """Закрыть все созданные инстансы."""
        for instance in self._instances.values():
            await instance.close()
        self._instances.clear()


# ── Глобальный реестр ──────────────────────────────────────
llm_registry = LLMRegistry()


def _register_defaults() -> None:
    """Регистрация встроенных провайдеров."""
    from app.llm.yandexgpt import YandexGPTProvider
    from app.llm.gigachat_provider import GigaChatProvider

    llm_registry.register("yandexgpt", YandexGPTProvider)
    llm_registry.register("gigachat", GigaChatProvider)


_register_defaults()
