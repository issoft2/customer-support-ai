from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    openai_api_key: str = Field(default="", description="OpenAI API key")
    openai_model: str = Field(default="gpt-4o-mini", description="Chat model (cost-effective tier)")
    mcp_server_url: str = Field(
        default="https://order-mcp-74afyau24q-uc.a.run.app/mcp",
        description="Meridian MCP server (Streamable HTTP)",
    )
    max_message_chars: int = Field(default=4000, ge=256, le=32000)
    max_tool_rounds: int = Field(default=12, ge=1, le=32)
    conversation_turn_cap: int = Field(default=40, ge=4, le=200)


@lru_cache
def get_settings() -> Settings:
    return Settings()
