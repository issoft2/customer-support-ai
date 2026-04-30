import re
from dataclasses import dataclass

PROMPT_INJECTION_PATTERNS = [
    r"(?i)ignore\s+all\s+previous\s+instructions",
    r"(?i)ignore (all|previous|above) instructions",
    r"(?i)you are now|you are an ai|disregard previous",
    r"(?i)act as|pretend to be|simulate",
    r"(?i)system:|assistant:|user:",
    r"(?i)reset the conversation|bypass|jailbreak",
    r"(?i)repeat after me",
]


@dataclass(frozen=True)
class GuardrailResult:
    allowed: bool
    reason: str | None = None


def is_prompt_injection(text: str) -> bool:
    return any(re.search(p, text) for p in PROMPT_INJECTION_PATTERNS)


def validate_user_message(text: str, max_chars: int) -> GuardrailResult:
    stripped = text.strip()
    if not stripped:
        return GuardrailResult(False, "empty_message")
    if len(text) > max_chars:
        return GuardrailResult(False, "message_too_long")
    if is_prompt_injection(text):
        return GuardrailResult(False, "policy")
    return GuardrailResult(True)
