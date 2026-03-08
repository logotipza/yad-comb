"""Тесты LLM Gateway — реестр и провайдеры (с моками)."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from app.llm.base import AIProvider, LLMResponse
from app.llm.registry import LLMRegistry


# ── Тест: базовый ABC не инстанциируется ────────────────────
def test_ai_provider_is_abstract():
    with pytest.raises(TypeError):
        AIProvider()  # type: ignore


# ── Тест: LLMRegistry ──────────────────────────────────────
class FakeProvider(AIProvider):
    def __init__(self, api_key: str = ""):
        self.api_key = api_key

    async def generate(self, prompt, **kwargs):
        return LLMResponse(text=f"fake:{prompt}", model="fake")

    async def close(self):
        pass


def test_registry_register_and_list():
    reg = LLMRegistry()
    reg.register("fake", FakeProvider)
    assert "fake" in reg.available_providers


def test_registry_get_provider():
    reg = LLMRegistry()
    reg.register("fake", FakeProvider)
    provider = reg.get_provider("fake", api_key="test-key")
    assert isinstance(provider, FakeProvider)
    assert provider.api_key == "test-key"


def test_registry_unknown_provider():
    reg = LLMRegistry()
    with pytest.raises(ValueError, match="не найден"):
        reg.get_provider("nonexistent")


def test_registry_caches_instances():
    reg = LLMRegistry()
    reg.register("fake", FakeProvider)
    p1 = reg.get_provider("fake", api_key="a")
    p2 = reg.get_provider("fake", api_key="a")
    assert p1 is p2


@pytest.mark.asyncio
async def test_registry_close_all():
    reg = LLMRegistry()
    reg.register("fake", FakeProvider)
    reg.get_provider("fake", api_key="x")
    await reg.close_all()
    assert len(reg._instances) == 0


# ── Тест: FakeProvider.generate ─────────────────────────────
@pytest.mark.asyncio
async def test_fake_provider_generate():
    provider = FakeProvider(api_key="test")
    result = await provider.generate("hello")
    assert result.text == "fake:hello"
    assert result.model == "fake"
