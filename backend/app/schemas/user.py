from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    current_cefr_level: str = "A1"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    current_cefr_level: Optional[str] = None
    xp_points: Optional[int] = None
    current_streak: Optional[int] = None
    streak_freeze_count: Optional[int] = None

class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    xp_points: int
    current_streak: int
    streak_freeze_count: int
    last_activity_date: date
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut
