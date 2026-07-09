import os
import sys

from dotenv import load_dotenv

load_dotenv()

REQUIRED_ENV = ["TWELVELABS_API_KEY"]
_missing = [k for k in REQUIRED_ENV if not os.environ.get(k)]
if _missing:
    sys.exit(
        f"Missing required environment variables: {', '.join(_missing)}\n"
        "Copy .env.example to .env and fill in the values."
    )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import upload, summary, search, chapters, gist, review, tts, soap, document

app = FastAPI(title="Healthcare Conversation AI", version="1.0.0")

# Comma-separated list of allowed frontend origins. Defaults to the local
# Vite dev server; override in containerized/deployed environments (e.g. a
# compose service name or a production frontend URL).
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:8080").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(summary.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(chapters.router, prefix="/api")
app.include_router(gist.router, prefix="/api")
app.include_router(review.router, prefix="/api")
app.include_router(tts.router, prefix="/api")
app.include_router(soap.router, prefix="/api")
app.include_router(document.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
