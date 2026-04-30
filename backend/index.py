"""Alternative ASGI entry Vercel may detect alongside ``main.py``."""

from meridian.api import app

__all__ = ["app"]
