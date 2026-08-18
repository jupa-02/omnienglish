import edge_tts
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter(prefix="/tts", tags=["Text-to-Speech"])

class TTSRequest(BaseModel):
    text: str
    voice: str = "nova"

@router.post("/stream")
async def stream_tts(request: TTSRequest):
    """
    Streams high-quality human-like audio using Edge TTS (No API key required).
    """
    try:
        # Map frontend voice requests to high-quality Edge TTS Neural voices
        voice_map = {
            "nova": "en-US-AriaNeural",
            "alloy": "en-US-GuyNeural",
            "emma": "en-GB-SoniaNeural",
            "liam": "en-US-ChristopherNeural",
            "chloe": "en-AU-NatashaNeural",
            "arthur": "en-GB-RyanNeural"
        }
        
        voice_name = voice_map.get(request.voice.lower(), "en-US-AriaNeural")
        
        communicate = edge_tts.Communicate(request.text, voice_name)
        
        async def generate():
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    yield chunk["data"]

        return StreamingResponse(generate(), media_type="audio/mpeg")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stream TTS: {str(e)}")
