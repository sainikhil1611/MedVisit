from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import upload, summary, search, chapters, gist, review, tts, soap, document

app = FastAPI(title="Healthcare Conversation AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
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
