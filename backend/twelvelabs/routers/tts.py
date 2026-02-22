import os
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel — calm, clear, multilingual
MODEL_ID = "eleven_turbo_v2_5"      # Supports 32 languages

SUPPORTED_LANGUAGES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "hi": "Hindi",
    "ar": "Arabic",
    "pt": "Portuguese",
    "zh-CN": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
}


class TTSRequest(BaseModel):
    text: str
    language: str = "en"


@router.get("/tts/languages")
async def get_languages():
    return {"languages": SUPPORTED_LANGUAGES}


@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    if not ELEVENLABS_API_KEY:
        raise HTTPException(status_code=500, detail="ELEVENLABS_API_KEY not set in environment")

    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    # Translate to target language if not English
    if request.language != "en":
        if request.language not in SUPPORTED_LANGUAGES:
            raise HTTPException(status_code=400, detail=f"Unsupported language: {request.language}")
        try:
            from deep_translator import GoogleTranslator
            text = GoogleTranslator(source="en", target=request.language).translate(text)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Translation failed: {exc}")

    # Call ElevenLabs TTS
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
            headers={
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "text": text,
                "model_id": MODEL_ID,
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                },
            },
        )

    if not response.is_success:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"ElevenLabs error: {response.text}",
        )

    return StreamingResponse(
        iter([response.content]),
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=summary.mp3"},
    )
