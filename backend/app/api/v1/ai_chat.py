from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.services.llm_service import llm_service

router = APIRouter(prefix="/ai", tags=["AI Tutor (Gemini)"])

class ChatMessage(BaseModel):
    role: str # 'user', 'assistant', 'system'
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = None
    persona: str = "tutor" # 'tutor', 'examiner', 'friend', 'economist'
    target_cefr: str = "B1"

class ChatResponse(BaseModel):
    status: str
    model_used: str
    reply: str
    feedback: Optional[Dict[str, Any]] = None

class WritingReviewRequest(BaseModel):
    text: str
    task_type: str = "essay" # 'essay', 'email', 'summary', 'debate'
    model: Optional[str] = None

@router.get("/models")
async def get_local_models():
    """Returns available AI models."""
    models = await llm_service.get_available_models()
    default_m = await llm_service.get_default_model()
    return {
        "status": "online" if models else "offline",
        "default_model": default_m,
        "models": models,
        "provider": "Google Gemini API"
    }

@router.post("/chat", response_model=ChatResponse)
async def chat_with_tutor(req: ChatRequest):
    """
    Conversational turn with Gemini AI as an interactive English partner.
    Provides reply + live pedagogical Spanish L1 contrast analysis.
    """
    system_prompts = {
        "tutor": (
            f"You are an encouraging, expert native English conversational partner. "
            f"The user's current goal is CEFR {req.target_cefr}. "
            f"Speak naturally, ask engaging open questions, and keep the dialogue flowing naturally. "
            f"Reply in 2-3 sentences. Always reply in English."
        ),
        "examiner": (
            f"You are an official TOEFL/IELTS Speaking Examiner. "
            f"Ask challenging academic questions, probe for justifications, and maintain formal, professional tone. "
            f"Keep your prompts concise and clear."
        ),
        "friend": (
            f"You are a friendly American native English speaker chatting casually in a coffee shop. "
            f"Use natural idioms, colloquial phrasing, and upbeat energy."
        ),
        "economist": (
            f"You are a quantitative macroeconomist at the Federal Reserve / Bank of England. "
            f"Engage the user in technical economic discussion using formal ESP vocabulary (TWFE, monetary policy, yield curve)."
        )
    }

    sys_prompt = system_prompts.get(req.persona, system_prompts["tutor"])
    raw_messages = [{"role": m.role, "content": m.content} for m in req.messages]

    # Get LLM conversational reply
    ai_res = await llm_service.chat_completion(
        messages=raw_messages,
        model=req.model,
        system_prompt=sys_prompt,
        temperature=0.7
    )

    # Analyze last user message for pedagogical feedback if available
    last_user_text = next((m.content for m in reversed(req.messages) if m.role == "user"), "")
    analysis = {}
    if last_user_text:
        analysis = await llm_service.analyze_language(last_user_text, model=req.model)

    return ChatResponse(
        status=ai_res.get("status", "success"),
        model_used=ai_res.get("model", "local"),
        reply=ai_res.get("content", "Hello! Let's continue practicing."),
        feedback=analysis
    )

@router.post("/evaluate-writing")
async def evaluate_writing(req: WritingReviewRequest):
    """Evaluates written work with CEFR rubrics and actionable improvements."""
    prompt = f"""You are a certified IELTS/TOEFL writing assessor.
Evaluate this student text for {req.task_type}:
\"\"\"{req.text}\"\"\"

Provide:
1. Estimated CEFR Level (A1, A2, B1, B2, C1, or C2)
2. Grammar & Spelling Corrections (bullet points)
3. Advanced Vocabulary Alternatives
4. Cohesion & Structure Advice
5. Spanish L1 interference tips (in Spanish)"""

    try:
        raw_res = await llm_service.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            model=req.model,
            system_prompt="You are an expert IELTS/TOEFL writing evaluator.",
            temperature=0.2
        )
        return {
            "status": "success",
            "evaluation_markdown": raw_res.get("content", ""),
            "model_used": raw_res.get("model", "gemma:2b")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
