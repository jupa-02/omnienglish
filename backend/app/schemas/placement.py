from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Any
from datetime import datetime

# Diagnostic item models
class ClozeQuestion(BaseModel):
    id: str
    cefr_level: str # 'A1', 'A2', 'B1', 'B2', 'C1'
    category: str # 'grammar_prepositions', 'grammar_tenses', 'lexicon_false_friends', 'contrastive_syntax'
    sentence_with_blank: str
    options: List[str]
    correct_option: str
    contrastive_tip_es: str # Explanation in Spanish highlighting L1 interference

class ListeningQuestion(BaseModel):
    id: str
    cefr_level: str
    audio_text: str # Spoken script
    audio_speed: float # 0.85, 1.0, 1.15
    question_text: str
    options: List[str]
    correct_option: str
    inference_key: str

class EconomicsLexiconQuestion(BaseModel):
    id: str
    term: str
    part_of_speech: str
    definition_prompt: str
    options: List[str]
    correct_option: str
    subfield: str # 'macro', 'micro', 'econometrics', 'finance'
    example_usage: str

class SpokenPrompt(BaseModel):
    prompt_id: str
    scenario_title: str
    instructions_en: str
    instructions_es: str
    target_keywords: List[str]
    expected_duration_seconds: int = 60

class DiagnosticExamStartResponse(BaseModel):
    session_id: str
    cloze_questions: List[ClozeQuestion]
    listening_questions: List[ListeningQuestion]
    economics_questions: List[EconomicsLexiconQuestion]
    spoken_prompt: SpokenPrompt

class DiagnosticSubmission(BaseModel):
    user_id: Optional[str] = None
    cloze_answers: Dict[str, str] # question_id -> selected_option
    listening_answers: Dict[str, str] # question_id -> selected_option
    economics_answers: Dict[str, str] # question_id -> selected_option
    spoken_audio_transcript: Optional[str] = None
    spoken_audio_duration: Optional[float] = None
    target_study_days: int = 60 # 30 or 60 days

class SpokenEvaluationMetrics(BaseModel):
    lexical_diversity_ttr: float
    cefr_vocabulary_level: str
    grammatical_complexity_score: float
    wpm_speaking_rate: float
    contrastive_errors_detected: List[str]
    phonetic_clarity_score: float
    feedback_es: str

class DayPlanItem(BaseModel):
    day: int
    focus_topic: str
    target_skill: str # 'grammar_contrast', 'listening_speed', 'economics_pitch', 'voice_drills'
    minutes_recommended: int
    suggested_nodes: List[str]

class DiagnosticResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    overall_cefr: str
    grammar_score: float
    listening_score: float
    speaking_score: float
    economics_vocab_score: float
    radar_metrics: Dict[str, float]
    spoken_evaluation: Optional[SpokenEvaluationMetrics] = None
    contrastive_weaknesses: List[Dict[str, str]]
    study_plan_days: int
    study_roadmap: List[DayPlanItem]
    created_at: datetime = Field(default_factory=datetime.utcnow)
