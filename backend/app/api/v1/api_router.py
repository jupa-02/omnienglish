from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.placement import router as placement_router
from app.api.v1.curriculum_tree import router as curriculum_router
from app.api.v1.fsrs_cards import router as fsrs_router
from app.api.v1.economics_lab import router as economics_router
from app.api.v1.gamification import router as gamification_router
from app.api.v1.voice_streaming import router as voice_router
from app.api.v1.ai_chat import router as ai_chat_router
from app.api.v1.toefl_ielts import router as toefl_router
from app.api.v1.tts import router as tts_router
from app.api.v1.frontier_router import router as frontier_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(placement_router)
api_router.include_router(curriculum_router)
api_router.include_router(fsrs_router)
api_router.include_router(economics_router)
api_router.include_router(gamification_router)
api_router.include_router(voice_router)
api_router.include_router(ai_chat_router)
api_router.include_router(toefl_router)
api_router.include_router(tts_router)
api_router.include_router(frontier_router)
