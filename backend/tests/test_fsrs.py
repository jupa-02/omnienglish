import pytest
from app.services.fsrs_scheduler import FSRSScheduler

def test_fsrs_initial_ratings():
    scheduler = FSRSScheduler()
    
    # Rating 1: Again (Lapse/Fail)
    res_again = scheduler.step(current_state=0, stability=0.0, difficulty=0.0, elapsed_days=0.0, rating=1)
    assert res_again["state"] == 1 # Learning
    assert res_again["interval_days"] == 1
    assert res_again["difficulty"] > 6.0

    # Rating 3: Good (Standard Recall)
    res_good = scheduler.step(current_state=0, stability=0.0, difficulty=0.0, elapsed_days=0.0, rating=3)
    assert res_good["state"] == 2 # Review
    assert res_good["interval_days"] >= 1
    assert res_good["stability"] > res_again["stability"]

    # Rating 4: Easy
    res_easy = scheduler.step(current_state=0, stability=0.0, difficulty=0.0, elapsed_days=0.0, rating=4)
    assert res_easy["state"] == 2
    assert res_easy["interval_days"] >= res_good["interval_days"]

def test_fsrs_review_progression():
    scheduler = FSRSScheduler()
    
    # First review: Good
    step1 = scheduler.step(current_state=0, stability=0.0, difficulty=0.0, elapsed_days=0.0, rating=3)
    s1 = step1["stability"]
    d1 = step1["difficulty"]
    
    # Second review after 3 days: Good
    step2 = scheduler.step(current_state=2, stability=s1, difficulty=d1, elapsed_days=3.0, rating=3)
    assert step2["stability"] > s1
    assert step2["interval_days"] >= step1["interval_days"]
