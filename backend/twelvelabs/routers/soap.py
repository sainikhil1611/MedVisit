import json
import logging
import re
from fastapi import APIRouter, HTTPException
from services.twelvelabs_client import TwelveLabsClient

router = APIRouter()
client = TwelveLabsClient()
logger = logging.getLogger(__name__)

SOAP_PROMPT = (
    "You are a medical scribe analyzing a recorded doctor-patient consultation. "
    "Produce a structured SOAP note. "
    "Return ONLY a valid JSON object with exactly these four string keys:\n"
    "subjective: What the patient reported — symptoms, complaints, history, and concerns in their own words.\n"
    "objective: Measurable clinical data — vitals, lab values, physical exam findings, and other observable facts.\n"
    "assessment: The doctor's diagnosis, clinical impressions, and analysis of the patient's condition.\n"
    "plan: Next steps — treatments prescribed, referrals made, lifestyle recommendations, and follow-up schedule.\n"
    "Write each value as a single concise paragraph. "
    "Do not include markdown, code fences, or any keys other than the four listed. "
    'Example: {"subjective":"Patient reports chest tightness...","objective":"BP 142/88 mmHg, HR 78...","assessment":"Essential hypertension, suboptimally controlled...","plan":"Increase Lisinopril to 10mg daily..."}'
)

# In-memory cache — TwelveLabs /summarize is rate-limited
_soap_cache: dict[str, dict] = {}

_SOAP_KEYS = {"subjective", "objective", "assessment", "plan"}


def _extract_soap_json(raw: str) -> dict | None:
    """Try increasingly lenient strategies to pull a SOAP JSON object out of `raw`."""
    text = raw.strip()

    # 1. Strip markdown code fences (``` or ```json)
    if text.startswith("```"):
        inner = text.split("```", 2)[1]
        if inner.startswith("json"):
            inner = inner[4:]
        text = inner.strip()

    # 2. Direct parse
    try:
        obj = json.loads(text)
        if isinstance(obj, dict) and _SOAP_KEYS.issubset(obj):
            return obj
    except json.JSONDecodeError:
        pass

    # 3. Extract first {...} block that contains all four SOAP keys
    match = re.search(r'\{[^{}]*\}', text, re.DOTALL)
    if match:
        try:
            obj = json.loads(match.group())
            if isinstance(obj, dict) and _SOAP_KEYS.issubset(obj):
                return obj
        except json.JSONDecodeError:
            pass

    # 4. Greedy: find outermost { ... } in case of nested quotes
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end > start:
        try:
            obj = json.loads(text[start:end + 1])
            if isinstance(obj, dict) and _SOAP_KEYS.issubset(obj):
                return obj
        except json.JSONDecodeError:
            pass

    return None


def _extract_soap_text(raw: str) -> dict | None:
    """Parse plain-text SOAP notes with labelled headers like 'Subjective: ...'."""
    # Match any of the four keys (case-insensitive) followed by a colon
    pattern = re.compile(
        r'(?:^|\n)\s*(?P<key>subjective|objective|assessment|plan)\s*:[ \t]*',
        re.IGNORECASE,
    )
    matches = list(pattern.finditer(raw))
    if not matches:
        return None

    result: dict[str, str] = {}
    for i, m in enumerate(matches):
        key = m.group("key").lower()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(raw)
        result[key] = raw[start:end].strip()

    if not _SOAP_KEYS.issubset(result):
        return None
    return result


@router.get("/soap/{video_id}")
async def get_soap(video_id: str):
    if video_id in _soap_cache:
        return {"video_id": video_id, **_soap_cache[video_id]}

    try:
        raw = await client.generate_summary(video_id, SOAP_PROMPT, temperature=0.1)
    except Exception as e:
        logger.error("SOAP generation failed for %s: %s", video_id, e)
        raise HTTPException(status_code=502, detail=f"TwelveLabs error: {e}")

    logger.debug("SOAP raw response for %s: %r", video_id, raw[:500])

    soap = _extract_soap_json(raw)
    if soap is None:
        soap = _extract_soap_text(raw)
    if soap is None:
        logger.warning(
            "SOAP parse failed for %s; raw response was: %r",
            video_id,
            raw[:1000],
        )
        soap = {
            "subjective": raw,
            "objective": "",
            "assessment": "",
            "plan": "",
        }

    _soap_cache[video_id] = soap
    return {"video_id": video_id, **soap}
