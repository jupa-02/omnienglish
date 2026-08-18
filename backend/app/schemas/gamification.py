from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date

class LeaderboardUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: str
    full_name: str
    avatar_url: Optional[str] = None
    xp_points: int
    current_streak: int
    cefr_level: str
    rank: int
    league_name: str # 'Bronze', 'Silver', 'Gold', 'Diamond'

class LeagueOverview(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    current_league: str
    days_left_in_cycle: int
    leaderboard: List[LeaderboardUser]
    user_position: int
    top_promotion_cutoff: int
    demotion_cutoff: int

class StreakStatus(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    current_streak: int
    streak_freeze_count: int
    last_activity_date: date
    is_streak_active_today: bool
    streak_milestone_xp_bonus: int = 0
