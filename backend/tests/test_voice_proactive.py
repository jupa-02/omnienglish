import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.anyio
async def test_proactive_voice_personas():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/voice/personas")
    assert response.status_code == 200
    data = response.json()
    assert "personas" in data
    assert "emma" in data["personas"]
    assert "liam" in data["personas"]
    assert "chloe" in data["personas"]
    assert "arthur" in data["personas"]

@pytest.mark.anyio
async def test_proactive_voice_converse():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "persona_key": "emma",
            "user_transcript": "I am interested in to expand the business but it depend of market interest rates.",
            "conversation_history": [
                {"role": "assistant", "content": "Hello! What is on your mind today?"}
            ],
            "target_cefr": "B2"
        }
        response = await ac.post("/api/v1/voice/converse", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "ai_reply" in data
    assert "persona" in data
    assert "affective_filter" in data
    assert "recast_feedback" in data
    assert data["persona"]["name"] == "Emma"
    # Verify SLA recast caught the preposition / gerund or depend on error
    assert data["recast_feedback"] is not None

@pytest.mark.anyio
async def test_chatterbox_info_and_synthesis():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        info_res = await ac.get("/api/v1/voice/chatterbox/info")
        assert info_res.status_code == 200
        info_data = info_res.json()
        assert "engine" in info_data
        assert "supported_paralinguistic_tags" in info_data
        assert "[chuckle]" in info_data["supported_paralinguistic_tags"]

        synth_res = await ac.post("/api/v1/voice/chatterbox/synthesize", json={
            "text": "Hello, don't worry about mistakes!",
            "persona_key": "emma",
            "use_paralinguistics": True
        })
        assert synth_res.status_code == 200
        synth_data = synth_res.json()
        assert synth_data["status"] == "ready"
        assert "formatted_text" in synth_data
