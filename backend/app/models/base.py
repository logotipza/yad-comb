"""Базовая модель SQLAlchemy для всех ORM-классов."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
