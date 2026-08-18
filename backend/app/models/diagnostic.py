import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class DiagnosticExam(Base):
    __tablename__ = "diagnostic_exams"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    overall_cefr = Column(String(5), nullable=False) # 'A1', 'A2', 'B1', 'B2', 'C1'
    grammar_score = Column(Float, nullable=False) # 0-100
    listening_score = Column(Float, nullable=False) # 0-100
    speaking_score = Column(Float, nullable=False) # 0-100
    economics_vocab_score = Column(Float, nullable=False) # 0-100
    radar_metrics = Column(JSON, nullable=False) # {grammar, listening, speaking, economics_lexicon, fluency, pronunciation}
    study_plan_days = Column(Integer, default=60)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="diagnostic_exams")
