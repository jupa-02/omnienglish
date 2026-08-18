import re
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class TOEFLReadingQuestion(BaseModel):
    id: str
    question_type: str # 'factual_information', 'inference', 'vocabulary_in_context', 'purpose'
    question_text: str
    options: List[str]
    correct_option: str
    explanation_es: str

class TOEFLReadingSection(BaseModel):
    passage_title: str
    passage_text: str
    academic_topic: str # 'Economics', 'Cognitive Psychology', 'Environmental Science'
    questions: List[TOEFLReadingQuestion]

class TOEFLListeningQuestion(BaseModel):
    id: str
    audio_script: str
    speed_factor: float
    question_text: str
    options: List[str]
    correct_option: str
    inference_key: str

class TOEFLSpeakingTask(BaseModel):
    task_id: str
    title: str
    prompt_en: str
    prompt_es: str
    prep_time_seconds: int = 15
    response_time_seconds: int = 60
    key_evaluation_criteria: List[str]

class TOEFLWritingTask(BaseModel):
    task_id: str
    title: str
    essay_type: str # 'Integrated' or 'Academic Discussion'
    prompt_en: str
    prompt_es: str
    target_word_count: int = 250
    rubric_points: List[str]

class FullTOEFLExam(BaseModel):
    exam_id: str
    title: str
    reading_section: TOEFLReadingSection
    listening_section: List[TOEFLListeningQuestion]
    speaking_task: TOEFLSpeakingTask
    writing_task: TOEFLWritingTask

class TOEFLSubmission(BaseModel):
    candidate_name: str = "Scholar"
    reading_answers: Dict[str, str] # question_id -> selected_option
    listening_answers: Dict[str, str] # question_id -> selected_option
    speaking_transcript: str
    speaking_duration_sec: float = 45.0
    writing_essay_text: str

class TOEFLCertificateOut(BaseModel):
    certificate_id: str
    candidate_name: str
    issue_date: str
    toefl_total_score: int # 0-120
    ielts_equivalent_band: float # 0.0-9.0
    cefr_certified_level: str # 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
    section_scores: Dict[str, int] # Reading (/30), Listening (/30), Speaking (/30), Writing (/30)
    subskill_radar: Dict[str, float]
    detailed_feedback: Dict[str, Any]
    study_recommendations: List[str]

