# ЯД Оптимизатор — AI Маркетинг-Комбайн

Веб-приложение для автоматизации маркетинга в экосистеме Яндекса (Директ, Метрика, Вордстат).  
**Мозг работает на российских LLM** (YandexGPT, GigaChat), управление — Human-in-the-Loop.

## 🚀 Быстрый старт

### Docker (рекомендуется)
```bash
cp .env.example .env
# Заполни .env своими ключами
docker compose up --build
```
- Фронтенд: http://localhost:3000
- Бэкенд API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

### Локально (без Docker)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🧪 Тесты
```bash
cd backend
pip install aiosqlite  # для in-memory тестов
pytest -v --cov=app
```

## 📂 Структура
```
backend/
├── app/
│   ├── main.py          # FastAPI app
│   ├── core/            # config, database, security
│   ├── models/          # ORM-модели
│   ├── llm/             # LLM Gateway (YandexGPT, GigaChat)
│   ├── direct/          # Yandex Direct API v5
│   └── api/             # Роутеры
├── tests/               # pytest
└── Dockerfile
```

## 🔌 Добавление нового LLM-провайдера
```python
# 1. Создай класс
class MyProvider(AIProvider):
    async def generate(self, prompt, **kwargs) -> LLMResponse: ...

# 2. Зарегистрируй
from app.llm.registry import llm_registry
llm_registry.register("my_provider", MyProvider)
```
