"""Сервис Campaigns — получение списка кампаний из Яндекс.Директ."""

from __future__ import annotations

from typing import Any

from app.direct.client import DirectClient


class CampaignsService:
    """Обёртка над методом Campaigns справочника Direct API v5."""

    def __init__(self, client: DirectClient) -> None:
        self._client = client

    async def get(
        self,
        field_names: list[str] | None = None,
        selection_criteria: dict[str, Any] | None = None,
        text_campaign_field_names: list[str] | None = None,
    ) -> dict[str, Any]:
        """Получить список кампаний (Campaigns.get).

        Args:
            field_names: Поля кампании (Id, Name, Status и т.д.).
            selection_criteria: Фильтры (Ids, Types, States, Statuses).
            text_campaign_field_names: Доп. поля для текстовых кампаний.
        """
        params: dict[str, Any] = {
            "SelectionCriteria": selection_criteria or {},
            "FieldNames": field_names or [
                "Id", "Name", "State", "Status", "Type",
                "DailyBudget", "StartDate",
            ],
        }

        if text_campaign_field_names:
            params["TextCampaignFieldNames"] = text_campaign_field_names

        return await self._client.request("campaigns", "get", params)
