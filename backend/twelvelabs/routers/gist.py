from fastapi import APIRouter, HTTPException
from services.twelvelabs_client import TwelveLabsClient

router = APIRouter()
client = TwelveLabsClient()

# In-memory cache — keep parity with summary/chapters caching strategy
_gist_cache: dict[str, dict] = {}


async def generate_and_cache_gist(video_id: str) -> dict:
    if video_id in _gist_cache:
        return _gist_cache[video_id]
    gist = await client.generate_gist(video_id)
    _gist_cache[video_id] = gist
    return gist


@router.get("/gist/{video_id}")
async def get_gist(video_id: str):
    try:
        gist = await generate_and_cache_gist(video_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"TwelveLabs error: {e}")

    return {
        "video_id": video_id,
        "title": gist.get("title", ""),
        "topics": gist.get("topics", []),
        "hashtags": gist.get("hashtags", []),
    }
