import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.anyio
async def test_auth_demo_guest():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/auth/demo-guest")
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert "user" in data

@pytest.mark.anyio
async def test_curriculum_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Get units
        res = await ac.get("/api/v1/curriculum/units")
        assert res.status_code == 200
        units = res.json()
        assert isinstance(units, list)
        assert len(units) >= 1

        # Get node
        node_id = units[0]["nodes"][0]["id"]
        res_node = await ac.get(f"/api/v1/curriculum/nodes/{node_id}")
        assert res_node.status_code == 200
        node = res_node.json()
        assert node["id"] == node_id

        # Submit drill attempt
        submit_payload = {
            "node_id": node_id,
            "user_answers": {
                "ex_1_1_1": "It is"
            },
            "time_spent_seconds": 12
        }
        res_submit = await ac.post(f"/api/v1/curriculum/nodes/{node_id}/submit", json=submit_payload)
        assert res_submit.status_code == 200
        sub_data = res_submit.json()
        assert "score_percentage" in sub_data
        assert "xp_earned" in sub_data

@pytest.mark.anyio
async def test_gamification_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Leaderboard
        res_lb = await ac.get("/api/v1/gamification/leaderboard")
        assert res_lb.status_code == 200
        lb_data = res_lb.json()
        assert "leaderboard" in lb_data
        assert len(lb_data["leaderboard"]) >= 1

        # Streak
        res_st = await ac.get("/api/v1/gamification/streak")
        assert res_st.status_code == 200
        st_data = res_st.json()
        assert "current_streak" in st_data

@pytest.mark.anyio
async def test_certification_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Get exam
        res_exam = await ac.get("/api/v1/certification/exam")
        assert res_exam.status_code == 200
        exam_data = res_exam.json()
        assert "exam_id" in exam_data
        assert "reading_section" in exam_data
        assert "listening_section" in exam_data
        assert "speaking_task" in exam_data
        assert "writing_task" in exam_data

        # Evaluate submission
        eval_payload = {
            "candidate_name": "Scholar Sandra",
            "reading_answers": {
                q["id"]: q["options"][0] for q in exam_data["reading_section"]["questions"]
            },
            "listening_answers": {
                q["id"]: q["options"][0] for q in exam_data["listening_section"]
            },
            "speaking_transcript": "Central bank digital currencies could improve cross border settlement efficiency but require careful risk management.",
            "speaking_duration_sec": 45.0,
            "writing_essay_text": "Central bank digital currencies present both opportunities and challenges for modern monetary policy. On one hand, they facilitate faster settlement and lower transaction costs. On the other hand, they may cause commercial bank disintermediation if depositors shift funds rapidly."
        }
        res_eval = await ac.post("/api/v1/certification/evaluate", json=eval_payload)
        assert res_eval.status_code == 200
        eval_data = res_eval.json()
        assert "certificate_id" in eval_data
        assert "cefr_certified_level" in eval_data
        assert "toefl_total_score" in eval_data

@pytest.mark.anyio
async def test_ai_chat_and_models():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Models
        res_models = await ac.get("/api/v1/ai/models")
        assert res_models.status_code == 200
        models_data = res_models.json()
        assert "models" in models_data
        assert len(models_data["models"]) >= 1

        # Chat Turn
        chat_payload = {
            "model": models_data["models"][0]["name"],
            "messages": [
                {"role": "user", "content": "Hello! Can you help me practice economic vocabulary?"}
            ],
            "persona": "tutor",
            "target_cefr": "B1"
        }
        res_chat = await ac.post("/api/v1/ai/chat", json=chat_payload)
        assert res_chat.status_code == 200
        chat_data = res_chat.json()
        assert "reply" in chat_data

        # Evaluate writing
        writing_payload = {
            "text": "The monetary politics should consider the inflation expectations.",
            "task_type": "essay"
        }
        res_write = await ac.post("/api/v1/ai/evaluate-writing", json=writing_payload)
        assert res_write.status_code == 200
        write_data = res_write.json()
        assert "evaluation_markdown" in write_data or "feedback" in write_data
        assert write_data["status"] == "success"
