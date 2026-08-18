from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.services.frontier_methodologies import (
    SPEAK_DRILL_PATTERNS,
    AVATAR_PERSONAS,
    perform_loora_upgrade,
    ARTICULATORY_DATA,
    ROLEPLAY_SCENARIOS,
    PHOTO_SCENARIOS,
    LooraUpgradeResult
)
from app.services.pronunciation_eval import pronunciation_evaluator
from app.services.llm_service import llm_service

router = APIRouter(prefix="/frontier", tags=["Frontier AI Methodologies (Speak, Praktika, Loora, ELSA, Talkpal)"])

# ==========================================
# 1. SPEAK METHOD DRILLS
# ==========================================

class SpeakEvaluationRequest(BaseModel):
    pattern_id: str
    target_sentence: str
    spoken_text: str
    duration_seconds: float
    latency_ms: int

@router.get("/speak/patterns")
async def get_speak_patterns():
    """Returns high-frequency sentence pattern drill modules."""
    return {"status": "success", "patterns": SPEAK_DRILL_PATTERNS}

@router.post("/speak/evaluate-turn")
async def evaluate_speak_turn(req: SpeakEvaluationRequest):
    """
    Evaluates motor speech automaticity, WPM, and phoneme accuracy for Speak Method drills.
    """
    eval_res = pronunciation_evaluator.evaluate_transcript(
        spoken_text=req.spoken_text,
        target_sentence=req.target_sentence,
        duration_seconds=req.duration_seconds
    )
    
    # Motor automaticity calculation (penalizes latency > 2000ms)
    latency_penalty = max(0, (req.latency_ms - 1500) / 100.0)
    motor_automaticity_score = max(30.0, min(100.0, 100.0 - latency_penalty))
    
    return {
        "status": "success",
        "target_sentence": req.target_sentence,
        "spoken_text": req.spoken_text,
        "accuracy": eval_res.overall_accuracy,
        "fluency_wpm": eval_res.fluency_wpm,
        "motor_automaticity_score": round(motor_automaticity_score, 1),
        "latency_ms": req.latency_ms,
        "phoneme_breakdown": [p.model_dump() for p in eval_res.phoneme_breakdown],
        "is_mastered": eval_res.overall_accuracy >= 80.0 and req.latency_ms <= 2500
    }

# ==========================================
# 2. PRAKTIKA AVATARS & AFFECTIVE ENGINE
# ==========================================

@router.get("/avatar/personas")
async def get_avatar_personas():
    """Returns Praktika-style avatar personas with accents and emotional pacing."""
    return {"status": "success", "personas": AVATAR_PERSONAS}

# ==========================================
# 3. LOORA EXECUTIVE DIALOGUE & UPGRADES
# ==========================================

class LooraUpgradeRequest(BaseModel):
    text: str
    domain: Optional[str] = "executive"

@router.post("/executive/upgrade", response_model=LooraUpgradeResult)
async def upgrade_executive_text(req: LooraUpgradeRequest):
    """
    Performs Loora-style real-time linguistic surgery:
    1. Exact Grammar/Syntax ERRANT tags.
    2. C1/C2 Executive native upgrade options with nuance rationale.
    3. Coherence and lexical radar metrics.
    """
    return perform_loora_upgrade(req.text)

# ==========================================
# 4. ELSA ARTICULATORY PHONEME PRECISION
# ==========================================

@router.get("/phoneme/articulatory-data")
async def get_articulatory_guides():
    """Returns anatomical tongue placement, lip shapes, and minimal pairs."""
    return {"status": "success", "guides": ARTICULATORY_DATA}

# ==========================================
# 5. TALKPAL TASK-BASED ROLEPLAYS & DEBATES
# ==========================================

@router.get("/roleplays/scenarios")
async def get_roleplay_scenarios():
    """Returns task-based immersion roleplays and debate scenarios."""
    return {"status": "success", "scenarios": ROLEPLAY_SCENARIOS}

@router.get("/photos/scenarios")
async def get_photo_scenarios():
    """Returns photo & chart oral description tasks."""
    return {"status": "success", "scenarios": PHOTO_SCENARIOS}

class RoleplayTurnRequest(BaseModel):
    scenario_id: str
    user_speech: str
    conversation_history: List[Dict[str, str]]

@router.post("/roleplays/turn")
async def process_roleplay_turn(req: RoleplayTurnRequest):
    """Generates dynamic in-character AI response and evaluates rhetorical performance."""
    scenario = next((s for s in ROLEPLAY_SCENARIOS if s["id"] == req.scenario_id), None)
    character_name = scenario["ai_character"] if scenario else "Senior Partner"
    
    # Generate conversational turn
    system_prompt = (
        f"You are {character_name} in a high-stakes professional roleplay. "
        f"Context: {scenario['objective'] if scenario else 'Executive meeting'}. "
        f"Respond in 2-3 assertive, intelligent sentences in English. Challenge the user realistically."
    )
    
    messages = [{"role": m["role"], "content": m["content"]} for m in req.conversation_history]
    messages.append({"role": "user", "content": req.user_speech})
    
    ai_turn = await llm_service.chat_completion(
        messages=messages,
        system_prompt=system_prompt,
        temperature=0.7
    )
    
    # Surgical upgrade of user argument
    upgrade = perform_loora_upgrade(req.user_speech)
    
    return {
        "status": "success",
        "ai_character": character_name,
        "ai_reply": ai_turn.get("content", "I understand your perspective, but let us look closer at the numbers."),
        "rhetorical_analysis": {
            "c1_upgrades": upgrade.c1_c2_upgrades,
            "grammar_notes": upgrade.grammar_corrections,
            "radar": upgrade.executive_radar
        }
    }
