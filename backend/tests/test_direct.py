"""Тесты Yandex Direct client — с мок-ответами httpx."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

import httpx

from app.direct.client import DirectClient, DirectApiError
from app.direct.campaigns import CampaignsService


def _make_mock_response(status_code: int, json_data: dict) -> httpx.Response:
    """Создать mock httpx.Response с request (нужен для raise_for_status)."""
    request = httpx.Request("POST", "https://api.direct.yandex.com/json/v5/campaigns")
    return httpx.Response(status_code, json=json_data, request=request)


# ── DirectClient ────────────────────────────────────────────
@pytest.mark.asyncio
async def test_direct_client_request_success():
    """Успешный запрос к Direct API."""
    mock_response = _make_mock_response(
        200,
        {
            "result": {
                "Campaigns": [
                    {"Id": 123, "Name": "Тестовая кампания", "Status": "ACCEPTED"}
                ]
            }
        },
    )

    client = DirectClient(token="test-token", login="test-login")
    client._client = AsyncMock()
    client._client.post = AsyncMock(return_value=mock_response)

    result = await client.request("campaigns", "get", {"FieldNames": ["Id", "Name"]})
    assert "result" in result
    assert result["result"]["Campaigns"][0]["Name"] == "Тестовая кампания"

    await client.close()


@pytest.mark.asyncio
async def test_direct_client_api_error():
    """Direct API возвращает ошибку."""
    mock_response = _make_mock_response(
        200,
        {
            "error": {
                "error_code": 53,
                "error_string": "Authorization error",
                "error_detail": "No token",
            }
        },
    )

    client = DirectClient(token="bad-token")
    client._client = AsyncMock()
    client._client.post = AsyncMock(return_value=mock_response)

    with pytest.raises(DirectApiError, match="Authorization error"):
        await client.request("campaigns", "get")

    await client.close()


# ── CampaignsService ────────────────────────────────────────
@pytest.mark.asyncio
async def test_campaigns_get():
    """CampaignsService.get формирует правильный запрос."""
    mock_client = AsyncMock(spec=DirectClient)
    mock_client.request = AsyncMock(
        return_value={
            "result": {
                "Campaigns": [
                    {"Id": 1, "Name": "Кампания 1"},
                    {"Id": 2, "Name": "Кампания 2"},
                ]
            }
        }
    )

    service = CampaignsService(mock_client)
    result = await service.get(field_names=["Id", "Name"])

    mock_client.request.assert_called_once_with(
        "campaigns",
        "get",
        {
            "SelectionCriteria": {},
            "FieldNames": ["Id", "Name"],
        },
    )

    assert len(result["result"]["Campaigns"]) == 2
