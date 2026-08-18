import asyncio
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.future import select
from app.core.config import settings
from app.core.database import Base, init_db
from app.models.curriculum import CurriculumUnit, LessonNode
from app.models.vocabulary import VocabularyItem

# High quality academic, economic, and SLA pedagogical datasets
CURRICULUM_SEED_DATA = [
    {
        "cefr_level": "A1",
        "unit_number": 1,
        "title": "Unit 1: Pronouns, Explicit Subjects & Essential Verbs",
        "description": "Laying foundational grammar without Spanish subject-omission errors.",
        "icon_name": "sparkles",
        "nodes": [
            {
                "title": "Subject Pronouns & 'It is' Rule",
                "node_type": "standard_drill",
                "order_index": 1,
                "xp_reward": 20,
                "track": "general",
                "content_payload": {
                    "summary": "In English, sentences must have an explicit subject pronoun, unlike Spanish where the subject is often implied.",
                    "grammar_focus": "Explicit Subject Pronouns",
                    "exercises": [
                        {
                            "id": "ex_a1_1",
                            "type": "multiple_choice",
                            "prompt_es": "¿Cómo se dice 'Es importante analizar los datos'?",
                            "prompt_en": "Choose the correct translation:",
                            "options": ["Is important to analyze the data", "It is important to analyze the data", "Important is analyze the data"],
                            "correct_answer": "It is important to analyze the data",
                            "contrastive_note_es": "En español 'es importante' no lleva sujeto visible, pero en inglés 'It' es obligatorio."
                        },
                        {
                            "id": "ex_a1_2",
                            "type": "sentence_builder",
                            "prompt_es": "Ordena las palabras: 'Es necesario estudiar.'",
                            "correct_answer": "It is necessary to study",
                            "tokens_to_arrange": ["study", "is", "It", "necessary", "to"],
                            "contrastive_note_es": "Siempre inicia con 'It is' para construcciones impersonales."
                        }
                    ]
                }
            },
            {
                "title": "Phonetics Lab: Initial /s/ without 'e'",
                "node_type": "voice_roleplay",
                "order_index": 2,
                "xp_reward": 25,
                "track": "general",
                "content_payload": {
                    "summary": "Mastering English s-clusters (strategy, scale, study) without adding an initial 'e' sound.",
                    "exercises": [
                        {
                            "id": "ex_a1_3",
                            "type": "voice_repetition",
                            "prompt_en": "The investment strategy is sound.",
                            "correct_answer": "The investment strategy is sound",
                            "contrastive_note_es": "Pronuncia /stræt.ə.dʒi/ sin decir 'estrategy'."
                        }
                    ]
                }
            }
        ]
    },
    {
        "cefr_level": "A2",
        "unit_number": 2,
        "title": "Unit 2: Prepositional Regimes & Business Routines",
        "description": "Mastering depend on, interested in, and daily economic indicators.",
        "icon_name": "trending-up",
        "nodes": [
            {
                "title": "Dependent Prepositions (Depend on / Interested in)",
                "node_type": "standard_drill",
                "order_index": 1,
                "xp_reward": 20,
                "track": "general",
                "content_payload": {
                    "summary": "Spanish speakers frequently make preposition mistakes by translating literally ('depend of' -> 'depend on').",
                    "exercises": [
                        {
                            "id": "ex_a2_1",
                            "type": "multiple_choice",
                            "prompt_en": "The revenue growth depends _______ consumer spending.",
                            "options": ["of", "on", "in", "from"],
                            "correct_answer": "on",
                            "contrastive_note_es": "En inglés siempre es 'depend ON'."
                        },
                        {
                            "id": "ex_a2_2",
                            "type": "multiple_choice",
                            "prompt_en": "Our analysts are interested _______ forecasting quarterly GDP.",
                            "options": ["for", "to", "in", "about"],
                            "correct_answer": "in",
                            "contrastive_note_es": "'Interested IN' + gerundio (-ing)."
                        }
                    ]
                }
            },
            {
                "title": "Chart Basics: Describing Upticks & Dips",
                "node_type": "chart_pitch",
                "order_index": 2,
                "xp_reward": 30,
                "track": "economics",
                "content_payload": {
                    "summary": "Basic vocabulary for trends: rose, dipped, increased by.",
                    "exercises": [
                        {
                            "id": "ex_a2_3",
                            "type": "chart_interpretation",
                            "prompt_en": "Describe the rise in sales from 100 to 120 units using 'increased by'.",
                            "options": ["Sales increased of 20%", "Sales increased by 20%", "Sales increased to 20%"],
                            "correct_answer": "Sales increased by 20%",
                            "contrastive_note_es": "Usa 'by' para indicar la magnitud del cambio (increased by 20%)."
                        }
                    ]
                }
            }
        ]
    },
    {
        "cefr_level": "B1",
        "unit_number": 3,
        "title": "Unit 3: Economic False Friends & Complex Conditionals",
        "description": "Eliminating false cognates (Policy vs Politics, Actually vs Currently) and hypothetical macroeconomic modeling.",
        "icon_name": "shield-check",
        "nodes": [
            {
                "title": "False Friends: Policy vs Politics & Sensible vs Sensitive",
                "node_type": "standard_drill",
                "order_index": 1,
                "xp_reward": 25,
                "track": "general",
                "content_payload": {
                    "summary": "Distinguishing deceptive English-Spanish cognates in professional contexts.",
                    "exercises": [
                        {
                            "id": "ex_b1_1",
                            "type": "multiple_choice",
                            "prompt_en": "The central bank introduced an accommodating monetary _______.",
                            "options": ["politics", "policy", "politic", "police"],
                            "correct_answer": "policy",
                            "contrastive_note_es": "'Policy' = Política pública institucional; 'Politics' = Política partidista/electoral."
                        },
                        {
                            "id": "ex_b1_2",
                            "type": "multiple_choice",
                            "prompt_en": "Bond prices are highly _______ to interest rate shocks.",
                            "options": ["sensible", "sensitive", "sensational", "sensorial"],
                            "correct_answer": "sensitive",
                            "contrastive_note_es": "'Sensitive' = Sensible / reactivo. 'Sensible' en inglés significa 'sensato/prudente'."
                        }
                    ]
                }
            },
            {
                "title": "Macroeconomic Shocks & Second Conditionals",
                "node_type": "standard_drill",
                "order_index": 2,
                "xp_reward": 25,
                "track": "economics",
                "content_payload": {
                    "summary": "Using hypothetical conditionals: 'If the Fed raised rates, borrowing costs would climb.'",
                    "exercises": [
                        {
                            "id": "ex_b1_3",
                            "type": "multiple_choice",
                            "prompt_en": "If the government _______ taxes, aggregate demand would contract.",
                            "options": ["increases", "increased", "had increased", "will increase"],
                            "correct_answer": "increased",
                            "contrastive_note_es": "Estructura del 2º condicional: If + Past Simple, would + infinitive."
                        }
                    ]
                }
            }
        ]
    },
    {
        "cefr_level": "B2",
        "unit_number": 4,
        "title": "Unit 4: Time-Series Pitching & Yield Curves",
        "description": "Dynamic verbs for financial graphs: skyrocketed, plummeted, hovered around, plateaued.",
        "icon_name": "activity",
        "nodes": [
            {
                "title": "Interactive Pitch Arena: US CPI Inflation Peak",
                "node_type": "chart_pitch",
                "order_index": 1,
                "xp_reward": 35,
                "track": "economics",
                "content_payload": {
                    "summary": "Deliver an oral pitch describing headline inflation surging to 9.1% and decelerating.",
                    "exercises": [
                        {
                            "id": "ex_b2_1",
                            "type": "multiple_choice",
                            "prompt_en": "Which dynamic phrase best describes inflation rising sharply to a multi-decade record?",
                            "options": ["Inflation skyrocketed to a 40-year peak", "Inflation made a jump big", "Inflation went top"],
                            "correct_answer": "Inflation skyrocketed to a 40-year peak",
                            "contrastive_note_es": "'Skyrocketed' es el verbo idiomático formal por excelencia para alzas vertiginosas."
                        }
                    ]
                }
            },
            {
                "title": "Yield Curve Inversion & Recession Signals",
                "node_type": "standard_drill",
                "order_index": 2,
                "xp_reward": 30,
                "track": "economics",
                "content_payload": {
                    "summary": "Analyzing the 10Y-2Y Treasury spread in inversion territory.",
                    "exercises": [
                        {
                            "id": "ex_b2_2",
                            "type": "multiple_choice",
                            "prompt_en": "When the yield curve _______, short-term yields exceed long-term yields.",
                            "options": ["inverts", "expands", "elevates", "prolongs"],
                            "correct_answer": "inverts",
                            "contrastive_note_es": "Uso de 'inverts' para curvas de rendimiento invertidas."
                        }
                    ]
                }
            }
        ]
    },
    {
        "cefr_level": "C1",
        "unit_number": 5,
        "title": "Unit 5: Econometric Storytelling & Central Bank Arena",
        "description": "Two-Way Fixed Effects, Instrumental Variables, Academic Hedging, and FOMC Rate Debates.",
        "icon_name": "award",
        "nodes": [
            {
                "title": "Econometrics Lab: OLS, TWFE & Endogeneity",
                "node_type": "standard_drill",
                "order_index": 1,
                "xp_reward": 40,
                "track": "economics",
                "content_payload": {
                    "summary": "Formal mathematical phrasing for empirical journal papers.",
                    "exercises": [
                        {
                            "id": "ex_c1_1",
                            "type": "multiple_choice",
                            "prompt_en": "To mitigate omitted variable bias and time-invariant heterogeneity, we estimate a model with _______.",
                            "options": ["two-way fixed effects", "double standard deviations", "bivariate static correlations"],
                            "correct_answer": "two-way fixed effects",
                            "contrastive_note_es": "TWFE (Two-Way Fixed Effects) es el estándar formal de identificación empírica."
                        },
                        {
                            "id": "ex_c1_2",
                            "type": "multiple_choice",
                            "prompt_en": "The estimated treatment effect is statistically significant _______ the 1% level.",
                            "options": ["at", "on", "in", "with"],
                            "correct_answer": "at",
                            "contrastive_note_es": "En estadística en inglés siempre decimos 'statistically significant AT the 1% / 5% level'."
                        }
                    ]
                }
            },
            {
                "title": "Boss Fight: FOMC Rate Hike Defense & Policy Memo",
                "node_type": "boss_challenge",
                "order_index": 2,
                "xp_reward": 50,
                "track": "economics",
                "content_payload": {
                    "summary": "Capstone Challenge: Defend a monetary policy rate decision against the Federal Reserve Chair AI.",
                    "exercises": [
                        {
                            "id": "ex_c1_3",
                            "type": "multiple_choice",
                            "prompt_en": "Which academic sentence exhibits the strongest adherence to scientific hedging?",
                            "options": [
                                "The empirical estimates suggest that liquidity injections alleviate credit constraints.",
                                "Our econometric regressions absolutely prove without any doubt that money supply causes inflation.",
                                "Anyone can see that the model is 100% right."
                            ],
                            "correct_answer": "The empirical estimates suggest that liquidity injections alleviate credit constraints.",
                            "contrastive_note_es": "En publicaciones Q1 se usa 'suggests / indicates' (academic hedging)."
                        }
                    ]
                }
            }
        ]
    }
]

