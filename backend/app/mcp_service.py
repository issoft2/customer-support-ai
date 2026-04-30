from __future__ import annotations

import json
import logging
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

log = logging.getLogger(__name__)


def _tool_result_to_text(result: Any) -> str:
    parts: list[str] = []
    for block in getattr(result, "content", []) or []:
        t = getattr(block, "text", None)
        if t:
            parts.append(t)
    return "\n".join(parts) if parts else json.dumps({"isError": getattr(result, "isError", False)})


class MCPService:
    """Streamable HTTP MCP client for Meridian order/product APIs."""

    def __init__(self, server_url: str) -> None:
        self.server_url = server_url.rstrip("/")

    @asynccontextmanager
    async def connect(self) -> AsyncIterator[ClientSession]:
        async with streamablehttp_client(self.server_url) as (read_stream, write_stream, _get_sid):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                yield session

    async def list_tool_definitions(self, session: ClientSession) -> list[dict[str, Any]]:
        listed = await session.list_tools()
        tools: list[dict[str, Any]] = []
        for t in listed.tools:
            params = t.inputSchema if isinstance(t.inputSchema, dict) else {}
            tools.append(
                {
                    "type": "function",
                    "function": {
                        "name": t.name,
                        "description": (t.description or "").strip() or f"MCP tool {t.name}",
                        "parameters": params,
                    },
                }
            )
        return tools

    async def call_tool(self, session: ClientSession, name: str, arguments: dict[str, Any]) -> str:
        log.info("mcp.tool_call", extra={"tool": name})
        try:
            raw = await session.call_tool(name, arguments=arguments or {})
        except Exception:
            log.exception("mcp.tool_call_failed", extra={"tool": name})
            raise
        return _tool_result_to_text(raw)
