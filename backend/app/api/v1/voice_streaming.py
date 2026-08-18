import json
from typing import List, Dict, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from pydantic import BaseModel
from app.services.pronunciation_eval import pronunciation_evaluator
from app.services.proactive_voice_agent import proactive_voice_agent
from app.services.whisper_stt import whisper_service
from app.services.chatterbox_tts import chatterbox_service
from app.schemas.voice import VoiceEvaluationResult

router = APIRouter(prefix="/voice", tags=["Voice Streaming & Evaluation"])

class VoiceEvalDirectRequest(BaseModel):
    spoken_text: str
    target_sentence: Optional[str] = None
    duration_seconds: float = 4.0

class VoiceConverseRequest(BaseModel):
    persona_key: str = "emma"
    user_transcript: str
    conversation_history: List[Dict[str, str]] = []
    target_cefr: str = "B1"

class ChatterboxSynthesizeRequest(BaseModel):
    text: str
    persona_key: str = "emma"
    use_paralinguistics: bool = True

@router.get("/personas")
async def get_voice_personas():
    """Return all available interactive voice personas with accents and personalities."""
    return {"personas": proactive_voice_agent.PERSONAS}

@router.get("/chatterbox/info")
async def get_chatterbox_info():
    """Return Resemble AI Chatterbox model metadata, variants, and paralinguistic tag support."""
    return chatterbox_service.get_supported_personas()

@router.post("/chatterbox/synthesize")
async def synthesize_with_chatterbox(request: ChatterboxSynthesizeRequest):
    """
    Synthesize human-like speech with Resemble AI Chatterbox,
    applying zero-shot voice cloning profiles and paralinguistic tags ([chuckle], [laugh], [sigh]).
    """
    return await chatterbox_service.generate_speech(
        text=request.text,
        persona_key=request.persona_key,
        use_paralinguistics=request.use_paralinguistics
    )

@router.post("/converse")
async def handle_voice_converse(request: VoiceConverseRequest):
    """
    Handle a real-time proactive voice conversation turn (Praktika / NVIDIA Persona style).
    """
    return await proactive_voice_agent.generate_proactive_turn(
        persona_key=request.persona_key,
        user_transcript=request.user_transcript,
        conversation_history=request.conversation_history,
        target_cefr=request.target_cefr
    )

@router.post("/transcribe-audio")
async def transcribe_audio_file(
    audio_file: UploadFile = File(...),
    language: str = Form("en")
):
    """
    Transcribe recorded audio file (.webm, .wav, .mp3) when clientside Web Speech API fails.
    """
    audio_bytes = await audio_file.read()
    transcript = await whisper_service.transcribe_audio_bytes(audio_bytes, language=language)
    return {
        "status": "success",
        "transcript": transcript,
        "filename": audio_file.filename,
        "bytes_received": len(audio_bytes)
    }

@router.post("/evaluate-text", response_model=VoiceEvaluationResult)
async def evaluate_voice_text(request: VoiceEvalDirectRequest):
    """
    Directly evaluate transcribed spoken text for Spanish L1 contrastive phonetic markers,
    minimal pairs (/iː/ vs /ɪ/, /b/ vs /v/), initial /s/ prosthetic vowel, and WPM rate.
    """
    return pronunciation_evaluator.evaluate_transcript(
        spoken_text=request.spoken_text,
        target_sentence=request.target_sentence,
        duration_seconds=request.duration_seconds
    )

@router.websocket("/ws")
async def voice_websocket_endpoint(websocket: WebSocket):
    """
    WebSocket channel for bi-directional live audio/text streaming,
    instant phoneme heatmap generation, and conversational feedback.
    """
    await websocket.accept()
    try:
        while True:
            raw_data = await websocket.receive_text()
            try:
                msg = json.loads(raw_data)
                text = msg.get("text", "")
                target = msg.get("target_sentence")
                duration = float(msg.get("duration", 3.0))

                eval_res = pronunciation_evaluator.evaluate_transcript(
                    spoken_text=text,
                    target_sentence=target,
                    duration_seconds=duration
                )

                await websocket.send_json({
                    "status": "success",
                    "evaluation": eval_res.model_dump()
                })
            except Exception as e:
                await websocket.send_json({"status": "error", "message": str(e)})
    except WebSocketDisconnect:
        pass
