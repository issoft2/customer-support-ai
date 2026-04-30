from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Annotated, Any, AsyncIterator

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.chat_service import ChatService
from app.config import Settings, get_settings
from app.conversation_store import ConversationStore
from app.guardrails import validate_user_message
from app.mcp_service import MCPService

log = logging.getLogger(__name__)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


def get_chat_service(request: Request) -> ChatService:
    return ChatService(
        settings=request.app.state.settings,
        store=request.app.state.store,
        mcp=request.app.state.mcp,
    )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")
    settings = get_settings()
    app.state.settings = settings
    cap = settings.conversation_turn_cap * 2
    app.state.store = ConversationStore(max_messages_per_session=cap)
    app.state.mcp = MCPService(settings.mcp_server_url)
    log.info(
        "startup",
        extra={"mcp_server_url": settings.mcp_server_url, "openai_model": settings.openai_model},
    )
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="Meridian Customer Support API", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, Any]:
        return {"status": "ok"}

    @app.get("/")
    def root() -> dict[str, str]:
        return {"status": "Meridian Customer Support backend"}

    @app.post("/chat", response_model=ChatResponse)
    async def chat_endpoint(
        req: ChatRequest,
        chat: Annotated[ChatService, Depends(get_chat_service)],
    ) -> ChatResponse:
        settings: Settings = app.state.settings
        gr = validate_user_message(req.message, settings.max_message_chars)
        if not gr.allowed:
            sid = req.session_id or app.state.store.new_session_id()
            msg = "Sorry, I can't assist with that request."
            if gr.reason == "message_too_long":
                msg = "Your message is too long. Please shorten it and try again."
            elif gr.reason == "empty_message":
                msg = "Please enter a message."
            return ChatResponse(response=msg, session_id=sid)

        store: ConversationStore = app.state.store
        session_id = req.session_id or store.new_session_id()
        if req.session_id is None:
            log.info("session.created", extra={"session_id": session_id})

        try:
            text = await chat.chat(session_id, req.message)
        except RuntimeError as e:
            log.error("chat_configuration_error", extra={"error": str(e)})
            raise HTTPException(status_code=503, detail="Chat service is not configured.") from e
        except Exception as e:  # noqa: BLE001
            log.exception("chat_unhandled_error")
            raise HTTPException(status_code=500, detail="Something went wrong. Please try again.") from e

        return ChatResponse(response=text, session_id=session_id)

    return app


app = create_app()
