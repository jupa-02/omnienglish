import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.user import User
from app.models.diagnostic import DiagnosticExam
from app.schemas.placement import (
    DiagnosticExamStartResponse,
    DiagnosticSubmission,
    DiagnosticResultOut,
)
from app.services.placement_engine import placement_engine

router = APIRouter(prefix="/placement", tags=["Adaptive Placement Test"])

@router.get("/start", response_model=DiagnosticExamStartResponse)
async def start_placement_test():
    """
    Initiate the 15-minute adaptive placement test.
    Returns:
    1. 10 Adaptive Cloze grammar items spanning A1 through C1 with Spanish contrastive points.
    2. 3 Progressive-speed listening audio exercises.
    3. Economics & Quantitative lexicon screening questions.
    4. 60-second spoken response simulation prompt.
    """
    return placement_engine.start_exam()

@router.post("/submit", response_model=DiagnosticResultOut)
async def submit_placement_test(
    submission: DiagnosticSubmission,
    db: AsyncSession = Depends(get_db)
):
    """
    Process answers for all 4 test sections:
    - Cloze grammar accuracy & L1 Spanish interference detection
    - Listening comprehension inference
    - Economics lexicon mastery
    - 60s Speech recording analysis (TTR lexical diversity, grammatical complexity, WPM, phonetics)
    
    Generates:
    - Calibrated CEFR level (A1, A2, B1, B2, C1)
    - 6-axis Radar competency scores
    - Dynamic 30 or 60-day daily study roadmap
    """
    result = placement_engine.evaluate_submission(submission)

    # Persist in database if user_id is provided
    if submission.user_id:
        try:
            # Check user exists
            user_res = await db.execute(select(User).where(User.id == submission.user_id))
            user = user_res.scalars().first()
            if user:
                # Update user's current CEFR level
                user.current_cefr_level = result.overall_cefr
                user.xp_points = (user.xp_points or 0) + 100 # Bonus XP for completing placement

                exam_record = DiagnosticExam(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    overall_cefr=result.overall_cefr,
                    grammar_score=result.grammar_score,
                    listening_score=result.listening_score,
                    speaking_score=result.speaking_score,
                    economics_vocab_score=result.economics_vocab_score,
                    radar_metrics=result.radar_metrics,
                    study_plan_days=result.study_plan_days
                )
                db.add(exam_record)
                await db.commit()
                result.id = exam_record.id
        except Exception as e:
            print(f"Notice: Diagnostic database persistence logged ({e}).")

    return result

@router.get("/history/{user_id}", response_model=List[DiagnosticResultOut])
async def get_user_diagnostic_history(user_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve historical diagnostic results for a specific user."""
    res = await db.execute(
        select(DiagnosticExam).where(DiagnosticExam.user_id == user_id).order_by(DiagnosticExam.created_at.desc())
    )
    records = res.scalars().all()
    
    output = []
    for r in records:
        plan = placement_engine.generate_study_plan(r.overall_cefr, r.study_plan_days)
        output.append(DiagnosticResultOut(
            id=r.id,
            overall_cefr=r.overall_cefr,
            grammar_score=r.grammar_score,
            listening_score=r.listening_score,
            speaking_score=r.speaking_score,
            economics_vocab_score=r.economics_vocab_score,
            radar_metrics=r.radar_metrics,
            contrastive_weaknesses=[],
            study_plan_days=r.study_plan_days,
            study_roadmap=plan,
            created_at=r.created_at
        ))
    return output
