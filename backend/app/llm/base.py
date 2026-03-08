"""Абстрактный базовый класс для всех LLM-провайдеров.

Чтобы добавить нового провайдера (LiteLLM, OpenAI и т.д.):
1. Создать класс, наследник AIProvider
2. Реализовать метод `generate`
3. Зарегистрировать в registry.py одной строкой
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class LLMResponse:
    """Стандартный ответ от любого провайдера."""

    text: str
    model: str
    usage: dict | None = None  # {"prompt_tokens": ..., "completion_tokens": ...}


class AIProvider(ABC):
    """Единый интерфейс для всех LLM."""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        *,
        system_prompt: str | None = None,
        schema: dict | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> LLMResponse:
        """Генерация ответа.

        Args:
            prompt: Пользовательский промпт.
            system_prompt: Системный промпт (опционально).
            schema: JSON-схема для структурированного вывода.
            temperature: Креативность (0.0–1.0).
            max_tokens: Максимум токенов в ответе.
        """
        ...

    @abstractmethod
    async def close(self) -> None:
        """Освободить ресурсы."""
        ...
