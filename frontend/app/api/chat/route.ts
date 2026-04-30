import { NextResponse } from "next/server";

function backendBase(): string {
  const raw = process.env.BACKEND_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "http://127.0.0.1:8000";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 });
  }

  const upstream = `${backendBase()}/chat`;

  let res: Response;
  try {
    res = await fetch(upstream, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        detail:
          "Could not reach the support API. Check BACKEND_URL and that the FastAPI server is running.",
      },
      { status: 502 },
    );
  }

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const data = await res.json().catch(() => null);
    if (data === null) {
      return NextResponse.json({ detail: "Invalid response from support API." }, { status: 502 });
    }
    return NextResponse.json(data, { status: res.status });
  }

  const text = await res.text();
  return NextResponse.json(
    { detail: text?.slice(0, 500) || res.statusText || "Upstream error" },
    { status: res.status >= 400 ? res.status : 502 },
  );
}
