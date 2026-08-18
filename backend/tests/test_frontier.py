import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.anyio
async def test_speak_patterns_and_evaluation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Test pattern retrieval
        res = await ac.get("/api/v1/frontier/speak/patterns")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert len(data["patterns"]) >= 3

        # Test turn evaluation
        eval_payload = {
            "pattern_id": "spk_gerund_prep",
            "target_sentence": "I am interested in expanding the business to Europe.",
            "spoken_text": "I am interested in expanding the business to Europe.",
            "duration_seconds": 3.5,
            "latency_ms": 1200
        }
        eval_res = await ac.post("/api/v1/frontier/speak/evaluate-turn", json=eval_payload)
        assert eval_res.status_code == 200
        eval_data = eval_res.json()
        assert eval_data["accuracy"] >= 80.0
        assert eval_data["is_mastered"] is True

@pytest.mark.anyio
async def test_loora_executive_upgrades():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "text": "I think we need to cut costs because the bad economy is very big."
        }
        res = await ac.post("/api/v1/frontier/executive/upgrade", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "c1_c2_upgrades" in data
        assert len(data["c1_c2_upgrades"]) > 0
        assert "executive_radar" in data
        assert data["executive_radar"]["formality"] > 0

@pytest.mark.anyio
async def test_elsa_articulatory_guides():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/frontier/phoneme/articulatory-data")
        assert res.status_code == 200
        data = res.json()
        assert "/iː/ vs /ɪ/" in data["guides"]
        assert "/v/ vs /b/" in data["guides"]

@pytest.mark.anyio
async def test_talkpal_roleplays():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Scenarios
        res = await ac.get("/api/v1/frontier/roleplays/scenarios")
        assert res.status_code == 200
        data = res.json()
        assert len(data["scenarios"]) >= 3

        # Turn
        turn_payload = {
            "scenario_id": "rp_fed_debate",
            "user_speech": "We should pause interest rate hikes to preserve bank liquidity.",
            "conversation_history": [
                {"role": "assistant", "content": "How can you justify pausing rate hikes with core inflation high?"}
            ]
        }
        turn_res = await ac.post("/api/v1/frontier/roleplays/turn", json=turn_payload)
        assert turn_res.status_code == 200
        turn_data = turn_res.json()
        assert "ai_reply" in turn_data
        assert "rhetorical_analysis" in turn_data
