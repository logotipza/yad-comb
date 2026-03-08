"""YandexGPT-провайдер — использует yandex-cloud-ml-sdk."""

from __future__ import annotations

import json
import logging

from yandex_ai_studio_sdk import AsyncYCloudML

from app.llm.base import AIProvider, LLMResponse

logger = logging.getLogger(__name__)


class YandexGPTProvider(AIProvider):
    """Провайдер для YandexGPT (Pro / Lite).

    Использует Yandex Cloud ML SDK с async-режимом и JSON Mode
    для структурированного вывода.
    """

    def __init__(self, api_key: str, folder_id: str, model: str = "yandexgpt"):
        self._sdk = AsyncYCloudML(folder_id=folder_id, auth=api_key)
        self._model_name = model
        self._model = self._sdk.models.completions(model)

    async def generate(
        self,
        prompt: str,
        *,
        system_prompt: str | None = None,
        schema: dict | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> LLMResponse:
        model = self._model.configure(temperature=temperature, max_tokens=max_tokens)

        messages = []
        if system_prompt:
            messages.append({"role": "system", "text": system_prompt})
        messages.append({"role": "user", "text": prompt})

        # JSON Mode: если передана schema — просим вернуть JSON
        if schema:
            json_instruction = (
                "Ответь СТРОГО в формате JSON по следующей схеме:\n"
                f"{json.dumps(schema, ensure_ascii=False, indent=2)}"
            )
            if system_prompt:
                messages[0]["text"] += "\n\n" + json_instruction
            else:
                messages.insert(0, {"role": "system", "text": json_instruction})

        result = await model.run(messages)

        # Извлекаем текст из результата
        text = ""
        if result.alternatives:
            text = result.alternatives[0].text

        usage_info = None
        if hasattr(result, "usage"):
            usage_info = {
                "prompt_tokens": getattr(result.usage, "input_text_tokens", 0),
                "completion_tokens": getattr(result.usage, "completion_tokens", 0),
            }

        return LLMResponse(
            text=text,
            model=self._model_name,
            usage=usage_info,
        )

    async def close(self) -> None:
        """SDK не требует явного закрытия."""
        pass
