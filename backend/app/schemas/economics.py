from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from uuid import UUID

# Lab 1: Econometrics
class EconometricScenario(BaseModel):
    id: str
    title: str
    model_type: str # 'OLS', 'Two-Way Fixed Effects', 'Instrumental Variables', 'Difference-in-Differences'
    formula_latex: str
    regression_table: Dict[str, Any]
    target_interpretations: List[str]
    exercise_prompt: str
    contrastive_warning_es: str

# Lab 2: Chart Pitching
class ChartDataPoint(BaseModel):
    period: str
    value: float
    secondary_value: Optional[float] = None
    annotation: Optional[str] = None

class ChartPitchScenario(BaseModel):
    id: str
    title: str
    indicator_type: str # 'inflation_cpi', 'unemployment_rate', 'yield_curve', 'gdp_growth'
    context_en: str
    context_es: str
    data_points: List[ChartDataPoint]
    key_movements: List[str] # e.g. "skyrocketed in Q2", "tumbled following rate hike", "plateaued around 3.5%"
    suggested_vocabulary: List[Dict[str, str]] # word, definition, collocations
    target_pitch_seconds: int = 45

class ChartPitchEvaluationRequest(BaseModel):
    scenario_id: str
    spoken_transcript: str
    audio_duration_seconds: float = 30.0

class ChartPitchEvaluationResponse(BaseModel):
    overall_score: float # 0-100
    vocabulary_richness_score: float
    trend_accuracy_score: float
    fluency_score: float
    used_key_phrases: List[str]
    missed_key_phrases: List[str]
    contrastive_grammar_fixes: List[Dict[str, str]]
    model_pitch_audio_url: Optional[str] = None
    model_pitch_script: str
    xp_earned: int = 40

# Lab 3: Central Banking Policy
class FedDebateMessage(BaseModel):
    role: str # 'user' | 'chair' | 'system'
    content: str
    audio_url: Optional[str] = None
    economic_indicators: Optional[Dict[str, Any]] = None

class FedDebateTurnRequest(BaseModel):
    conversation_history: List[FedDebateMessage]
    scenario_name: str # e.g. "Stagflation Shock & Interest Rate Decision"
    user_argument: str

class FedDebateTurnResponse(BaseModel):
    chair_response_en: str
    chair_response_es_summary: str
    feedback_on_argument: str
    economic_persuasiveness_score: float
    contrastive_correction: Optional[Dict[str, str]] = None
    xp_earned: int = 25

# Lab 4: Strategic Pricing
class StrategicPricingScenario(BaseModel):
    id: str
    title: str
    market_structure: str # 'Monopoly', 'Oligopoly', 'Monopolistic Competition'
    elasticity_scenario: str
    marginal_cost: float
    current_price: float
    prompt_en: str
    prompt_es: str
    key_terms: List[str]

# Lab 5: Academic Writing Copilot
class AcademicWritingRequest(BaseModel):
    text_to_review: str
    genre: str # 'abstract', 'journal_cover_letter', 'policy_memo', 'referee_report'

class AcademicWritingFeedback(BaseModel):
    improved_text: str
    tone_formality_score: float
    academic_hedging_score: float # Proper use of suggests, indicates, might point to
    identified_issues: List[Dict[str, str]] # original, suggested, rule, explanation_es
    xp_earned: int = 30
