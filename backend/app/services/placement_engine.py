import re
import math
from typing import List, Dict, Any, Tuple
from app.schemas.placement import (
    ClozeQuestion,
    ListeningQuestion,
    EconomicsLexiconQuestion,
    SpokenPrompt,
    DiagnosticExamStartResponse,
    DiagnosticSubmission,
    DiagnosticResultOut,
    SpokenEvaluationMetrics,
    DayPlanItem,
)

class AdaptivePlacementEngine:
    """
    Engine for the 15-minute multi-stage entrance diagnostic test.
    Calibrates CEFR proficiency from A1 to C1 and creates personalized study plans.
    """

    CLOZE_BANK: List[Dict[str, Any]] = [
        # A1 / A2
        {
            "id": "cloze_01",
            "cefr_level": "A1",
            "category": "contrastive_syntax",
            "sentence_with_blank": "_______ very important to analyze the inflation data every month.",
            "options": ["Is", "It is", "Are", "Being"],
            "correct_option": "It is",
            "contrastive_tip_es": "En español el sujeto es tácito ('Es importante'), pero en inglés toda oración requiere un pronombre sujeto explícito ('It is important')."
        },
        {
            "id": "cloze_02",
            "cefr_level": "A2",
            "category": "grammar_prepositions",
            "sentence_with_blank": "The investment return depends _______ market volatility and consumer confidence.",
            "options": ["of", "in", "on", "from"],
            "correct_option": "on",
            "contrastive_tip_es": "En español decimos 'depende de', pero en inglés el régimen verbal obligatorio es 'depend ON'."
        },
        {
            "id": "cloze_03",
            "cefr_level": "A2",
            "category": "grammar_prepositions",
            "sentence_with_blank": "Our quantitative research team is very interested _______ analyzing time-series datasets.",
            "options": ["for", "in", "to", "about"],
            "correct_option": "in",
            "contrastive_tip_es": "El adjetivo 'interested' siempre rige la preposición 'IN' seguida de gerundio (interested in analyzing), nunca 'for'."
        },
        # B1 / B2
        {
            "id": "cloze_04",
            "cefr_level": "B1",
            "category": "lexicon_false_friends",
            "sentence_with_blank": "The government adopted a new fiscal _______ to curb the escalating debt deficit.",
            "options": ["politics", "policy", "police", "politician"],
            "correct_option": "policy",
            "contrastive_tip_es": "Falso amigo crítico: 'Policy' es la política pública o plan de acción institucional; 'Politics' es la actividad política o partidista."
        },
        {
            "id": "cloze_05",
            "cefr_level": "B1",
            "category": "grammar_tenses",
            "sentence_with_blank": "By the time the central bank raised rates, prices _______ by more than 8%.",
            "options": ["already surged", "had already surged", "have already surged", "will surge"],
            "correct_option": "had already surged",
            "contrastive_tip_es": "Uso del Past Perfect ('had surged') para indicar una acción anterior a otro evento en el pasado ('raised')."
        },
        {
            "id": "cloze_06",
            "cefr_level": "B2",
            "category": "lexicon_false_friends",
            "sentence_with_blank": "After months of negotiations, the two central banks _______ reached a currency swap agreement.",
            "options": ["eventually", "actually", "currently", "at the present"],
            "correct_option": "eventually",
            "contrastive_tip_es": "Falso amigo: 'Eventually' significa 'finalmente' o 'a la larga'. 'Actually' significa 'en realidad/de hecho' (no actualmente)."
        },
        {
            "id": "cloze_07",
            "cefr_level": "B2",
            "category": "contrastive_syntax",
            "sentence_with_blank": "Under no circumstances _______ the central bank allow hyperinflation expectations to unanchor.",
            "options": ["will", "the central bank will", "is going to", "would have"],
            "correct_option": "will",
            "contrastive_tip_es": "Inversión sintáctica negativa formal: tras 'Under no circumstances' se invierte el orden auxiliar + sujeto ('will the central bank allow')."
        },
        # C1
        {
            "id": "cloze_08",
            "cefr_level": "C1",
            "category": "econometrics_syntax",
            "sentence_with_blank": "To account for unobserved time-invariant confounders, we estimate a model with two-way _______ effects.",
            "options": ["fixed", "random", "mixed", "static"],
            "correct_option": "fixed",
            "contrastive_tip_es": "En econometría empírica, 'Two-way fixed effects' (TWFE) es el estándar canónico para controlar por heterogeneidad no observada de entidad y tiempo."
        },
        {
            "id": "cloze_09",
            "cefr_level": "C1",
            "category": "econometrics_syntax",
            "sentence_with_blank": "Given that the explanatory variable is endogenous, we exploit a rainfall shock as an _______ variable.",
            "options": ["instrumental", "intermediary", "isolated", "intuitive"],
            "correct_option": "instrumental",
            "contrastive_tip_es": "'Instrumental Variables' (IV) es la terminología técnica para resolver problemas de endogeneidad y correlación con el término de error."
        },
        {
            "id": "cloze_10",
            "cefr_level": "C1",
            "category": "academic_hedging",
            "sentence_with_blank": "The empirical findings _______ that credit friction exacerbates macroeconomic downturns.",
            "options": ["suggest", "demands", "proves definitively", "assures without doubt"],
            "correct_option": "suggest",
            "contrastive_tip_es": "En redacción académica internacional (Academic Hedging), se prefiere 'suggest / indicate' para matizar conclusiones empíricas en lugar de afirmaciones categóricas como 'proves definitively'."
        }
    ]

    LISTENING_BANK: List[Dict[str, Any]] = [
        {
            "id": "listen_01",
            "cefr_level": "A2",
            "audio_text": "The Federal Reserve chairman announced that inflation dropped to 3 percent this quarter, easing concerns among private investors.",
            "audio_speed": 0.9,
            "question_text": "What was the main outcome announced regarding inflation?",
            "options": [
                "It dropped to 3%, decreasing investor concern",
                "It surged above target, causing panic",
                "It remained completely flat all year",
                "It doubled due to higher gas prices"
            ],
            "correct_option": "It dropped to 3%, decreasing investor concern",
            "inference_key": "Inflation deceleration"
        },
        {
            "id": "listen_02",
            "cefr_level": "B1",
            "audio_text": "Although consumer expenditure rebounded slightly last month, business fixed investment plateaued due to elevated borrowing costs and geopolitical uncertainty.",
            "audio_speed": 1.0,
            "question_text": "Why did business fixed investment remain flat (plateaued)?",
            "options": [
                "High borrowing costs and geopolitical uncertainty",
                "A sharp decline in consumer expenditure",
                "A sudden cut in central bank interest rates",
                "Labor shortages in manufacturing"
            ],
            "correct_option": "High borrowing costs and geopolitical uncertainty",
            "inference_key": "Plateaued behavior rationale"
        },
        {
            "id": "listen_03",
            "cefr_level": "B2",
            "audio_text": "In our baseline two-stage least squares specification, the first-stage F-statistic comfortably exceeds the standard Stock-Yogo threshold of ten, dispelling weak instrument apprehensions.",
            "audio_speed": 1.1,
            "question_text": "What does the first-stage F-statistic exceeding ten indicate?",
            "options": [
                "The instruments used are sufficiently strong",
                "The econometric model suffers from severe multicollinearity",
                "The sample size is too small for statistical power",
                "The null hypothesis of zero effect was rejected"
            ],
            "correct_option": "The instruments used are sufficiently strong",
            "inference_key": "Econometric instrument diagnostic"
        }
    ]

    ECONOMICS_BANK: List[Dict[str, Any]] = [
        {
            "id": "econ_01",
            "term": "Elasticity of Demand",
            "part_of_speech": "noun phrase",
            "definition_prompt": "Which concept measures the percentage change in quantity demanded in response to a percentage change in price?",
            "options": [
                "Price Elasticity of Demand",
                "Marginal Rate of Technical Substitution",
                "Gini Coefficient",
                "Comparative Advantage"
            ],
            "correct_option": "Price Elasticity of Demand",
            "subfield": "micro",
            "example_usage": "When price elasticity is greater than one, demand is deemed elastic."
        },
        {
            "id": "econ_02",
            "term": "Yield Curve Inversion",
            "part_of_speech": "noun phrase",
            "definition_prompt": "What phenomenon occurs when short-term sovereign bond yields exceed long-term yields, traditionally signaling a recession?",
            "options": [
                "Yield Curve Inversion",
                "Quantitative Easing Expansion",
                "Liquidity Trap",
                "Stagflation Spiral"
            ],
            "correct_option": "Yield Curve Inversion",
            "subfield": "macro",
            "example_usage": "An inverted yield curve has preceded nearly every major modern economic downturn."
        },
        {
            "id": "econ_03",
            "term": "Endogeneity",
            "part_of_speech": "noun",
            "definition_prompt": r"What econometric issue arises when an explanatory variable is correlated with the error term ($\text{Cov}(X, \epsilon) \neq 0$)?",
            "options": [
                "Endogeneity",
                "Homoskedasticity",
                "Stationarity",
                "Serial Autocorrelation"
            ],
            "correct_option": "Endogeneity",
            "subfield": "econometrics",
            "example_usage": "Omitted variable bias and reverse causality are the leading causes of endogeneity."
        },
        {
            "id": "econ_04",
            "term": "Moral Hazard",
            "part_of_speech": "noun phrase",
            "definition_prompt": "What asymmetric information condition occurs when one party takes greater risks because another party bears the costs?",
            "options": [
                "Moral Hazard",
                "Adverse Selection",
                "Deadweight Loss",
                "Pareto Optimality"
            ],
            "correct_option": "Moral Hazard",
            "subfield": "micro",
            "example_usage": "Government bailouts can induce moral hazard among large financial institutions."
        }
    ]

    SPOKEN_PROMPT: Dict[str, Any] = {
        "prompt_id": "spoken_diag_01",
        "scenario_title": "Inflation & Central Bank Rate Decision",
        "instructions_en": "You have 60 seconds. Describe how a central bank should respond when core inflation rises while GDP growth slows down. Use academic/economic vocabulary.",
        "instructions_es": "Tienes 60 segundos. Explica en inglés cómo debe responder un banco central cuando la inflación subyacente aumenta pero el PIB se desacelera.",
        "target_keywords": ["inflation", "interest rate", "monetary policy", "trade-off", "central bank", "growth"],
        "expected_duration_seconds": 60
    }

    def start_exam(self) -> DiagnosticExamStartResponse:
        """Returns all questions prepared for the adaptive test."""
        return DiagnosticExamStartResponse(
            session_id="diag_session_frontier_01",
            cloze_questions=[ClozeQuestion(**q) for q in self.CLOZE_BANK],
            listening_questions=[ListeningQuestion(**q) for q in self.LISTENING_BANK],
            economics_questions=[EconomicsLexiconQuestion(**q) for q in self.ECONOMICS_BANK],
            spoken_prompt=SpokenPrompt(**self.SPOKEN_PROMPT)
        )

    def evaluate_spoken_response(self, transcript: str, duration_sec: float = 45.0) -> SpokenEvaluationMetrics:
        """
        Evaluate speech for lexical diversity (TTR), grammatical complexity, and L1 errors.
        """
        if not transcript or len(transcript.strip()) < 5:
            # Fallback if transcript is minimal
            return SpokenEvaluationMetrics(
                lexical_diversity_ttr=0.50,
                cefr_vocabulary_level="A2",
                grammatical_complexity_score=50.0,
                wpm_speaking_rate=90.0,
                contrastive_errors_detected=["Sin audio suficiente para evaluación detallada."],
                phonetic_clarity_score=60.0,
                feedback_es="Por favor asegúrate de hablar claramente durante al menos 30 segundos para calibrar tu fluidez."
            )

        words = re.findall(r'\b[a-zA-Z]+\b', transcript.lower())
        total_words = len(words)
        unique_words = len(set(words))
        ttr = (unique_words / total_words) if total_words > 0 else 0.0
        wpm = (total_words / max(duration_sec, 1.0)) * 60.0

        # Check grammatical complexity (subordinate conjunctions & conditionals)
        complexity_markers = ["although", "because", "since", "whereas", "if", "unless", "furthermore", "however", "consequently", "indicates"]
        complexity_hits = sum(1 for m in complexity_markers if m in transcript.lower())
        complexity_score = min(100.0, 40.0 + complexity_hits * 12.0)

        # Contrastive Spanish L1 error detection in transcript
        contrastive_errors = []
        if re.search(r'\bdepend of\b', transcript.lower()):
            contrastive_errors.append("Uso de 'depend of' (debe ser 'depend on').")
        if re.search(r'\bis important\b', transcript.lower()) and not re.search(r'\bit is important\b', transcript.lower()):
            contrastive_errors.append("Omisión de sujeto: 'is important' en lugar de 'it is important'.")
        if re.search(r'\bpolitics\b', transcript.lower()) and ("fiscal" in transcript.lower() or "monetary" in transcript.lower()):
            contrastive_errors.append("Falso amigo: usa 'policy' para política pública monetaria o fiscal, no 'politics'.")

        # CEFR level estimation for spoken component
        if ttr >= 0.70 and complexity_score >= 80 and wpm >= 110:
            cefr_spoken = "C1"
        elif ttr >= 0.60 and complexity_score >= 65 and wpm >= 95:
            cefr_spoken = "B2"
        elif ttr >= 0.50 and complexity_score >= 50:
            cefr_spoken = "B1"
        elif ttr >= 0.40:
            cefr_spoken = "A2"
        else:
            cefr_spoken = "A1"

        clarity_score = min(95.0, max(50.0, 70.0 + (ttr * 20.0) - (len(contrastive_errors) * 10.0)))

        feedback = (
            f"Tu diversidad léxica es del {round(ttr * 100)}% con una velocidad estimada de {round(wpm)} palabras por minuto. "
            f"Nivel oral calibrado en {cefr_spoken}."
        )

        return SpokenEvaluationMetrics(
            lexical_diversity_ttr=round(ttr, 2),
            cefr_vocabulary_level=cefr_spoken,
            grammatical_complexity_score=round(complexity_score, 1),
            wpm_speaking_rate=round(wpm, 1),
            contrastive_errors_detected=contrastive_errors,
            phonetic_clarity_score=round(clarity_score, 1),
            feedback_es=feedback
        )

    def generate_study_plan(self, overall_cefr: str, target_days: int = 60) -> List[DayPlanItem]:
        """Generate structured daily progression roadmap."""
        plan: List[DayPlanItem] = []
        
        milestones = [
            ("Fundamentos Fonéticos & Preposiciones de Régimen", "grammar_contrast", 20, ["Node A1.1", "Node A1.2"]),
            ("Eliminación de la Vocal Protética /s/ y Pares Mínimos /iː/ vs /ɪ/", "voice_drills", 25, ["Node A2.1", "Phonetics Lab 1"]),
            ("Estructura de Oraciones Complejas y Falsos Amigos Económicos", "grammar_contrast", 25, ["Node B1.1", "Lexicon Arena"]),
            ("Laboratorio de Series de Tiempo y Descripción Oral de Gráficos", "economics_pitch", 30, ["Chart Pitch 1: CPI Inflation", "Chart Pitch 2: Unemployment"]),
            ("Econometrics Storytelling: Expresiones OLS, TWFE e Instrumentos", "economics_pitch", 30, ["Econometrics Lab 1", "Regression Interpretation"]),
            ("Simulador FOMC: Debate de Política Monetaria y Subida de Tipos", "voice_drills", 35, ["Central Banking Arena", "FOMC Roleplay"]),
            ("Academic Writing Copilot: Redacción de Abstracts y Policy Memos", "grammar_contrast", 30, ["Writing Lab 1", "Peer Review Simulation"]),
            ("Boss Fight: Presentación Cuantitativa Integral y Defensa", "economics_pitch", 40, ["Final Capstone Defense", "C1 Mastery Node"])
        ]

        step_interval = max(1, target_days // len(milestones))
        current_day = 1

        for i, (topic, skill, mins, nodes) in enumerate(milestones):
            plan.append(DayPlanItem(
                day=min(current_day, target_days),
                focus_topic=topic,
                target_skill=skill,
                minutes_recommended=mins,
                suggested_nodes=nodes
            ))
            current_day += step_interval

        return plan

    def evaluate_submission(self, submission: DiagnosticSubmission) -> DiagnosticResultOut:
        """
        Calculates scores for all dimensions, computes CEFR grade, and builds radar breakdown.
        """
        # 1. Evaluate Cloze Grammar
        cloze_correct = 0
        cloze_map = {q["id"]: q for q in self.CLOZE_BANK}
        contrastive_weaknesses = []

        for q_id, ans in submission.cloze_answers.items():
            if q_id in cloze_map:
                item = cloze_map[q_id]
                if ans.strip() == item["correct_option"].strip():
                    cloze_correct += 1
                else:
                    contrastive_weaknesses.append({
                        "question": item["sentence_with_blank"],
                        "category": item["category"],
                        "your_answer": ans,
                        "correct_answer": item["correct_option"],
                        "explanation_es": item["contrastive_tip_es"]
                    })

        grammar_score = (cloze_correct / max(len(self.CLOZE_BANK), 1)) * 100.0

        # 2. Evaluate Listening
        listen_correct = 0
        listen_map = {q["id"]: q for q in self.LISTENING_BANK}
        for q_id, ans in submission.listening_answers.items():
            if q_id in listen_map and ans.strip() == listen_map[q_id]["correct_option"].strip():
                listen_correct += 1
        listening_score = (listen_correct / max(len(self.LISTENING_BANK), 1)) * 100.0

        # 3. Evaluate Economics Lexicon
        econ_correct = 0
        econ_map = {q["id"]: q for q in self.ECONOMICS_BANK}
        for q_id, ans in submission.economics_answers.items():
            if q_id in econ_map and ans.strip() == econ_map[q_id]["correct_option"].strip():
                econ_correct += 1
        econ_score = (econ_correct / max(len(self.ECONOMICS_BANK), 1)) * 100.0

        # 4. Spoken Assessment
        transcript = submission.spoken_audio_transcript or ""
        spoken_eval = self.evaluate_spoken_response(transcript, submission.spoken_audio_duration or 45.0)
        speaking_score = (spoken_eval.lexical_diversity_ttr * 50.0) + (spoken_eval.grammatical_complexity_score * 0.5)

        # Composite score
        composite = (grammar_score * 0.30) + (listening_score * 0.25) + (speaking_score * 0.25) + (econ_score * 0.20)

        # Map to overall CEFR
        if composite >= 85:
            overall_cefr = "C1"
        elif composite >= 70:
            overall_cefr = "B2"
        elif composite >= 55:
            overall_cefr = "B1"
        elif composite >= 35:
            overall_cefr = "A2"
        else:
            overall_cefr = "A1"

        radar_metrics = {
            "Grammar & Syntax": round(grammar_score, 1),
            "Listening Speed": round(listening_score, 1),
            "Speaking Fluency": round(speaking_score, 1),
            "Economics Lexicon": round(econ_score, 1),
            "Phonetic Clarity": round(spoken_eval.phonetic_clarity_score, 1),
            "Grammar Complexity": round(spoken_eval.grammatical_complexity_score, 1)
        }

        study_plan = self.generate_study_plan(overall_cefr, submission.target_study_days)

        return DiagnosticResultOut(
            overall_cefr=overall_cefr,
            grammar_score=round(grammar_score, 1),
            listening_score=round(listening_score, 1),
            speaking_score=round(speaking_score, 1),
            economics_vocab_score=round(econ_score, 1),
            radar_metrics=radar_metrics,
            spoken_evaluation=spoken_eval,
            contrastive_weaknesses=contrastive_weaknesses,
            study_plan_days=submission.target_study_days,
            study_roadmap=study_plan
        )

placement_engine = AdaptivePlacementEngine()
