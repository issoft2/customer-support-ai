from __future__ import annotations

import uuid
from collections import defaultdict, deque
from typing import Any


class ConversationStore:
    """In-memory chat history per session (prototype; swap for Redis in production)."""

    def __init__(self, max_messages_per_session: int) -> None:
        self._max = max_messages_per_session
        self._sessions: dict[str, deque[dict[str, Any]]] = defaultdict(
            lambda: deque(maxlen=max_messages_per_session)
        )

    def new_session_id(self) -> str:
        return str(uuid.uuid4())

    def append(self, session_id: str, message: dict[str, Any]) -> None:
        self._sessions[session_id].append(message)

    def history(self, session_id: str) -> list[dict[str, Any]]:
        return list(self._sessions.get(session_id, deque()))
