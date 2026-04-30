export type ChatApiResponse = {
  response: string;
  session_id: string;
};

/**
 * Sends a message via the Next.js `/api/chat` proxy (same origin).
 * The proxy forwards to FastAPI using server-side `BACKEND_URL`.
 */
export async function sendChatMessage(
  message: string,
  sessionId: string | null,
): Promise<ChatApiResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      message,
      session_id: sessionId ?? undefined,
    }),
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  return res.json() as Promise<ChatApiResponse>;
}