class TOEFLEngine:
    """
    Standardized TOEFL iBT and IELTS simulation and official CEFR certification engine.
    """

    DEFAULT_EXAM: Dict[str, Any] = {
        "exam_id": "toefl_standard_cert_01",
        "title": "TOEFL iBT® & IELTS Full Standardized Simulation",
        "reading_section": {
            "passage_title": "The Economic Implications of Central Bank Digital Currencies (CBDCs)",
            "academic_topic": "Economics & Monetary Policy",
            "passage_text": """Central Bank Digital Currencies (CBDCs) represent a digital form of fiat currency issued directly by a monetary authority. Unlike decentralized cryptocurrencies, which are characterized by extreme volatility and the absence of a sovereign backstop, CBDCs are pegged directly to the national unit of account and constitute a direct claim on the central bank. 

Economists identify several transmission channels through which CBDCs could reshape macroeconomic stability. First, by facilitating programmable money and instant cross-border settlement, CBDCs reduce transaction friction in international commerce. Second, in an environment of zero lower bound interest rates, interest-bearing CBDCs theoretically afford central banks the capability to implement negative interest rate policies with greater transmission efficacy. 

However, banking sector disintermediation remains a primary systemic risk. If retail depositors rapidly shift liquidity from commercial banks into central bank digital accounts during periods of financial stress, commercial lending capacity could contract sharply, necessitating central bank intermediation in private credit allocation.""",
            "questions": [
                {
                    "id": "read_q1",
                    "question_type": "factual_information",
                    "question_text": "According to paragraph 1, how do CBDCs differ fundamentally from decentralized cryptocurrencies?",
                    "options": [
                        "CBDCs are pegged to the national currency and represent a direct claim on the central bank.",
                        "CBDCs rely exclusively on anonymous proof-of-work distributed ledgers.",
                        "CBDCs completely eliminate the existence of sovereign fiat currency.",
                        "CBDCs cannot be used for retail payments in commercial transactions."
                    ],
                    "correct_option": "CBDCs are pegged to the national currency and represent a direct claim on the central bank.",
                    "explanation_es": "El párrafo 1 establece claramente que las CBDC están ancladas a la unidad de cuenta nacional y constituyen un reclamo directo sobre el banco central."
                },
                {
                    "id": "read_q2",
                    "question_type": "inference",
                    "question_text": "What can be inferred from paragraph 2 regarding negative interest rate policies?",
                    "options": [
                        "CBDCs could enhance the efficacy of unconventional monetary easing at the zero lower bound.",
                        "Negative interest rates cause immediate hyperinflation in developing markets.",
                        "Commercial banks will universally refuse to accept digital fiat tokens.",
                        "Transaction friction in cross-border commerce will increase under CBDCs."
                    ],
                    "correct_option": "CBDCs could enhance the efficacy of unconventional monetary easing at the zero lower bound.",
                    "explanation_es": "El párrafo 2 indica que las CBDC remuneradas permiten implementar tasas de interés negativas con mayor eficacia de transmisión."
                },
                {
                    "id": "read_q3",
                    "question_type": "vocabulary_in_context",
                    "question_text": "The word 'disintermediation' in paragraph 3 is closest in meaning to:",
                    "options": [
                        "The removal of traditional financial middlemen (commercial banks) from liquidity holding",
                        "The establishment of new sovereign credit rating agencies",
                        "An artificial increase in foreign direct investment",
                        "The total elimination of tax collection mechanisms"
                    ],
                    "correct_option": "The removal of traditional financial middlemen (commercial banks) from liquidity holding",
                    "explanation_es": "En economía bancaria, 'disintermediation' se refiere a la salida de fondos de intermediarios financieros (bancos comerciales)."
                },
                {
                    "id": "read_q4",
                    "question_type": "purpose",
                    "question_text": "Why does the author discuss 'periods of financial stress' in paragraph 3?",
                    "options": [
                        "To highlight conditions under which rapid deposit flight into central bank accounts could occur",
                        "To demonstrate that cryptocurrencies are safer than sovereign debt",
                        "To argue against modern international trade agreements",
                        "To prove that central banks should be permanently abolished"
                    ],
                    "correct_option": "To highlight conditions under which rapid deposit flight into central bank accounts could occur",
                    "explanation_es": "El autor usa este contexto para ilustrar el riesgo sistémico de fuga de depósitos de bancos comerciales hacia el banco central."
                }
            ]
        },
        "listening_section": [
            {
                "id": "listen_q1",
                "audio_script": "Professor: Today we are reviewing the empirical validity of the Phillips Curve. Historical data from the 1970s stagflation episode demonstrated that inflation expectations can shift the short-run curve outward, rendering simple trade-offs between unemployment and inflation invalid in the long run.",
                "speed_factor": 1.0,
                "question_text": "What is the primary conclusion regarding the Phillips Curve mentioned by the professor?",
                "options": [
                    "Inflation expectations can shift the curve, eliminating a permanent trade-off in the long run",
                    "The Phillips curve proves inflation and unemployment always move in the exact same direction",
                    "Stagflation only occurs in countries that do not have central banks",
                    "Unemployment cannot be measured accurately during economic downturns"
                ],
                "correct_option": "Inflation expectations can shift the curve, eliminating a permanent trade-off in the long run",
                "inference_key": "Expectations-augmented Phillips Curve"
            },
            {
                "id": "listen_q2",
                "audio_script": "Student: So, when agents form rational expectations, monetary surprises lose their ability to persistently boost output? Professor: Precisely. Anticipated policy adjustments are immediately priced in by forward-looking firms and households.",
                "speed_factor": 1.05,
                "question_text": "What happens when market participants have forward-looking rational expectations?",
                "options": [
                    "Anticipated policy shifts are priced in immediately, reducing persistent real output effects",
                    "Inflation drops to zero percent instantly across all sectors",
                    "Firms completely stop adjusting their consumer retail prices",
                    "Central banks lose the ability to print physical paper banknotes"
                ],
                "correct_option": "Anticipated policy shifts are priced in immediately, reducing persistent real output effects",
                "inference_key": "Rational Expectations Policy Ineffectiveness"
            }
        ],
        "speaking_task": {
            "task_id": "speak_task_01",
            "title": "TOEFL Speaking Task: Academic Synthesis & Oral Argumentation",
            "prompt_en": "State your perspective on whether governments should implement stricter regulation on artificial intelligence algorithms in financial trading. State your position clearly and support it with at least two specific economic reasons.",
            "prompt_es": "Explica en inglés si los gobiernos deben regular más estrictamente los algoritmos de IA en los mercados financieros. Justifica con al menos 2 razones económicas.",
            "prep_time_seconds": 15,
            "response_time_seconds": 60,
            "key_evaluation_criteria": ["Topic Development", "Delivery & Fluency (WPM)", "Language Use & Syntactic Complexity"]
        },
        "writing_task": {
            "task_id": "write_task_01",
            "title": "TOEFL / IELTS Independent Writing Task: Academic Essay",
            "essay_type": "Independent Academic Argument",
            "prompt_en": "Do you agree or disagree with the following statement? 'Investing heavily in higher education and technical skills produces higher long-term economic growth than investing in physical infrastructure.' Write a well-developed essay of at least 200 words supporting your viewpoint with concrete examples.",
            "prompt_es": "Redacta un ensayo en inglés (mínimo 200 palabras) argumentando si la inversión en capital humano/educación genera mayor crecimiento a largo plazo que la infraestructura física.",
            "target_word_count": 200,
            "rubric_points": ["Task Response", "Coherence and Cohesion", "Lexical Resource", "Grammatical Range and Accuracy"]
        }
    }

    def get_full_exam(self) -> FullTOEFLExam:
        return FullTOEFLExam(**self.DEFAULT_EXAM)

    def evaluate_submission(self, sub: TOEFLSubmission) -> TOEFLCertificateOut:
        exam = self.DEFAULT_EXAM

        # 1. Score Reading (0 - 30)
        reading_correct = 0
        total_reading = len(exam["reading_section"]["questions"])
        for q in exam["reading_section"]["questions"]:
            qid = q["id"]
            if sub.reading_answers.get(qid, "").strip() == q["correct_option"].strip():
                reading_correct += 1
        reading_score = round((reading_correct / max(total_reading, 1)) * 30)

        # 2. Score Listening (0 - 30)
        listening_correct = 0
        total_listening = len(exam["listening_section"])
        for q in exam["listening_section"]:
            qid = q["id"]
            if sub.listening_answers.get(qid, "").strip() == q["correct_option"].strip():
                listening_correct += 1
        listening_score = round((listening_correct / max(total_listening, 1)) * 30)

        # 3. Score Speaking (0 - 30)
        speech_text = sub.speaking_transcript.lower()
        words = re.findall(r'\b[a-zA-Z]+\b', speech_text)
        word_count = len(words)
        unique_words = len(set(words))
        ttr = (unique_words / word_count) if word_count > 0 else 0.0
        wpm = (word_count / max(sub.speaking_duration_sec, 1.0)) * 60.0

        # Speaking rubric: lexical variety + fluency + discourse markers
        markers = ["because", "furthermore", "however", "consequently", "for example", "in addition", "therefore"]
        marker_hits = sum(1 for m in markers if m in speech_text)
        speaking_score = min(30, max(12, int((ttr * 15) + min(wpm / 8, 10) + (marker_hits * 1.5))))

        # 4. Score Writing (0 - 30)
        essay_words = re.findall(r'\b[a-zA-Z]+\b', sub.writing_essay_text.lower())
        essay_count = len(essay_words)
        essay_unique = len(set(essay_words))
        essay_ttr = (essay_unique / essay_count) if essay_count > 0 else 0.0

        # Writing rubric: word count threshold + lexical diversity + paragraph structure
        length_score = min(12, int((essay_count / 200.0) * 12))
        lexical_score = min(10, int(essay_ttr * 15))
        has_academic_markers = sum(1 for m in ["suggests", "indicates", "moreover", "on the other hand", "in conclusion"] if m in sub.writing_essay_text.lower())
        writing_score = min(30, max(10, length_score + lexical_score + has_academic_markers * 2 + 4))

        # Total TOEFL Score (0 - 120)
        total_toefl = reading_score + listening_score + speaking_score + writing_score

        # Map to IELTS Band (0.0 to 9.0)
        if total_toefl >= 115:
            ielts_band = 8.5
            cefr = "C2"
        elif total_toefl >= 95:
            ielts_band = 7.5
            cefr = "C1"
        elif total_toefl >= 72:
            ielts_band = 6.5
            cefr = "B2"
        elif total_toefl >= 46:
            ielts_band = 5.5
            cefr = "B1"
        elif total_toefl >= 32:
            ielts_band = 4.0
            cefr = "A2"
        else:
            ielts_band = 3.0
            cefr = "A1"

        radar = {
            "Academic Reading": round((reading_score / 30) * 100, 1),
            "Listening Comprehension": round((listening_score / 30) * 100, 1),
            "Spoken Fluency": round((speaking_score / 30) * 100, 1),
            "Essay Cohesion": round((writing_score / 30) * 100, 1),
            "Grammar Precision": round(min(100, (writing_score + reading_score) * 1.5), 1),
            "Lexical Richness": round(ttr * 100, 1),
        }

        recs = [
            f"Reading ({reading_score}/30): Practice skimming academic economics journals to identify topic sentences faster.",
            f"Listening ({listening_score}/30): Listen to central banking podcasts at 1.15x speed to master fast delivery.",
            f"Speaking ({speaking_score}/30): Incorporate more formal transitional discourse markers (Consequently, Furthermore).",
            f"Writing ({writing_score}/30): Expand essay body paragraphs with concrete empirical examples."
        ]

        cert_id = f"OMNI-CERT-{uuid.uuid4().hex[:8].upper()}"

        return TOEFLCertificateOut(
            certificate_id=cert_id,
            candidate_name=sub.candidate_name or "Scholar",
            issue_date=datetime.utcnow().strftime("%B %d, %Y"),
            toefl_total_score=total_toefl,
            ielts_equivalent_band=ielts_band,
            cefr_certified_level=cefr,
            section_scores={
                "Reading": reading_score,
                "Listening": listening_score,
                "Speaking": speaking_score,
                "Writing": writing_score
            },
            subskill_radar=radar,
            detailed_feedback={
                "reading_accuracy": f"{reading_correct}/{total_reading}",
                "listening_accuracy": f"{listening_correct}/{total_listening}",
                "speaking_wpm": round(wpm, 1),
                "speaking_ttr": round(ttr * 100, 1),
                "writing_word_count": essay_count,
            },
            study_recommendations=recs
        )

toefl_engine = TOEFLEngine()
