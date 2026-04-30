"""ASGI entrypoint: `uvicorn main:app --reload`"""

from app.api import app

__all__ = ["app"]
