import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class VocabularyItem(Base):
    __tablename__ = "vocabulary_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lemma = Column(String(100), nullable=False, index=True)
    part_of_speech = Column(String(20), nullable=True)
    cefr_level = Column(String(5), nullable=False, index=True)
    category = Column(String(50), default="general", index=True) # 'general', 'econometrics', 'macro', 'micro', 'finance'
    definition_en = Column(Text, nullable=False)
    definition_es = Column(Text, nullable=False)
    collocations = Column(JSON, default=list)
    example_sentence = Column(Text, nullable=False)
    audio_url = Column(Text, nullable=True)

    fsrs_cards = relationship("UserFSRSCard", back_populates="vocabulary", cascade="all, delete-orphan")

class UserFSRSCard(Base):
    __tablename__ = "user_fsrs_cards"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    vocab_id = Column(String(36), ForeignKey("vocabulary_items.id", ondelete="CASCADE"), nullable=False)
    stability = Column(Float, default=0.0)
    difficulty = Column(Float, default=0.0)
    elapsed_days = Column(Integer, default=0)
    scheduled_days = Column(Integer, default=0)
    reps = Column(Integer, default=0)
    state = Column(Integer, default=0) # 0=New, 1=Learning, 2=Review, 3=Relearning
    last_review = Column(DateTime, nullable=True)
    due_date = Column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        UniqueConstraint("user_id", "vocab_id", name="unique_user_card"),
    )

    user = relationship("User", back_populates="fsrs_cards")
    vocabulary = relationship("VocabularyItem", back_populates="fsrs_cards")