VOCABULARY_SEED_DATA = [
    # General / Foundational
    {
        "lemma": "depend on",
        "part_of_speech": "phrasal verb",
        "cefr_level": "A2",
        "category": "general",
        "definition_en": "To be determined or conditioned by something else.",
        "definition_es": "Depender de algo o alguien (¡siempre con ON!).",
        "collocations": ["depend on the outcome", "depends heavily on data", "depend on market forces"],
        "example_sentence": "The economic forecast depends on global supply chain resilience."
    },
    {
        "lemma": "interested in",
        "part_of_speech": "adjective phrase",
        "cefr_level": "A2",
        "category": "general",
        "definition_en": "Having a desire to learn or know about something.",
        "definition_es": "Estar interesado en (siempre con IN + gerundio).",
        "collocations": ["interested in pursuing", "interested in analyzing"],
        "example_sentence": "Our quantitative fund is interested in hiring econometrics graduates."
    },
    {
        "lemma": "policy",
        "part_of_speech": "noun",
        "cefr_level": "B1",
        "category": "general",
        "definition_en": "A course or principle of action adopted by a government or organization.",
        "definition_es": "Política pública o institucional (no confundir con 'politics' = política electoral).",
        "collocations": ["monetary policy", "fiscal policy", "public policy"],
        "example_sentence": "The central bank signaled a shift toward tighter monetary policy."
    },
    {
        "lemma": "eventually",
        "part_of_speech": "adverb",
        "cefr_level": "B1",
        "category": "general",
        "definition_en": "In the end, especially after a long time or a lot of effort.",
        "definition_es": "Finalmente, a la larga (no 'actualmente').",
        "collocations": ["eventually recovered", "eventually stabilized"],
        "example_sentence": "Inflation eventually converged back to the 2% target."
    },
    # Economics / Econometrics / Finance
    {
        "lemma": "skyrocket",
        "part_of_speech": "verb",
        "cefr_level": "B2",
        "category": "macro",
        "definition_en": "To increase or rise very rapidly and to a high level.",
        "definition_es": "Dispararse, subir como la espuma.",
        "collocations": ["prices skyrocketed", "energy costs skyrocketed"],
        "example_sentence": "Commodity prices skyrocketed following geopolitical disruptions."
    },
    {
        "lemma": "plateau",
        "part_of_speech": "verb",
        "cefr_level": "B2",
        "category": "macro",
        "definition_en": "To reach a state of little or no change after a period of growth.",
        "definition_es": "Estancarse o estabilizarse en una meseta.",
        "collocations": ["growth plateaued", "inflation plateaued around 3%"],
        "example_sentence": "After two consecutive rate hikes, bond yields plateaued."
    },
    {
        "lemma": "endogeneity",
        "part_of_speech": "noun",
        "cefr_level": "C1",
        "category": "econometrics",
        "definition_en": "A correlation between an explanatory variable and the error term in a regression model.",
        "definition_es": "Endogeneidad (correlación entre variable explicativa y el error).",
        "collocations": ["address endogeneity concerns", "endogeneity bias", "sources of endogeneity"],
        "example_sentence": "We employ an instrumental variables strategy to address potential endogeneity."
    },
    {
        "lemma": "two-way fixed effects",
        "part_of_speech": "noun phrase",
        "cefr_level": "C1",
        "category": "econometrics",
        "definition_en": "An econometric specification incorporating both unit (individual/state) and time fixed effects.",
        "definition_es": "Efectos fijos bidireccionales (de entidad y de tiempo).",
        "collocations": ["estimate a two-way fixed effects model", "TWFE estimator"],
        "example_sentence": "The two-way fixed effects regression controls for unobserved spatial and temporal confounders."
    },
    {
        "lemma": "yield curve inversion",
        "part_of_speech": "noun phrase",
        "cefr_level": "C1",
        "category": "finance",
        "definition_en": "A market condition where short-term debt instruments have higher yields than long-term instruments of the same credit risk.",
        "definition_es": "Inversión de la curva de rendimientos (señal predictiva de recesión).",
        "collocations": ["deep yield curve inversion", "un-inverting yield curve"],
        "example_sentence": "The 10-year minus 2-year yield curve inversion reached its deepest level in four decades."
    },
    {
        "lemma": "moral hazard",
        "part_of_speech": "noun phrase",
        "cefr_level": "B2",
        "category": "micro",
        "definition_en": "Lack of incentive to guard against risk where one is protected from its consequences.",
        "definition_es": "Riesgo moral (asimetría de incentivos tras aseguramiento).",
        "collocations": ["induce moral hazard", "mitigate moral hazard"],
        "example_sentence": "Unconditional liquidity backstops may inadvertently generate moral hazard."
    }
]

