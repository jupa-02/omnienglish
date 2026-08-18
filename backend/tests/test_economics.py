import pytest
from app.services.economics_engine import EconomicsESPEngine
from app.schemas.economics import ChartPitchEvaluationRequest, FedDebateTurnRequest, AcademicWritingRequest

def test_chart_pitch_evaluator():
    engine = EconomicsESPEngine()
    req = ChartPitchEvaluationRequest(
        scenario_id="cpi_inflation_shock",
        spoken_transcript="Inflation skyrocketed to a 40-year peak and subsequently tumbled following rate hikes.",
        audio_duration_seconds=30.0
    )
    res = engine.evaluate_chart_pitch(req)
    assert res.overall_score > 70
    assert len(res.used_key_phrases) >= 1

def test_academic_writing_copilot():
    engine = EconomicsESPEngine()
    req = AcademicWritingRequest(
        text_to_review="This empirical paper proves definitively that the inflation increases with debt.",
        genre="abstract"
    )
    feedback = engine.review_academic_writing(req)
    assert "proves definitively" not in feedback.improved_text
    assert len(feedback.identified_issues) >= 1
