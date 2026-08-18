import re
from typing import List, Dict, Any, Optional
from app.schemas.economics import (
    EconometricScenario,
    ChartPitchScenario,
    ChartDataPoint,
    ChartPitchEvaluationRequest,
    ChartPitchEvaluationResponse,
    FedDebateTurnRequest,
    FedDebateTurnResponse,
    AcademicWritingRequest,
    AcademicWritingFeedback,
)

class EconomicsESPEngine:
    """
    Core engine for English for Specific Purposes (ESP) specialized in Economics,
    Econometrics, Central Banking, and Financial Markets.
    """

    CHART_SCENARIOS: List[Dict[str, Any]] = [
        {
            "id": "cpi_inflation_shock",
            "title": "US CPI Inflation & Supply Chain Disruption (2021-2024)",
            "indicator_type": "inflation_cpi",
            "context_en": "Present the evolution of US headline CPI inflation as it peaked at 9.1% before decelerating toward the 2% target.",
            "context_es": "Presenta la evolución de la inflación IPC cuando alcanzó su pico en 9.1% antes de desacelerarse hacia la meta del 2%.",
            "data_points": [
                {"period": "2021-Q1", "value": 2.6, "secondary_value": 2.0, "annotation": "Initial uptick"},
                {"period": "2021-Q3", "value": 5.4, "secondary_value": 4.0, "annotation": "Supply bottlenecks"},
                {"period": "2022-Q2", "value": 9.1, "secondary_value": 5.9, "annotation": "All-time 40-year Peak"},
                {"period": "2022-Q4", "value": 7.1, "secondary_value": 5.7, "annotation": "Aggressive rate hikes"},
                {"period": "2023-Q2", "value": 4.0, "secondary_value": 4.8, "annotation": "Disinflation underway"},
                {"period": "2023-Q4", "value": 3.4, "secondary_value": 3.9, "annotation": "Plateauing above target"},
                {"period": "2024-Q2", "value": 2.9, "secondary_value": 3.2, "annotation": "Approaching target"}
            ],
            "key_movements": [
                "skyrocketed to a 40-year high of 9.1%",
                "tumbled sharply following unprecedented rate hikes",
                "plateaued around 3.4%",
                "decelerated steadily toward the central bank's target"
            ],
            "suggested_vocabulary": [
                {"word": "skyrocketed", "definition": "Rose extremely rapidly and steeply.", "collocations": "prices skyrocketed, inflation skyrocketed"},
                {"word": "tumbled", "definition": "Fell rapidly and suddenly.", "collocations": "yields tumbled, market tumbled"},
                {"word": "plateaued", "definition": "Reached a period of little or no change after a surge.", "collocations": "growth plateaued, rates plateaued"},
                {"word": "hovered around", "definition": "Remained near a specific numerical value.", "collocations": "hovered around 3%"}
            ],
            "target_pitch_seconds": 45
        },
        {
            "id": "yield_curve_inversion",
            "title": "US Treasury Yield Curve (10-Year vs 2-Year Spread)",
            "indicator_type": "yield_curve",
            "context_en": "Describe the inversion of the 10Y-2Y yield curve spread into negative territory and its historical recessionary signals.",
            "context_es": "Describe la inversión del diferencial entre los bonos del tesoro a 10 y 2 años en terreno negativo y sus implicaciones de recesión.",
            "data_points": [
                {"period": "2021", "value": 1.45, "secondary_value": 0.0, "annotation": "Steep normal curve"},
                {"period": "2022-Q1", "value": 0.35, "secondary_value": 0.0, "annotation": "Flattening curve"},
                {"period": "2022-Q3", "value": -0.45, "secondary_value": 0.0, "annotation": "Inversion begins"},
                {"period": "2023-Q1", "value": -1.05, "secondary_value": 0.0, "annotation": "Deepest inversion since 1981"},
                {"period": "2023-Q4", "value": -0.35, "secondary_value": 0.0, "annotation": "Disinversion phase"},
                {"period": "2024-Q2", "value": 0.10, "secondary_value": 0.0, "annotation": "Curve un-inverting"}
            ],
            "key_movements": [
                "flattened considerably",
                "inverted deeply into negative territory",
                "bottomed out at minus 105 basis points",
                "un-inverted as rate cuts were priced in"
            ],
            "suggested_vocabulary": [
                {"word": "inverted", "definition": "Turned upside down / short rates exceeding long rates.", "collocations": "inverted yield curve"},
                {"word": "basis points", "definition": "One hundredth of a percentage point (0.01%).", "collocations": "spread widened by 50 basis points"},
                {"word": "bottomed out", "definition": "Reached the lowest possible point before recovering.", "collocations": "spread bottomed out at -1.05%"}
            ],
            "target_pitch_seconds": 45
        }
    ]

    ECONOMETRIC_SCENARIOS: List[Dict[str, Any]] = [
        {
            "id": "twfe_wage_shock",
            "title": "Minimum Wage & Employment Dynamics (TWFE & DiD)",
            "model_type": "Two-Way Fixed Effects (TWFE)",
            "formula_latex": "Y_{it} = \\alpha_i + \\lambda_t + \\beta \\cdot \\text{Policy}_{it} + X_{it}'\\gamma + \\varepsilon_{it}",
            "regression_table": {
                "dependent_variable": "Log Employment (ln_emp)",
                "coefficients": [
                    {"variable": "Minimum Wage Policy (beta)", "estimate": 0.042, "std_error": 0.013, "t_stat": 3.23, "p_value": 0.001, "significance": "***"},
                    {"variable": "Log Regional GDP", "estimate": 0.285, "std_error": 0.071, "t_stat": 4.01, "p_value": 0.000, "significance": "***"},
                    {"variable": "State Fixed Effects", "estimate": "Yes", "std_error": "-", "t_stat": "-", "p_value": "-", "significance": "-"},
                    {"variable": "Year Fixed Effects", "estimate": "Yes", "std_error": "-", "t_stat": "-", "p_value": "-", "significance": "-"}
                ],
                "r_squared": 0.78,
                "n_observations": 12500
            },
            "target_interpretations": [
                "The estimated coefficient on Minimum Wage Policy is statistically significant at the 1% level (beta = 0.042, p < 0.001).",
                "We control for unobserved time-invariant heterogeneity across states by incorporating state fixed effects.",
                "Year fixed effects capture common macroeconomic shocks affecting all units simultaneously."
            ],
            "exercise_prompt": "Explain the regression results formally in English, specifying statistical significance, economic magnitude, and the rationale for including two-way fixed effects.",
            "contrastive_warning_es": "Evita decir 'The regression demonstrates with certitude'; en inglés académico usamos 'The regression indicates a statistically significant positive association at the 1% level'."
        }
    ]

    def get_chart_scenarios(self) -> List[ChartPitchScenario]:
        return [ChartPitchScenario(**sc) for sc in self.CHART_SCENARIOS]

    def get_econometric_scenarios(self) -> List[EconometricScenario]:
        return [EconometricScenario(**sc) for sc in self.ECONOMETRIC_SCENARIOS]

    def evaluate_chart_pitch(self, request: ChartPitchEvaluationRequest) -> ChartPitchEvaluationResponse:
        """
        Evaluate user's oral description of an economic time-series graph.
        """
        text = request.spoken_transcript.lower()
        scenario_match = next((s for s in self.CHART_SCENARIOS if s["id"] == request.scenario_id), self.CHART_SCENARIOS[0])

        used_phrases = []
        missed_phrases = []

        # Check key movements
        for km in scenario_match["key_movements"]:
            keywords = km.lower().split()
            matched = any(kw in text for kw in keywords if len(kw) > 4)
            if matched:
                used_phrases.append(km)
            else:
                missed_phrases.append(km)

        # Check vocabulary richness
        vocab_words = [v["word"].lower() for v in scenario_match["suggested_vocabulary"]]
        used_vocab_count = sum(1 for vw in vocab_words if vw in text)
        vocab_score = min(100.0, (used_vocab_count / max(len(vocab_words), 1)) * 100.0 + 30.0)

        # Contrastive fixes
        contrastive_fixes = []
        if "increase of" in text:
            contrastive_fixes.append({"original": "increase of 5%", "suggested": "an increase of 5% / increased by 5%", "rule": "Usa 'increased BY 5%' para el verbo o 'an increase OF 5%' para el sustantivo."})
        if "the inflation" in text:
            contrastive_fixes.append({"original": "the inflation", "suggested": "inflation", "rule": "En inglés los conceptos macroeconómicos abstractos no llevan artículo definido 'the' cuando se habla en general."})

        trend_score = min(100.0, (len(used_phrases) / max(len(scenario_match["key_movements"]), 1)) * 80.0 + 20.0)
        overall_score = round((vocab_score * 0.4) + (trend_score * 0.5) + 10.0, 1)

        model_script = (
            f"During the analyzed period, {scenario_match['title']} demonstrated significant volatility. "
            f"Initially, the indicator surged before it {scenario_match['key_movements'][0]}. "
            f"Subsequently, as macroeconomic tightening took effect, the metric {scenario_match['key_movements'][1]}, "
            f"eventually settling as it {scenario_match['key_movements'][2]}."
        )

        return ChartPitchEvaluationResponse(
            overall_score=min(98.0, overall_score),
            vocabulary_richness_score=round(vocab_score, 1),
            trend_accuracy_score=round(trend_score, 1),
            fluency_score=85.0,
            used_key_phrases=used_phrases,
            missed_key_phrases=missed_phrases,
            contrastive_grammar_fixes=contrastive_fixes,
            model_pitch_script=model_script,
            xp_earned=40
        )

    def process_fed_debate_turn(self, request: FedDebateTurnRequest) -> FedDebateTurnResponse:
        """
        Process a conversational debate turn with the Federal Reserve Chair AI simulator.
        """
        user_arg = request.user_argument.lower()

        # Contrastive checks
        contrastive = None
        if "depend of" in user_arg:
            contrastive = {"original": "depend of", "correction": "depend on", "note": "Recuerda: 'monetary policy depends on data', nunca 'depends of'."}
        elif "politics" in user_arg and "monetary" in user_arg:
            contrastive = {"original": "monetary politics", "correction": "monetary policy", "note": "Usa 'policy' para política económica/monetaria."}

        # Determine response nuance based on economic arguments
        if "raise" in user_arg or "hike" in user_arg or "hawkish" in user_arg:
            chair_response_en = (
                "I appreciate your hawkish assessment. While tightening monetary policy helps anchor long-term inflation expectations, "
                "we must remain acutely vigilant regarding potential credit tightening in the banking sector and softening labor market conditions. "
                "How would you calibrate the pace of quantitative tightening alongside the benchmark federal funds rate?"
            )
            chair_summary_es = "El Presidente del FOMC concuerda con tu postura restrictiva (hawkish), pero te cuestiona sobre los riesgos de contracción crediticia y el empleo."
            persuasiveness = 88.0
        elif "cut" in user_arg or "dovish" in user_arg or "ease" in user_arg:
            chair_response_en = (
                "Your dovish argument prioritizes full employment, which aligns with our dual mandate. However, cutting rates prematurely "
                "risks reigniting wage-price spirals and unmooring inflation expectations. What empirical evidence suggests inflation is sustainably returning to our 2% symmetric target?"
            )
            chair_summary_es = "El Presidente escucha tu postura expansiva (dovish), pero advierte sobre el peligro de un rebrote inflacionario prematuro."
            persuasiveness = 82.0
        else:
            chair_response_en = (
                "A balanced, data-dependent approach is prudent given current macroeconomic crosscurrents. "
                "We must assess incoming prints on core PCE, non-farm payrolls, and consumer sentiment before determining the terminal policy rate."
            )
            chair_summary_es = "El Presidente aprueba tu visión prudente y dependiente de los datos (data-dependent)."
            persuasiveness = 85.0

        return FedDebateTurnResponse(
            chair_response_en=chair_response_en,
            chair_response_es_summary=chair_summary_es,
            feedback_on_argument="Excelente utilización de terminología monetaria y fundamentación económica.",
            economic_persuasiveness_score=persuasiveness,
            contrastive_correction=contrastive,
            xp_earned=25
        )

    def review_academic_writing(self, request: AcademicWritingRequest) -> AcademicWritingFeedback:
        """
        Review and polish academic writing, research abstracts, and policy memos.
        """
        raw_text = request.text_to_review
        improved = raw_text

        issues = []

        # 1. Check for unhedged overstatements ("proves definitively" -> "suggests / indicates")
        if re.search(r'\bproves definitively\b', raw_text, re.I):
            improved = re.sub(r'\bproves definitively\b', 'suggests', improved, flags=re.I)
            issues.append({
                "original": "proves definitively",
                "suggested": "strongly indicates / suggests",
                "rule": "Academic Hedging",
                "explanation_es": "En investigación cuantitativa se prefieren verbos de matiz epistémico ('indicates', 'suggests') en lugar de afirmar pruebas absolutas."
            })

        # 2. Check for "the inflation" -> "inflation"
        if re.search(r'\bthe inflation\b', raw_text, re.I):
            improved = re.sub(r'\bthe inflation\b', 'inflation', improved, flags=re.I)
            issues.append({
                "original": "the inflation",
                "suggested": "inflation",
                "rule": "Zero Article with Uncountable Macro Concepts",
                "explanation_es": "Los sustantivos no contables abstractos como 'inflation' no llevan artículo determinado cuando se refieren al fenómeno en general."
            })

        # 3. Check for "In this paper is analyzed" -> "In this paper, we analyze / this paper analyzes"
        if re.search(r'\bin this paper is analyzed\b', raw_text, re.I):
            improved = re.sub(r'\bin this paper is analyzed\b', 'In this paper, we analyze', improved, flags=re.I)
            issues.append({
                "original": "In this paper is analyzed",
                "suggested": "In this paper, we analyze / This paper analyzes",
                "rule": "Active Voice in Academic Abstracts",
                "explanation_es": "En revistas académicas Q1 (AER, QJE, JFE) se prefiere la voz activa directa ('we analyze' o 'this paper analyzes') frente a construcciones pasivas impersonales con omisión de sujeto."
            })

        return AcademicWritingFeedback(
            improved_text=improved,
            tone_formality_score=92.0,
            academic_hedging_score=88.0,
            identified_issues=issues,
            xp_earned=30
        )

economics_engine = EconomicsESPEngine()
