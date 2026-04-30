# Customer Support Chatbot — AI Engineer Assessment

## Overview

This project is a production-ready prototype of a customer support chatbot for Meridian Electronics. It automates common support tasks (product availability, order placement, order history lookup, and customer authentication) by integrating with the company’s MCP backend and leveraging OpenAI GPT-4.1-mini for natural language understanding.

## Architecture

```
[User] <--> [Frontend (Next.js/React)] <--> [Next.js /api/chat proxy] <--> [Backend (FastAPI)] <--> [MCP Server]
```

The browser calls **same-origin** `POST /api/chat`; Next.js forwards to FastAPI using **`BACKEND_URL`** (server-side only), so the Python API origin is not exposed to the client.

- **Frontend:** Next.js/React (in `frontend/`), modern chat UI
- **Backend:** FastAPI (Python), REST API, OpenAI GPT-4.1-mini integration, MCP server integration, unit tests
- **Deployment:** Vercel (frontend and backend)

## Features
- Product availability checks
- Order placement assistance
- Order history lookup
- Customer authentication (returning customers)
- Modern chat interface
- Secure, production-ready code with error handling and tests

## Tech Stack
- **Frontend:** Next.js, React, TypeScript
- **Backend:** Python 3.9+, FastAPI, httpx/requests, OpenAI SDK, pytest
- **Deployment:** Vercel

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.9+
- Vercel CLI (for deployment)
- OpenAI API key (for GPT-4.1-mini)

### Backend (FastAPI)
1. Navigate to `backend/`
2. Create a virtual environment and activate it:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   For tests, use `pip install -r requirements-dev.txt` (includes pytest).
4. Set environment variables:
   - `OPENAI_API_KEY` (your OpenAI key)
   - `MCP_SERVER_URL` (provided by Meridian)
5. Run the backend:
   ```bash
   uvicorn main:app --reload
   ```
6. Run unit tests:
   ```bash
   pytest
   ```

### Frontend (Next.js/React)
1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `frontend/.env.example` to `frontend/.env.local` and set **`BACKEND_URL`** to your FastAPI base URL (no trailing slash), e.g. `http://127.0.0.1:8000` when developing locally.
4. Run the frontend:
   ```bash
   npm run dev
   ```

Chat requests go to **`/api/chat`** on the Next.js app; the Route Handler proxies to **`${BACKEND_URL}/chat`**.

### Deployment (Vercel)

Use **two Vercel projects** from the **same Git repo** (monorepo): one for `backend/`, one for `frontend/`. Deploy the **backend first**, copy its production URL, then point the frontend at it.

#### 1. Backend project (FastAPI)

1. In [Vercel](https://vercel.com), **Add New Project** → import your Git repository.
2. Under **Root Directory**, set **`backend`** (required). If this is wrong, Vercel will not find **`requirements.txt`** and you will see `ModuleNotFoundError: No module named 'fastapi'`.
3. Framework preset: Vercel should detect **FastAPI** / Python; leave defaults unless your dashboard suggests a build command.
4. **Environment variables** (Production — and Preview if you want previews to work):

   | Name | Value |
   |------|--------|
   | `OPENAI_API_KEY` | Your OpenAI secret key |
   | `MCP_SERVER_URL` | Meridian MCP URL (Streamable HTTP), e.g. `https://order-mcp-74afyau24q-uc.a.run.app/mcp` |
   | `OPENAI_MODEL` | Optional, e.g. `gpt-4o-mini` |

5. Deploy. When it finishes, open the assigned URL and check **`/health`** (e.g. `https://your-backend.vercel.app/health`).

**Notes:**

- **`backend/main.py`** exposes `app` from **`meridian.api`** (the Python package is **`meridian`**, not `app`). Vercel loads **`main.py`** as the serverless entry; `pip install` runs via **`vercel.json`** `installCommand` + **`requirements.txt`** / **`pyproject.toml`**. See [FastAPI on Vercel](https://vercel.com/docs/frameworks/backend/fastapi).
- `backend/vercel.json` sets **`maxDuration`: 60** seconds for the function. Chat + MCP + OpenAI can be slow; if requests time out, upgrade the Vercel plan or increase the allowed duration per [function limits](https://vercel.com/docs/functions/limitations).
- **Conversation memory** uses an in-memory store per server instance. On serverless, instances rotate, so **long chats may not retain history reliably** until you add Redis or similar.

#### 2. Frontend project (Next.js)

1. **Add New Project** → same repo.
2. **Root Directory:** **`frontend`**.
3. Framework: **Next.js** (auto).
4. **Environment variables:**

   | Name | Value |
   |------|--------|
   | `BACKEND_URL` | Backend deployment URL **with no trailing slash**, e.g. `https://your-backend.vercel.app` |

5. Deploy. Visit the frontend URL and send a test message (traffic: browser → `POST /api/chat` on Next.js → server-side `fetch` to `${BACKEND_URL}/chat`).

#### CLI (optional)

From each directory, after `npm i -g vercel` and `vercel login`:

```bash
cd backend && vercel --prod
cd frontend && vercel --prod
```

Use the same root-directory and env vars as above when the CLI prompts or via the Vercel dashboard afterward.

#### Env summary

| Where | Variable | Purpose |
|--------|-----------|---------|
| **Frontend** | `BACKEND_URL` | Public base URL of the FastAPI deployment (server-only; used by `/api/chat`). |
| **Backend** | `OPENAI_API_KEY` | OpenAI API key. |
| **Backend** | `MCP_SERVER_URL` | MCP Streamable HTTP endpoint. |
| **Backend** | `OPENAI_MODEL` | Optional model id. |

Browser **CORS** to FastAPI is not required for chat when using the Next.js proxy.

## Directory Structure
```
frontend/           # Next.js/React chat UI
backend/meridian/   # FastAPI application package (not named `app` — avoids Vercel conflicts)
backend/main.py     # Vercel + uvicorn entry → `meridian.api:app`
README.md           # Project documentation
```

## Testing
- Backend: `pytest` for unit and integration tests
- Frontend: (Optional) React Testing Library/Jest

## Notes
- All business logic is accessed via the MCP server; no direct database access.
- The solution is designed for rapid deployment and easy handoff to engineering for production hardening.

## Contact
For questions, contact the AI Engineering team at Meridian Electronics.