async def seed_database(db: AsyncSession):
    """Seed initial curriculum units, lesson nodes, and vocabulary items."""
    print("🌱 Starting ETL Database Ingestion...")

    # 1. Seed Curriculum Units and Nodes
    for u_data in CURRICULUM_SEED_DATA:
        existing_u = await db.execute(
            select(CurriculumUnit).where(
                CurriculumUnit.cefr_level == u_data["cefr_level"],
                CurriculumUnit.unit_number == u_data["unit_number"]
            )
        )
        unit = existing_u.scalars().first()
        if not unit:
            unit = CurriculumUnit(
                id=str(uuid.uuid4()),
                cefr_level=u_data["cefr_level"],
                unit_number=u_data["unit_number"],
                title=u_data["title"],
                description=u_data["description"],
                icon_name=u_data["icon_name"]
            )
            db.add(unit)
            await db.flush()

            for n_data in u_data["nodes"]:
                node = LessonNode(
                    id=str(uuid.uuid4()),
                    unit_id=unit.id,
                    title=n_data["title"],
                    node_type=n_data["node_type"],
                    order_index=n_data["order_index"],
                    xp_reward=n_data["xp_reward"],
                    track=n_data["track"],
                    content_payload=n_data["content_payload"]
                )
                db.add(node)

    # 2. Seed Vocabulary Items
    for v_data in VOCABULARY_SEED_DATA:
        existing_v = await db.execute(
            select(VocabularyItem).where(VocabularyItem.lemma == v_data["lemma"])
        )
        if not existing_v.scalars().first():
            item = VocabularyItem(
                id=str(uuid.uuid4()),
                lemma=v_data["lemma"],
                part_of_speech=v_data["part_of_speech"],
                cefr_level=v_data["cefr_level"],
                category=v_data["category"],
                definition_en=v_data["definition_en"],
                definition_es=v_data["definition_es"],
                collocations=v_data["collocations"],
                example_sentence=v_data["example_sentence"]
            )
            db.add(item)

    await db.commit()
    print("✅ Ingestion Complete! Curriculum units, nodes, and vocabulary successfully seeded.")

async def main():
    await init_db()
    # Create session directly
    engine = create_async_engine(settings.get_database_url(), echo=False)
    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        await seed_database(session)
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
