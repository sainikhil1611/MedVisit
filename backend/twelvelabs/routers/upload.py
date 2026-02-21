import asyncio
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from services.twelvelabs_client import TwelveLabsClient
from config import TWELVELABS_INDEX_ID, MAX_VIDEO_SIZE_BYTES

router = APIRouter()
client = TwelveLabsClient()

# In-memory task registry (video_id → metadata) — no DB needed for hackathon
task_registry: dict = {}


async def _post_index_pipeline(task_id: str, index_id: str):
    """After video is indexed, pre-generate and cache summary, chapters, gist, and medications.

    Doing all generation here (sequentially to respect rate limits) means the
    frontend's first GET will always hit the cache instead of calling TwelveLabs.
    """
    from services.medication_extractor import extract_medications
    from routers.summary import generate_and_cache_summary
    from routers.chapters import generate_and_cache_chapters
    from routers.gist import generate_and_cache_gist

    try:
        video_id = await client.wait_until_ready(task_id)
        task_registry[task_id]["video_id"] = video_id
        task_registry[task_id]["status"] = "ready"

        # Run sequentially to avoid hitting the /summarize rate limit
        # (gist uses a separate endpoint so it can run in parallel with the others)
        await asyncio.gather(
            generate_and_cache_gist(video_id),
            extract_medications(video_id),
            return_exceptions=True,
        )
        # /summarize endpoints are rate-limited — call one at a time
        await generate_and_cache_summary(video_id)
        await generate_and_cache_chapters(video_id)

    except Exception as e:
        task_registry[task_id]["status"] = "failed"
        task_registry[task_id]["error"] = str(e)


@router.post("/upload")
async def upload_recording(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    appointment_id: str = Form(...),
    patient_id: str = Form(...),
    doctor_id: str = Form(...),
):
    if not TWELVELABS_INDEX_ID:
        raise HTTPException(
            status_code=500,
            detail="TWELVELABS_INDEX_ID not set. Run scripts/setup_index.py first.",
        )

    contents = await video.read()
    if len(contents) > MAX_VIDEO_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Video exceeds 2 GB limit.")

    user_metadata = {
        "appointment_id": appointment_id,
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "medication_status": "pending_review",
    }

    result = await client.create_task(
        index_id=TWELVELABS_INDEX_ID,
        video_bytes=contents,
        filename=video.filename or "recording.mp4",
        user_metadata=user_metadata,
    )

    task_id = result.get("_id")
    video_id = result.get("video_id")

    task_registry[task_id] = {
        "task_id": task_id,
        "video_id": video_id,
        "appointment_id": appointment_id,
        "patient_id": patient_id,
        "status": "indexing",
    }

    # Kick off background polling + post-processing
    background_tasks.add_task(_post_index_pipeline, task_id, TWELVELABS_INDEX_ID)

    return {
        "task_id": task_id,
        "video_id": video_id,
        "appointment_id": appointment_id,
        "status": "indexing",
        "message": "Video uploaded and indexing started.",
    }


@router.get("/upload/status/{task_id}")
async def get_upload_status(task_id: str):
    if task_id not in task_registry:
        # Fall back to asking TwelveLabs directly
        data = await client.get_task_status(task_id)
        return {"task_id": task_id, "status": data.get("status"), "video_id": data.get("video_id")}
    return task_registry[task_id]


@router.get("/video/{video_id}")
async def get_video_info(video_id: str):
    """Return video metadata including HLS stream URL for in-browser playback."""
    if not TWELVELABS_INDEX_ID:
        raise HTTPException(status_code=500, detail="TWELVELABS_INDEX_ID not set.")
    try:
        video = await client.get_video(TWELVELABS_INDEX_ID, video_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"TwelveLabs error: {e}")

    hls = video.get("hls") or {}
    return {
        "video_id": video_id,
        "stream_url": hls.get("video_url"),
        "thumbnail_url": (hls.get("thumbnail_urls") or [None])[0],
    }
