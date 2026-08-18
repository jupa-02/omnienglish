from fastapi import APIRouter
from app.services.toefl_ielts_engine import (
    toefl_engine,
    FullTOEFLExam,
    TOEFLSubmission,
    TOEFLCertificateOut,
)

router = APIRouter(prefix="/certification", tags=["TOEFL & IELTS Standardized Certification"])

@router.get("/exam", response_model=FullTOEFLExam)
async def get_standardized_exam():
    """Returns the full standardized test simulation with all 4 skills (Reading, Listening, Speaking, Writing)."""
    return toefl_engine.get_full_exam()

@router.post("/evaluate", response_model=TOEFLCertificateOut)
async def evaluate_certification_exam(submission: TOEFLSubmission):
    """
    Evaluates all 4 test sections, calculates official TOEFL score (0-120),
    IELTS band equivalent (0-9), and issues the verified CEFR certificate.
    """
    return toefl_engine.evaluate_submission(submission)
