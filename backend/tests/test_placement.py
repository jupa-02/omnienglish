import pytest
from app.services.placement_engine import AdaptivePlacementEngine
from app.schemas.placement import DiagnosticSubmission

def test_placement_start_and_structure():
    engine = AdaptivePlacementEngine()
    exam = engine.start_exam()
    
    assert len(exam.cloze_questions) >= 10
    assert len(exam.listening_questions) >= 3
    assert len(exam.economics_questions) >= 4
    assert exam.spoken_prompt is not None

def test_placement_evaluation_scoring():
    engine = AdaptivePlacementEngine()
    
    # Simulate high-scoring submission
    cloze_ans = {q["id"]: q["correct_option"] for q in engine.CLOZE_BANK}
    listen_ans = {q["id"]: q["correct_option"] for q in engine.LISTENING_BANK}
    econ_ans = {q["id"]: q["correct_option"] for q in engine.ECONOMICS_BANK}
    
    submission = DiagnosticSubmission(
        cloze_answers=cloze_ans,
        listening_answers=listen_ans,
        economics_answers=econ_ans,
        spoken_audio_transcript="The central bank should raise interest rates to tame inflation although GDP growth is decelerating.",
        spoken_audio_duration=45.0,
        target_study_days=60
    )
    
    result = engine.evaluate_submission(submission)
    assert result.overall_cefr in ["B2", "C1"]
    assert result.grammar_score == 100.0
    assert result.listening_score == 100.0
    assert result.economics_vocab_score == 100.0
    assert len(result.study_roadmap) > 0
