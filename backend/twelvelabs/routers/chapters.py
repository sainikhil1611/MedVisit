from fastapi import APIRouter, HTTPException
from services.twelvelabs_client import TwelveLabsClient

router = APIRouter()
client = TwelveLabsClient()

CHAPTER_PROMPT = (
    "Segment this doctor-patient conversation into logical sections. "
    "Use chapter titles that a patient can understand, such as: "
    "'Checking Your Symptoms', 'Test Results Explained', "
    "'Your Medication Plan', 'What To Do Before Next Visit'. "
    "Avoid clinical abbreviations. Write chapter summaries in plain, friendly English."
)

# In-memory cache — TwelveLabs /summarize is rate-limited to 1 req/hour
_chapters_cache: dict[str, list] = {}


async def generate_and_cache_chapters(video_id: str) -> list:
    if video_id in _chapters_cache:
        return _chapters_cache[video_id]
    chapters = await client.generate_chapters(video_id, CHAPTER_PROMPT)
    _chapters_cache[video_id] = chapters
    return chapters


@router.get("/chapters/{video_id}")
async def get_chapters(video_id: str):
    try:
        chapters = await generate_and_cache_chapters(video_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"TwelveLabs error: {e}")

    normalized = [
        {
            "start": ch.get("start", 0),
            "end": ch.get("end", 0),
            "title": ch.get("chapter_title") or ch.get("title", ""),
            "summary": ch.get("chapter_summary") or ch.get("summary", ""),
        }
        for ch in chapters
    ]
    return {"video_id": video_id, "chapters": normalized}
