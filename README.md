# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MedVisit is a healthcare consultation tool built for a hackathon. It records doctor-patient consultations (video), uses [TwelveLabs](https://twelvelabs.io) multimodal AI to analyze the recording, and produces:
- An AI-generated EMR (Electronic Medical Record)
- AI-extracted medication suggestions for the doctor to review/approve/override
- A patient-facing summary with timestamped video navigation

The workflow is: **Doctor uploads video → AI analyzes → Doctor reviews & approves medications → Patient views summary + medication plan**

## Architecture

### Two-service architecture

**Frontend** — React + Vite (port 8080)
**Backend** — FastAPI (port 8000)

The Vite dev server proxies all `/api/*` requests to `http://localhost:8000`, so the frontend always calls relative `/api/...` paths.

### Frontend (`src/`)

- **`src/App.tsx`** — Router root. Three routes: `/doctor`, `/patient`, `/dashboard`. Root redirects to `/doctor`.
- **`src/lib/api.ts`** — All API calls to the backend. Single source of truth for request/response types (`AIMedication`, `UploadResult`, `SummaryResult`, etc.). `VIDEO_ID_KEY` is the localStorage key used to persist `video_id` across views.
- **`src/lib/mockData.ts`** — Fallback mock data displayed when the backend hasn't returned results yet (PatientView falls back to mocks until queries resolve).
- **`src/pages/DoctorView.tsx`** — Two-step flow: `upload` → `review`. Persists `video_id` in localStorage.
- **`src/pages/PatientView.tsx`** — Reads `video_id` from localStorage, fetches gist/summary/chapters/videoInfo via TanStack Query (`staleTime: Infinity` to avoid re-fetching). Falls back to mock data while loading.
- **`src/components/VideoUpload.tsx`** — Handles file drag-drop/select, uploads to backend, polls `/api/upload/status/:taskId` every 3s until `status === "ready"`.
- **`src/components/MedicationPlanDoctor.tsx`** — Fetches pending reviews, lets doctor toggle approval per medication, edit/add/remove medications, then calls approve or override endpoint.
- **`src/components/EMRDocument.tsx`** — Renders the EMR for doctor approval.
- **`src/components/ui/`** — shadcn/ui component library (do not hand-edit these files).

### Backend (`backend/twelvelabs/`)

FastAPI app with routers, all mounted under `/api`:

| Router | Endpoints |
|--------|-----------|
| `upload.py` | `POST /api/upload`, `GET /api/upload/status/:task_id`, `GET /api/video/:video_id` |
| `summary.py` | `GET /api/summary/:video_id` |
| `gist.py` | `GET /api/gist/:video_id` |
| `chapters.py` | `GET /api/chapters/:video_id` |
| `review.py` | `GET /api/review/pending`, `POST /api/review/:video_id/approve`, `POST /api/review/:video_id/override` |

**State management**: The backend uses an in-memory `task_registry` dict (no database). Medication results are cached in `_medication_store` in `medication_extractor.py`. State is lost on restart.

**Post-upload pipeline**: After a video is uploaded and indexed by TwelveLabs, a FastAPI `BackgroundTask` runs `_post_index_pipeline` which calls `extract_medications()` using TwelveLabs' open-ended text generation API.

**`config.py`**: Reads `TWELVELABS_API_KEY` and `TWELVELABS_INDEX_ID` from environment / `.env`. The index ID must be set before the backend can handle uploads.

## Commands

### Frontend

```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run tests once (vitest)
npm run test:watch   # Run tests in watch mode
```

Run a single test file:
```bash
npx vitest run src/test/example.test.ts
```

### Backend

```bash
# From backend/twelvelabs/
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# One-time index setup (run once, writes TWELVELABS_INDEX_ID to backend/.env)
python scripts/setup_index.py

# Start the API server
uvicorn main:app --reload --port 8000
```

The backend must be started from `backend/twelvelabs/` so that relative imports (`from routers import ...`, `from config import ...`) resolve correctly.

## Environment Setup

Create `backend/twelvelabs/.env` (or `backend/.env`):
```
TWELVELABS_API_KEY=<your key>
TWELVELABS_INDEX_ID=<run setup_index.py to generate>
```

The `TWELVELABS_API_KEY` has a hardcoded fallback in `config.py` for hackathon convenience, but `TWELVELABS_INDEX_ID` must be set via the setup script or manually.

## Key Patterns

- **TanStack Query** is used for all backend fetches. `staleTime: Infinity` is used on results that shouldn't be refetched (video analysis results are immutable once complete).
- **Mock data fallback**: PatientView always shows mock data until real API data resolves — it does not show a loading skeleton for the entire page.
- **`@` path alias** maps to `src/` (configured in `vite.config.ts` and `tsconfig`).
- **Tailwind CSS** with shadcn/ui design tokens (`text-foreground`, `bg-muted`, `text-primary`, etc.). Custom semantic colors include `success`, `warning`, `accent`.
