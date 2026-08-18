import re
import random
from typing import Dict, Any, List, Optional
from app.services.llm_service import llm_service
from app.services.pronunciation_eval import pronunciation_evaluator

class ProactiveVoiceAgent:
    """
    Proactive Real-Time Conversational AI Engine inspired by Praktika and NVIDIA Persona.
    Features:
    - Zero-lag natural conversation loop with proactive conversational hooks.
    - Gentle recast (correcting Spanish L1 errors naturally without breaking flow).
    - Affective filter detection (modulating pacing and tone when hesitation is detected).
    - Authentic native cultural cadence (British Oxford, Silicon Valley American, Sydney Australian).
    """

    PERSONAS = {
        "emma": {
            "name": "Emma",
            "accent": "British RP (Oxford)",
            "voice_name": "British English",
            "personality": "Warm, intellectual, and supportive Oxford fellow. Speaks with crisp British enunciation and gentle encouragement.",
            "greeting": "Hello! I'm Emma, your British conversational partner. It's lovely to meet you. What kind of topics or goals are on your mind today?",
            "speech_rate": 0.95,
            "pitch": 1.05
        },
        "liam": {
            "name": "Liam",
            "accent": "General American (Silicon Valley)",
            "voice_name": "American English",
            "personality": "Energetic, clear, and modern tech founder. Focuses on pragmatic vocabulary and dynamic natural cadence.",
            "greeting": "Hey there! Liam here. Ready to jump into some fast-paced, real-world conversation. What have you been working on recently?",
            "speech_rate": 1.0,
            "pitch": 1.0
        },
        "chloe": {
            "name": "Chloe",
            "accent": "Australian Native (Sydney)",
            "voice_name": "Australian English",
            "personality": "Friendly, expressive, and patient fluency mentor. Perfect for building spontaneous speaking confidence.",
            "greeting": "G'day! I'm Chloe from Sydney. Don't worry at all about making mistakes—just speak your mind! How's your day treating you?",
            "speech_rate": 0.95,
            "pitch": 1.1
        },
        "arthur": {
            "name": "Arthur",
            "accent": "British Formal (Diplomatic)",
            "voice_name": "British Formal",
            "personality": "Diplomatic, structured, and articulate debate partner. Enhances academic connectors and C1 rhetoric.",
            "greeting": "A very warm welcome. I am Arthur. Shall we examine a pressing global topic or discuss your strategic career objectives?",
            "speech_rate": 0.9,
            "pitch": 0.95
        }
    }

    async def generate_proactive_turn(
        self,
        persona_key: str,
        user_transcript: str,
        conversation_history: List[Dict[str, str]],
        target_cefr: str = "B1"
    ) -> Dict[str, Any]:
        """
        Processes the user's spoken transcript, performs SLA error detection,
        and generates a proactive, engaging response with natural audio hooks.
        """
        persona = self.PERSONAS.get(persona_key.lower(), self.PERSONAS["emma"])
        
        # 1. Clean transcript and check for empty input
        clean_text = user_transcript.strip()
        if not clean_text:
            return {
                "ai_reply": f"I'm listening closely! Whenever you're ready, feel free to share your thoughts.",
                "recast_feedback": None,
                "affective_filter": {"confidence_score": 75, "state": "calm", "detected_fillers": 0},
                "phonetic_eval": None,
                "persona": persona
            }

        # 2. Pronunciation / Spanish L1 contrastive analysis
        phonetic_eval = pronunciation_evaluator.evaluate_transcript(
            spoken_text=clean_text,
            target_sentence=None,
            duration_seconds=max(2.0, len(clean_text.split()) * 0.4)
        )

        # 3. Detect hesitation / filler words (Affective Filter Metric)
        fillers = re.findall(r'\b(um|uh|eh|er|like|este|mmm)\b', clean_text, re.IGNORECASE)
        filler_count = len(fillers)
        words = clean_text.split()
        word_count = len(words)
        
        confidence_score = max(50, min(98, 90 - (filler_count * 7) + (5 if word_count >= 8 else -5)))
        affective_state = "confident" if confidence_score >= 85 else ("relaxed" if confidence_score >= 70 else "anxious")

        # 4. Detect common Spanish L1 interference errors for gentle recast
        recast_feedback = None
        if re.search(r'\b(is|was)\s+(important|necessary|possible|difficult)\b', clean_text, re.I) and not re.search(r'\bit\s+(is|was)\b', clean_text, re.I):
            recast_feedback = "Tip: In English, remember the subject pronoun: 'It is important' rather than 'Is important'."
        elif re.search(r'\bdepends?\s+of\b', clean_text, re.I):
            recast_feedback = "Native phrase: In English we say 'depends on', not 'depends of'."
        elif re.search(r'\bthe\s+(inflation|money|technology|education)\b', clean_text, re.I) and not re.search(r'\bthe\s+inflation\s+rate\b', clean_text, re.I):
            recast_feedback = "Grammar note: General concepts usually don't take 'the' (e.g. 'inflation is high')."

        # 5. Build system prompt tailored for proactive spoken dialogue
        system_prompt = (
            f"You are {persona['name']}, an AI conversation partner with a {persona['accent']} accent.\n"
            f"Personality: {persona['personality']}\n"
            f"Target CEFR level: {target_cefr}.\n"
            "CRITICAL CONVERSATIONAL RULES:\n"
            "1. Speak naturally as in a LIVE spoken voice call. Keep responses concise (2-4 sentences max).\n"
            "2. Always be proactive and engaging: acknowledge the user's idea, share a brief insight, and END WITH AN OPEN FOLLOW-UP QUESTION to keep the dialogue flowing effortlessly.\n"
            "3. If the user makes a minor grammar slip, recast it naturally in your reply without lecturing.\n"
            "4. NEVER output markdown code blocks or bulleted lists. Output ONLY natural, spoken English dialogue."
        )

        messages = [
            {"role": m["role"], "content": m["content"]}
            for m in conversation_history[-6:]
        ]
        messages.append({"role": "user", "content": clean_text})

        # Query Ollama or intelligent local fallback
        ollama_res = await llm_service.chat_completion(
            messages=messages,
            system_prompt=system_prompt,
            temperature=0.6
        )

        ai_reply = ollama_res.get("content", "").strip()
        # Clean any accidental quotes or formatting
        ai_reply = re.sub(r'^["\']|["\']$', '', ai_reply).strip()

        if not ai_reply or ollama_res.get("status") == "fallback":
            # High-quality contextual fallback
            follow_ups = [
                f"That's really interesting how you put that. How does that compare to what you usually experience in your daily routine?",
                f"I completely see your point. What do you think is the biggest advantage of approaching it that way?",
                f"That makes total sense! Could you share a specific example of when that happened recently?",
                f"Fascinating perspective! If you had to convince a skeptical colleague about this, what would you say?"
            ]
            ai_reply = f"I hear what you're saying about {words[-1] if words else 'that'}. {random.choice(follow_ups)}"

        return {
            "ai_reply": ai_reply,
            "recast_feedback": recast_feedback,
            "affective_filter": {
                "confidence_score": confidence_score,
                "state": affective_state,
                "detected_fillers": filler_count
            },
            "phonetic_eval": phonetic_eval.model_dump() if phonetic_eval else None,
            "persona": persona
        }

proactive_voice_agent = ProactiveVoiceAgent()
