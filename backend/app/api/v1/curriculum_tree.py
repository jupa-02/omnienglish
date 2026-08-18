import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.curriculum import CurriculumUnit, LessonNode, UserNodeProgress
from app.models.user import User
from app.schemas.curriculum import (
    CurriculumUnitOut,
    LessonNodeOut,
    LessonSubmission,
    LessonResultOut
)

router = APIRouter(prefix="/curriculum", tags=["Skill Tree Curriculum"])

@router.get("/units", response_model=List[CurriculumUnitOut])
async def get_curriculum_units(
    user_id: Optional[str] = None,
    track: Optional[str] = Query(None, description="Filter by 'general' or 'economics'"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all curriculum units and lesson nodes, annotated with user progress status.
    """
    query = select(CurriculumUnit).options(selectinload(CurriculumUnit.nodes)).order_by(CurriculumUnit.unit_number)
    result = await db.execute(query)
    units = result.scalars().all()

    # Get user progress map if user_id provided
    progress_map = {}
    if user_id:
        p_res = await db.execute(select(UserNodeProgress).where(UserNodeProgress.user_id == user_id))
        for p in p_res.scalars().all():
            progress_map[p.node_id] = p

    output_units: List[CurriculumUnitOut] = []
    
    first_node_unlocked = False

    for unit in units:
        node_outs: List[LessonNodeOut] = []
        for idx, node in enumerate(unit.nodes):
            if track and node.track != track and node.track != "general":
                continue

            p = progress_map.get(node.id)
            if p:
                status = p.status
                score = p.score_percentage
            else:
                # First node is unlocked by default
                if not first_node_unlocked:
                    status = "unlocked"
                    first_node_unlocked = True
                else:
                    status = "locked"
                score = 0.0

            node_outs.append(LessonNodeOut(
                id=node.id,
                unit_id=node.unit_id,
                node_type=node.node_type,
                title=node.title,
                order_index=node.order_index,
                xp_reward=node.xp_reward,
                track=node.track,
                status=status,
                score_percentage=score,
                content_payload=node.content_payload
            ))

        output_units.append(CurriculumUnitOut(
            id=unit.id,
            cefr_level=unit.cefr_level,
            unit_number=unit.unit_number,
            title=unit.title,
            description=unit.description,
            icon_name=unit.icon_name,
            nodes=node_outs
        ))

    return output_units

@router.get("/nodes/{node_id}", response_model=LessonNodeOut)
async def get_lesson_node(node_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve full interactive content payload for a specific lesson node."""
    res = await db.execute(select(LessonNode).where(LessonNode.id == node_id))
    node = res.scalars().first()
    if not node:
        raise HTTPException(status_code=404, detail="Lesson node not found.")

    return LessonNodeOut(
        id=node.id,
        unit_id=node.unit_id,
        node_type=node.node_type,
        title=node.title,
        order_index=node.order_index,
        xp_reward=node.xp_reward,
        track=node.track,
        status="unlocked",
        score_percentage=0.0,
        content_payload=node.content_payload
    )

@router.post("/nodes/{node_id}/submit", response_model=LessonResultOut)
async def submit_lesson(
    node_id: str,
    submission: LessonSubmission,
    user_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Evaluate user's answers on interactive lesson drill, calculate score,
    award XP, update streak, and unlock the next node.
    """
    res = await db.execute(select(LessonNode).where(LessonNode.id == node_id))
    node = res.scalars().first()
    if not node:
        raise HTTPException(status_code=404, detail="Lesson node not found.")

    content = node.content_payload or {}
    exercises = content.get("exercises", [])

    correct_count = 0
    feedback_breakdown = []

    for ex in exercises:
        ex_id = ex.get("id")
        correct_ans = str(ex.get("correct_answer", "")).strip().lower()
        user_ans = str(submission.user_answers.get(ex_id, "")).strip().lower()

        is_correct = (user_ans == correct_ans)
        if is_correct:
            correct_count += 1

        feedback_breakdown.append({
            "exercise_id": ex_id,
            "is_correct": is_correct,
            "user_answer": user_ans,
            "correct_answer": correct_ans,
            "contrastive_note_es": ex.get("contrastive_note_es")
        })

    total_count = max(len(exercises), 1)
    score_pct = round((correct_count / total_count) * 100.0, 1)
    status_str = "mastered" if score_pct >= 90 else ("completed" if score_pct >= 60 else "unlocked")
    xp_earned = node.xp_reward if score_pct >= 60 else 5

    # Update DB if user provided
    next_node_id = None
    streak = 1
    if user_id:
        u_res = await db.execute(select(User).where(User.id == user_id))
        user = u_res.scalars().first()
        if user:
            user.xp_points = (user.xp_points or 0) + xp_earned
            streak = user.current_streak or 1

            # Update progress
            p_res = await db.execute(
                select(UserNodeProgress).where(
                    UserNodeProgress.user_id == user_id,
                    UserNodeProgress.node_id == node_id
                )
            )
            prog = p_res.scalars().first()
            if not prog:
                prog = UserNodeProgress(
                    id=uuid.uuid4(),
                    user_id=user_id,
                    node_id=node_id,
                    status=status_str,
                    score_percentage=score_pct,
                    completed_at=datetime.utcnow()
                )
                db.add(prog)
            else:
                prog.status = status_str
                prog.score_percentage = max(prog.score_percentage or 0, score_pct)
                prog.completed_at = datetime.utcnow()

            # Find next node to unlock
            next_res = await db.execute(
                select(LessonNode).where(
                    LessonNode.unit_id == node.unit_id,
                    LessonNode.order_index > node.order_index
                ).order_by(LessonNode.order_index)
            )
            next_node = next_res.scalars().first()
            if next_node:
                next_node_id = next_node.id
                next_p_res = await db.execute(
                    select(UserNodeProgress).where(
                        UserNodeProgress.user_id == user_id,
                        UserNodeProgress.node_id == next_node.id
                    )
                )
                next_prog = next_p_res.scalars().first()
                if not next_prog:
                    next_prog = UserNodeProgress(
                        id=uuid.uuid4(),
                        user_id=user_id,
                        node_id=next_node.id,
                        status="unlocked",
                        score_percentage=0.0
                    )
                    db.add(next_prog)

            await db.commit()

    return LessonResultOut(
        node_id=node.id,
        score_percentage=score_pct,
        xp_earned=xp_earned,
        correct_count=correct_count,
        total_count=total_count,
        status=status_str,
        unlocked_next_node_id=next_node_id,
        streak_updated=streak,
        feedback_breakdown=feedback_breakdown
    )
