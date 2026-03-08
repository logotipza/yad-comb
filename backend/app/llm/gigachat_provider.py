"""GigaChat-провайдер — использует gigachat SDK."""

from __future__ import annotations

import json
import logging

from gigachat import GigaChat
from gigachat.models import Chat, Messages, MessagesRole

from app.llm.base import AIProvider, LLMResponse

logger = logging.getLogger(__name__)


class GigaChatProvider(AIProvider):
    """Провайдер для GigaChat (Сбер).

    Использует gigachat SDK с функцией function-calling
    для структурированного вывода.
    """

    def __init__(
        self,
        credentials: str,
        scope: str = "GIGACHAT_API_PERS",
        model: str = "GigaChat",
    ):
        self._model_name = model
        self._client = GigaChat(
            credentials=credentials,
            scope=scope,
            model=model,
            verify_ssl_certs=False,
        )

    async def generate(
        self,
        prompt: str,
        *,
        system_prompt: str | None = None,
        schema: dict | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> LLMResponse:
        messages = []

        if system_prompt:
            messages.append(
                Messages(role=MessagesRole.SYSTEM, content=system_prompt)
            )

        # Если есть schema — используем function calling
        functions = None
        if schema:
            functions = [
                {
                    "name": "structured_output",
                    "description": "Верни данные в структурированном формате",
                    "parameters": schema,
                }
            ]
            prompt += "\n\nВызови функцию structured_output с результатом."

        messages.append(Messages(role=MessagesRole.USER, content=prompt))

        payload = Chat(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            **({"functions": functions} if functions else {}),
        )

        # gigachat SDK синхронный — оборачиваем в run_in_executor
        import asyncio

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, self._client.chat, payload)

        choice = response.choices[0]
        text = choice.message.content or ""

        # Если был function call — извлекаем аргументы
        if choice.message.function_call:
            text = json.dumps(
                choice.message.function_call.arguments,
                ensure_ascii=False,
                indent=2,
            )

        usage_info = None
        if response.usage:
            usage_info = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
            }

        return LLMResponse(
            text=text,
            model=self._model_name,
            usage=usage_info,
        )

    async def close(self) -> None:
        """Закрыть сессию GigaChat."""
        if hasattr(self._client, "close"):
            self._client.close()
