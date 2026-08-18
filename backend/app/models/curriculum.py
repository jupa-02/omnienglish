import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class CurriculumUnit(Base):
    __tablename__ = "curriculum_units"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cefr_level = Column(String(5), nullable=False) # 'A1', 'A2', 'B1', 'B2', 'C1'
    unit_number = Column(Integer, nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    icon_name = Column(String(50), default="book")

    nodes = relationship("LessonNode", back_populates="unit", cascade="all, delete-orphan", order_by="LessonNode.order_index")

class LessonNode(Base):
    __tablename__ = "lesson_nodes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    unit_id = Column(String(36), ForeignKey("curriculum_units.id", ondelete="CASCADE"), nullable=False)
    node_type = Column(String(30), nullable=False) # 'standard_drill', 'voice_roleplay', 'chart_pitch', 'boss_challenge'
    title = Column(String(150), nullable=False)
    order_index = Column(Integer, nullable=False)
    xp_reward = Column(Integer, default=20)
    track = Column(String(20), default="general") # 'general' | 'economics'
    content_payload = Column(JSON, nullable=False) # Exercise JSON data

    unit = relationship("CurriculumUnit", back_populates="nodes")
    user_progress = relationship("UserNodeProgress", back_populates="node", cascade="all, delete-orphan")

class UserNodeProgress(Base):
    __tablename__ = "user_node_progress"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    node_id = Column(String(36), ForeignKey("lesson_nodes.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default="locked") # 'locked', 'unlocked', 'completed', 'mastered'
    score_percentage = Column(Float, default=0.0)
    completed_at = Column(DateTime, nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "node_id", name="unique_user_node"),
    )

    user = relationship("User", back_populates="node_progress")
    node = relationship("LessonNode", back_populates="user_progress")
