from fastapi import APIRouter, HTTPException
from services.twelvelabs_client import TwelveLabsClient

router = APIRouter()
client = TwelveLabsClient()

PATIENT_SUMMARY_PROMPT = (
    "You are summarizing a doctor-patient conversation for the patient. "
    "Use plain, friendly English with no medical jargon. "
    "If a medical term must be used, explain it in parentheses immediately after. "
    "Focus on: 1) What the doctor found (diagnosis or observations), "
    "2) What the patient should do next (action items), "
    "3) Any follow-up appointments or tests scheduled. "
    "Keep the tone warm and reassuring. "
    "Target audience: a person with no medical background."
)

# In-memory cache — TwelveLabs /summarize is rate-limited to 1 req/hour
_summary_cache: dict[str, str] = {}


async def generate_and_cache_summary(video_id: str) -> str:
    if video_id in _summary_cache:
        return _summary_cache[video_id]
    text = await client.generate_summary(video_id, PATIENT_SUMMARY_PROMPT, temperature=0.3)
    _summary_cache[video_id] = text
    return text


@router.get("/summary/{video_id}")
async def get_summary(video_id: str):
    from services.medication_extractor import get_medications
    from config import TWELVELABS_INDEX_ID

    try:
        summary_text = await generate_and_cache_summary(video_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"TwelveLabs error: {e}")

    # Attach medication plan only if doctor has approved
    medication_plan = None
    try:
        videos = await client.list_videos(TWELVELABS_INDEX_ID)
        videos = [v for v in videos if v.get("_id") == video_id]

        if videos:
            meta = videos[0].get("user_metadata") or {}
            med_status = meta.get("medication_status", "pending_review")
            if med_status in ("approved", "overridden"):
                override_text = meta.get("medication_override_text")
                meds = get_medications(video_id) or []
                medication_plan = {
                    "source": "doctor_manual" if override_text else "doctor_approved_ai",
                    "medications": meds if not override_text else [],
                    "override_text": override_text,
                    "status": med_status,
                    "reviewed_by": meta.get("doctor_id"),
                }
    except Exception:
        pass  # Non-critical — medication plan is optional

    return {
        "video_id": video_id,
        "summary": summary_text,
        "medication_plan": medication_plan,
    }
