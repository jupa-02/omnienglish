from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Any
from datetime import datetime

class VocabularyItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    lemma: str
    part_of_speech: Optional[str] = None
    cefr_level: str
    category: str
    definition_en: str
    definition_es: str
    collocations: List[str] = []
    example_sentence: str
    audio_url: Optional[str] = None

class FSRSCardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    vocab_id: str
    vocabulary: VocabularyItemOut
    stability: float
    difficulty: float
    elapsed_days: int
    scheduled_days: int
    reps: int
    state: int # 0=New, 1=Learning, 2=Review, 3=Relearning
    last_review: Optional[datetime] = None
    due_date: datetime

class FSRSReviewSubmit(BaseModel):
    card_id: str
    rating: int = Field(..., ge=1, le=4) # 1: Again, 2: Hard, 3: Good, 4: Easy

class FSRSReviewResult(BaseModel):
    card_id: str
    next_due_date: datetime
    interval_days: int
    new_stability: float
    new_difficulty: float
    state: int
    xp_earned: int = 5

class FSRSStatsOut(BaseModel):
    total_cards: int
    cards_due_today: int
    learning_count: int
    review_count: int
    retention_rate: float
