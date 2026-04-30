"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sendChatMessage } from "@/lib/chat-api";

type Role = "user" | "assistant";

export type ChatLine = {
  id: string;
  role: Role;
  content: string;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function MeridianChat() {
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, busy]);

  const onSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

    setError(null);
    setInput("");
    setLines((prev) => [...prev, { id: uid(), role: "user", content: text }]);
    setBusy(true);

    try {
      const data = await sendChatMessage(text, sessionId);
      setSessionId(data.session_id);
      setLines((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: data.response },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(
        `${msg} Locally: run the FastAPI backend and set BACKEND_URL in frontend/.env.local (see .env.example).`,
      );
    } finally {
      setBusy(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [busy, input, sessionId]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void onSubmit();
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-[var(--surface)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            Meridian Electronics
          </p>
          <h1 className="text-lg font-semibold tracking-tight text-[var(--text)]">
            Customer support
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Ask about products, stock, orders, or account verification.
          </p>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 overflow-y-auto px-4 py-6 sm:px-6">
          {lines.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-8 text-center">
              <p className="text-sm font-medium text-[var(--text)]">
                How can we help today?
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                For example: “Do you have wireless keyboards in stock?” or “I need
                help finding my last order.”
              </p>
            </div>
          )}

          {lines.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-md bg-[var(--accent)] px-4 py-3 text-[var(--accent-contrast)] shadow-sm"
                    : "max-w-[85%] rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-[var(--text)] shadow-sm"
                }
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-0.2s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-0.1s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)]" />
                </span>
                <span className="text-sm text-[var(--text-muted)]">Thinking…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-2">
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your message…"
                rows={2}
                disabled={busy}
                className="min-h-[3rem] flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none ring-[var(--accent)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 disabled:opacity-60"
                aria-label="Message"
              />
              <button
                type="button"
                onClick={() => void onSubmit()}
                disabled={busy || !input.trim()}
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-contrast)] shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Session stays on this device for continued help. Press Enter to send,
              Shift+Enter for a new line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
