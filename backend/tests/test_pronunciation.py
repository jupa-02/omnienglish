import pytest
from app.services.pronunciation_eval import SpanishContrastivePronunciationEvaluator

def test_contrastive_spanish_prosthetic_vowel_detection():
    evaluator = SpanishContrastivePronunciationEvaluator()
    res = evaluator.evaluate_transcript("The estrategy was specifically designed.")
    assert len(res.l1_interference_alerts) >= 1
    assert any("estrategy" in alert for alert in res.l1_interference_alerts)

def test_minimal_pair_analysis():
    evaluator = SpanishContrastivePronunciationEvaluator()
    res = evaluator.evaluate_transcript("The balance sheet reached a rich valuation.")
    assert len(res.phoneme_breakdown) >= 1
    assert res.overall_accuracy > 50
