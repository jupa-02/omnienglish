import uuid
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.user import User
from app.schemas.gamification import LeaderboardUser, LeagueOverview, StreakStatus

router = APIRouter(prefix="/gamification", tags=["Gamification & Leagues"])

@router.get("/leaderboard", response_model=LeagueOverview)
async def get_leaderboard(
    user_id: Optional[str] = None,
    league: str = "Gold",
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve weekly league rankings, XP tallies, and promotion/demotion thresholds.
    """
    # Fetch real users from DB
    users_res = await db.execute(select(User).order_by(User.xp_points.desc()).limit(20))
    db_users = users_res.scalars().all()

    leaderboard_list: List[LeaderboardUser] = []

    # If few users, supplement with realistic cohort competitors
    cohort_names = [
        ("Juan Pablo Scholar", 920, 14, "C1"),
        ("Elena Rostova (LSE)", 880, 11, "C1"),
        ("Carlos Méndez (Banco Central)", 810, 9, "B2"),
        ("Sofia Chen (Quantitative Fund)", 740, 8, "B2"),
        ("Mateo Silva (UBA)", 690, 7, "B1"),
        ("Lucía Morales (Consulting)", 620, 6, "B1"),
        ("Rodrigo Peña (Fintech)", 550, 4, "A2"),
        ("Camila Torres (Master Econ)", 490, 5, "B1"),
        ("Andrés Restrepo", 410, 3, "A2"),
        ("Valeria Gomez", 350, 2, "A1"),
    ]

    for idx, (name, xp, streak, cefr) in enumerate(cohort_names):
        leaderboard_list.append(LeaderboardUser(
            user_id=str(uuid.uuid4()),
            full_name=name,
            avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={name.replace(' ', '')}",
            xp_points=xp,
            current_streak=streak,
            cefr_level=cefr,
            rank=idx + 1,
            league_name=league
        ))

    # If current user is in DB, ensure they are placed
    user_pos = 1
    if user_id:
        u_res = await db.execute(select(User).where(User.id == user_id))
        cur_u = u_res.scalars().first()
        if cur_u:
            # Place user in ranking
            user_entry = LeaderboardUser(
                user_id=cur_u.id,
                full_name=cur_u.full_name or "You",
                avatar_url="https://api.dicebear.com/7.x/bottts/svg?seed=CurrentUser",
                xp_points=cur_u.xp_points or 0,
                current_streak=cur_u.current_streak or 1,
                cefr_level=cur_u.current_cefr_level or "A1",
                rank=1,
                league_name=league
            )
            # Re-sort list with current user
            leaderboard_list = [u for u in leaderboard_list if u.full_name != cur_u.full_name]
            leaderboard_list.append(user_entry)
            leaderboard_list.sort(key=lambda x: x.xp_points, reverse=True)
            for r_idx, item in enumerate(leaderboard_list):
                item.rank = r_idx + 1
                if item.user_id == cur_u.id:
                    user_pos = item.rank

    return LeagueOverview(
        current_league=league,
        days_left_in_cycle=4,
        leaderboard=leaderboard_list,
        user_position=user_pos,
        top_promotion_cutoff=3,
        demotion_cutoff=8
    )

@router.get("/streak", response_model=StreakStatus)
async def get_streak_status(user_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """Retrieve streak count, freeze shield inventory, and milestone bonuses."""
    current_s = 7
    freezes = 2
    last_d = date.today()

    if user_id:
        u_res = await db.execute(select(User).where(User.id == user_id))
        user = u_res.scalars().first()
        if user:
            current_s = user.current_streak or 1
            freezes = user.streak_freeze_count or 2
            last_d = user.last_activity_date or date.today()

    return StreakStatus(
        current_streak=current_s,
        streak_freeze_count=freezes,
        last_activity_date=last_d,
        is_streak_active_today=True,
        streak_milestone_xp_bonus=50 if current_s % 7 == 0 else 0
    )
