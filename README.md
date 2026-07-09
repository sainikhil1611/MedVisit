# MedVisit

MedVisit is a healthcare consultation tool: doctors upload a recorded doctor-patient
consultation video, [TwelveLabs](https://twelvelabs.io) multimodal AI analyzes it to
produce an AI-generated EMR (Electronic Medical Record) and medication suggestions,
the doctor reviews/approves/overrides the medications, and the patient views a
summary with timestamped video navigation and optional text-to-speech. Frontend is
Vite 5 + React 18 + TypeScript + shadcn/ui + TanStack Query; backend is Python
FastAPI with no database (all state is in-memory).

## Quick start (devcontainer — recommended)

1. Prereqs: [Docker](https://docs.docker.com/get-docker/), [VS Code](https://code.visualstudio.com/) + the "Dev Containers" extension.
2. Open this folder in VS Code → "Reopen in Container" when prompted. This attaches to the `frontend` service (runs `npm ci` automatically) and starts a `backend` service alongside it (installs Python deps automatically on container start — see `docker-compose.yml`).
3. `cp backend/twelvelabs/.env.example backend/twelvelabs/.env` and fill in values (see table below).
4. In the frontend terminal: `npm run dev` → open http://localhost:8080
   In a second terminal attached to the `backend` service (`docker compose exec backend bash`): `cd backend/twelvelabs && uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
   The frontend's Vite dev proxy reaches the backend by its compose service name (`http://backend:8000`, set via `BACKEND_URL`), so `http://localhost:8080/api/*` works end-to-end.

## Manual setup (no devcontainer)

**Frontend** (from repo root):
```bash
npm ci
npm run dev          # http://localhost:8080
```

**Backend** (from `backend/twelvelabs/`):
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in real values
python scripts/setup_index.py   # one-time: creates the TwelveLabs index, writes TWELVELABS_INDEX_ID to .env
uvicorn main:app --reload --port 8000
```
The backend must be started from `backend/twelvelabs/` so its relative imports (`from routers import ...`, `from config import ...`) resolve.

## Environment variables

All backend env vars live in `backend/twelvelabs/.env` (copy from `backend/twelvelabs/.env.example`).

| Variable | Required | Purpose | Where to get it |
|---|---|---|---|
| `TWELVELABS_API_KEY` | Yes | TwelveLabs video indexing/analysis for all upload/summary/chapters/gist/search/review endpoints. Backend refuses to start (clean exit, no traceback) if unset. | https://playground.twelvelabs.io/dashboard/api-key |
| `TWELVELABS_INDEX_ID` | Effectively yes | TwelveLabs index ID. Health check works without it; upload/review/search/summary endpoints return a clean `500` if unset. | Run `python scripts/setup_index.py` once (writes it to `.env`) |
| `ELEVENLABS_API_KEY` | No | Text-to-speech on `/api/tts` only. Endpoint returns a clean `500` if unset — no crash. | https://elevenlabs.io/app/settings/api-keys |
| `CORS_ORIGINS` | No | Comma-separated list of allowed frontend origins. Defaults to `http://localhost:8080`. | — |

Also required at runtime (not env vars): outbound network access to `api.twelvelabs.io`, `api.elevenlabs.io` (if TTS used), Google Translate (via `deep-translator`, used by TTS for non-English text), and `fonts.googleapis.com` (frontend, Google Fonts `@import`).

## Testing

Frontend: `npm test` (runs `vitest run`). Currently 1 trivial test — `src/test/example.test.ts` — expected result: `Test Files 1 passed (1)`, `Tests 1 passed (1)`.

Backend: no automated test suite exists (no `test_*.py`/`*_test.py` files, pytest not in `requirements.txt`). Manual verification: `python -m compileall -q backend/twelvelabs` should print no errors, and `curl http://localhost:8000/api/health` should return `{"status":"ok"}`.

## Deployment

Two separate production images (frontend static build served by nginx, backend FastAPI/uvicorn) — build and run each independently:

```bash
# Frontend (from repo root)
docker build -t medvisit-frontend .
docker run -p 8080:80 medvisit-frontend

# Backend (from backend/twelvelabs/)
docker build -t medvisit-backend -f Dockerfile .
docker run --env-file .env -p 8000:8000 medvisit-backend
```

When deploying, set `CORS_ORIGINS` on the backend to the frontend's real origin, and point the frontend's API calls (`src/lib/api.ts`, `BASE_URL = "/api"`) at the backend through your reverse proxy / load balancer — there is no built-in production proxy (the Vite dev proxy only exists in `npm run dev`).

This container runs on any host (Fly.io, Render, a VPS with Docker) — see
[DEPLOYMENT.md](../DEPLOYMENT.md) in the Projects root for the full walkthrough.

## Known limitations

- **State is 100% in-memory** (`task_registry`, and per-router caches for summaries/chapters/gists/medications/documents). A backend restart loses all uploaded-video progress and doctor review decisions — no database, no persistent volume. Acceptable for hackathon scope; would need a real datastore for production.
- **No authentication/authorization.** All routes (`/doctor`, `/patient`, `/dashboard`) and all backend endpoints (including doctor-only `/api/review/*/approve`, `/api/review/*/override`) are open to any client. Fine for a demo, not safe to deploy publicly as-is.
- **TwelveLabs/ElevenLabs-dependent behavior is unverified in this pass** — verification here confirmed the backend builds, starts, and serves `/api/health` with a placeholder key, and fails cleanly without one; it did not exercise real video upload/indexing/analysis/TTS, which require live API keys and real quota.
- Google Fonts `@import` in `src/index.css` is placed after the `@tailwind` directives, which is invalid CSS import ordering (Vite warns at build time) and requires outbound network access to `fonts.googleapis.com` at page load.
- `npm audit` reports 20 vulnerabilities (1 low, 6 moderate, 12 high, 1 critical) in frontend dependencies as of this pass — not remediated here (out of scope), recommend reviewing `npm audit fix`.
