from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.economics import (
    EconometricScenario,
    ChartPitchScenario,
    ChartPitchEvaluationRequest,
    ChartPitchEvaluationResponse,
    FedDebateTurnRequest,
    FedDebateTurnResponse,
    AcademicWritingRequest,
    AcademicWritingFeedback,
)
from app.services.economics_engine import economics_engine

router = APIRouter(prefix="/economics", tags=["Economics ESP Lab"])

# Lab 1: Econometrics
@router.get("/econometrics/scenarios", response_model=List[EconometricScenario])
async def get_econometric_scenarios():
    """Retrieve econometric scenarios (OLS, TWFE, IV) with formulas and regression tables."""
    return economics_engine.get_econometric_scenarios()

# Lab 2: Chart Pitching Arena
@router.get("/charts/scenarios", response_model=List[ChartPitchScenario])
async def get_chart_pitch_scenarios():
    """Retrieve macroeconomic time-series chart data points and vocabulary prompts."""
    return economics_engine.get_chart_scenarios()

@router.post("/charts/evaluate", response_model=ChartPitchEvaluationResponse)
async def evaluate_chart_pitch(request: ChartPitchEvaluationRequest):
    """
    Evaluate oral pitch describing macroeconomic time-series.
    Scores vocabulary richness, trend description accuracy, fluency, and Spanish contrastive fixes.
    """
    return economics_engine.evaluate_chart_pitch(request)

# Lab 3: Central Banking FOMC Policy Debate
@router.post("/fed-debate/turn", response_model=FedDebateTurnResponse)
async def process_fed_debate_turn(request: FedDebateTurnRequest):
    """
    Simulate conversational turn with the Federal Reserve Chair AI on interest rate policy.
    """
    return economics_engine.process_fed_debate_turn(request)

# Lab 5: Academic Writing Copilot
@router.post("/writing/review", response_model=AcademicWritingFeedback)
async def review_academic_writing(request: AcademicWritingRequest):
    """
    Review and polish economics abstracts, paper introductions, and policy memos.
    Evaluates tone formality, academic hedging, and Spanish L1 interference.
    """
    return economics_engine.review_academic_writing(request)
