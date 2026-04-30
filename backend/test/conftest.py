import pytest
from fastapi.testclient import TestClient

from app.api import app, get_chat_service


@pytest.fixture
def client():
    class _StubChatService:
        async def chat(self, session_id: str, user_text: str) -> str:
            return "Thanks — how else can I help with Meridian products or orders?"

    app.dependency_overrides[get_chat_service] = lambda: _StubChatService()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
