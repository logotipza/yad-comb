"""Утилита шифрования API-ключей через Fernet (symmetric encryption)."""

from cryptography.fernet import Fernet

from app.core.config import settings

# Генерируем Fernet-ключ из app_secret_key (SHA-256 → base64)
import base64
import hashlib

_raw = hashlib.sha256(settings.app_secret_key.encode()).digest()
_fernet_key = base64.urlsafe_b64encode(_raw)
_fernet = Fernet(_fernet_key)


def encrypt_key(plain: str) -> str:
    """Зашифровать API-ключ."""
    return _fernet.encrypt(plain.encode()).decode()


def decrypt_key(token: str) -> str:
    """Расшифровать API-ключ."""
    return _fernet.decrypt(token.encode()).decode()


def mask_key(plain: str) -> str:
    """Замаскировать ключ для отображения: показать первые 4 и последние 4 символа."""
    if len(plain) <= 8:
        return "****"
    return f"{plain[:4]}...{plain[-4:]}"
