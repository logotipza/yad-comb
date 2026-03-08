"""Настройки приложения — читаются из .env через pydantic-settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- База данных ---
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/yad_comb"
    redis_url: str = "redis://redis:6379/0"

    # --- Яндекс.Директ ---
    yandex_direct_token: str = ""
    yandex_direct_login: str = ""

    # --- YandexGPT ---
    yandex_gpt_api_key: str = ""
    yandex_gpt_folder_id: str = ""

    # --- GigaChat ---
    gigachat_credentials: str = ""
    gigachat_scope: str = "GIGACHAT_API_PERS"

    # --- Приложение ---
    app_secret_key: str = "change-me-in-production"
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()
