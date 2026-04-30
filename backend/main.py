"""ASGI entrypoint: `uvicorn main:app --reload`"""

from meridian.api import app

__all__ = ["app"]
