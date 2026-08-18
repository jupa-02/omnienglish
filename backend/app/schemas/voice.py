from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class PhonemeScore(BaseModel):
    phoneme: str
    ipa: str
    score: float # 0.0 to 1.0
    is_contrastive_risk: bool = False # e.g. /iː/ vs /ɪ/
    tip_es: Optional[str] = None

class VoiceEvaluationResult(BaseModel):
    transcript: str
    target_sentence: Optional[str] = None
    overall_accuracy: float
    fluency_wpm: float
    phoneme_breakdown: List[PhonemeScore]
    l1_interference_alerts: List[str]
    xp_earned: int = 15
