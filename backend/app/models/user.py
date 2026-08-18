import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Date, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    current_cefr_level = Column(String(5), default="A1")
    xp_points = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    streak_freeze_count = Column(Integer, default=2)
    last_activity_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    node_progress = relationship("UserNodeProgress", back_populates="user", cascade="all, delete-orphan")
    fsrs_cards = relationship("UserFSRSCard", back_populates="user", cascade="all, delete-orphan")
    diagnostic_exams = relationship("DiagnosticExam", back_populates="user", cascade="all, delete-orphan")
