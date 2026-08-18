from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Optional, Any
from datetime import datetime

class ExerciseItem(BaseModel):
    id: str
    type: str # 'multiple_choice', 'fill_in_blank', 'sentence_builder', 'voice_repetition', 'chart_interpretation'
    prompt_en: str
    prompt_es: Optional[str] = None
    target_sentence: Optional[str] = None
    audio_url: Optional[str] = None
    options: Optional[List[str]] = None
    correct_answer: str
    contrastive_note_es: Optional[str] = None # Why Spanish speakers make mistakes here
    tokens_to_arrange: Optional[List[str]] = None

class LessonNodeContent(BaseModel):
    summary: str
    grammar_focus: Optional[str] = None
    lexicon_focus: Optional[str] = None
    exercises: List[ExerciseItem]

class LessonNodeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    unit_id: str
    node_type: str
    title: str
    order_index: int
    xp_reward: int
    track: str
    status: str = "locked" # 'locked', 'unlocked', 'completed', 'mastered'
    score_percentage: float = 0.0
    content_payload: Optional[Dict[str, Any]] = None

class CurriculumUnitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    cefr_level: str
    unit_number: int
    title: str
    description: Optional[str] = None
    icon_name: str
    nodes: List[LessonNodeOut] = []

class LessonSubmission(BaseModel):
    node_id: str
    user_answers: Dict[str, str] # exercise_id -> user_answer
    time_spent_seconds: int = 120

class LessonResultOut(BaseModel):
    node_id: str
    score_percentage: float
    xp_earned: int
    correct_count: int
    total_count: int
    status: str
    unlocked_next_node_id: Optional[str] = None
    streak_updated: int
    feedback_breakdown: List[Dict[str, Any]]
