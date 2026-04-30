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

Use separate deployments (or monorepo projects) for the Next.js app and the FastAPI service, then wire env vars:

| Where | Variable | Purpose |
|--------|-----------|---------|
| **Frontend (Vercel)** | `BACKEND_URL` | Public base URL of the FastAPI service (e.g. `https://api.yourcompany.com`). Used only on the server by `/api/chat`. |
| **Backend** | `OPENAI_API_KEY` | OpenAI API key for the chat model. |
| **Backend** | `MCP_SERVER_URL` | Meridian MCP Streamable HTTP endpoint (see assessment brief). |
| **Backend** | `OPENAI_MODEL` | Optional; default is cost-effective (e.g. `gpt-4o-mini`). |

After deployment, ensure the FastAPI deployment allows requests from the **Next.js server** (the proxy uses server-side `fetch`). Browser CORS to FastAPI is **not** required for chat when using this proxy, because the browser only talks to Next.js.

- Deploy the frontend with Vercel (Git integration or CLI).
- Deploy the backend to your Python host (Vercel serverless Python, Cloud Run, Railway, etc.) and set the backend env vars there.
- Add `BACKEND_URL` in the Vercel project settings to point at that backend URL.

## Directory Structure
```
frontend/    # Next.js/React chat UI
backend/     # FastAPI backend, OpenAI/MCP integration, unit tests
README.md    # Project documentation
```

## Testing
- Backend: `pytest` for unit and integration tests
- Frontend: (Optional) React Testing Library/Jest

## Notes
- All business logic is accessed via the MCP server; no direct database access.
- The solution is designed for rapid deployment and easy handoff to engineering for production hardening.

## Contact
For questions, contact the AI Engineering team at Meridian Electronics.
