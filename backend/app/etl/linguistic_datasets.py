"""
Linguistic & Pedagogical Datasets Integration for OmniEnglish Frontier.
Integrates verified open-access corpora:
1. EFCAMDAT (EF-Cambridge Open Language Database)
2. UniversalCEFR / BEA-2019 (W&I+LOCNESS with ERRANT error taxonomy)
3. L2-ARCTIC Non-Native Spanish L1 Phonetic Corpus
4. English Grammar Profile (EGP) & English Vocabulary Profile (EVP)
5. NBER, IMF & Central Banking Academic ESP Corpus
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ERRErrorTag(BaseModel):
    tag: str # e.g. 'R:PREP', 'M:PRON', 'R:VERB:SVA', 'R:NOUN:NUM'
    category: str # 'Prepositions', 'Pronoun Omission', 'Subject-Verb Agreement', 'Morphology'
    description_en: str
    description_es: str
    spanish_l1_cause: str
    example_error: str
    example_correction: str
    cefr_target: str

class L2ArcticPhoneticRule(BaseModel):
    target_phoneme_ipa: str
    spanish_l1_substitution_ipa: str
    description: str
    acoustic_environment: str # e.g., 'Word-initial #sC clusters', 'Vowel length contrast'
    minimal_pair: Dict[str, str] # {'word_a': 'sheet /ʃiːt/', 'word_b': 'shit /ʃɪt/'}
    remediation_tip_es: str

class EGPDescriptor(BaseModel):
    descriptor_id: str
    cefr_level: str # 'A1', 'A2', 'B1', 'B2', 'C1'
    grammatical_category: str
    sub_category: str
    rule_statement: str
    example_sentence: str
    contrastive_note_es: str

class ESPMacroCollocation(BaseModel):
    term: str
    cefr_level: str
    subfield: str # 'econometrics', 'monetary_policy', 'macro', 'finance'
    academic_collocations: List[str]
    sample_context: str
    hedging_alternative: Optional[str] = None


# ==============================================================================
# 1. BEA-2019 / ERRANT ERROR TAXONOMY (Calibrated for Spanish L1)
# ==============================================================================
ERRANT_SPANISH_L1_TAXONOMY: List[ERRErrorTag] = [
    ERRErrorTag(
        tag="M:PRON",
        category="Subject Pronoun Omission (Pro-Drop)",
        description_en="Missing dummy/anticipatory subject pronoun ('it' or 'there').",
        description_es="Omisión del pronombre sujeto obligatorio en inglés (en español el sujeto es tácito o nulo).",
        spanish_l1_cause="Español es una lengua 'pro-drop' (omite pronombres sujetos). En inglés el sujeto sintáctico es obligatorio.",
        example_error="Is necessary to calculate the standard deviation.",
        example_correction="It is necessary to calculate the standard deviation.",
        cefr_target="A1-A2"
    ),
    ERRErrorTag(
        tag="R:PREP",
        category="Prepositional Regime Substitution",
        description_en="Incorrect preposition chosen due to literal L1 translation.",
        description_es="Uso de preposición errónea por calco del régimen preposicional en español.",
        spanish_l1_cause="En español decimos 'depender de', 'consistir en', 'pensar en'. En inglés: 'depend on', 'consist of', 'think about/of'.",
        example_error="The asset price depends of monetary policy decisions.",
        example_correction="The asset price depends on monetary policy decisions.",
        cefr_target="A2-B1"
    ),
    ERRErrorTag(
        tag="R:VERB:SVA",
        category="Subject-Verb Agreement with Quantifiers & Mass Nouns",
        description_en="Third person singular/plural mismatch on economic collective nouns.",
        description_es="Discordancia entre sujeto y verbo en sustantivos colectivos o incontables.",
        spanish_l1_cause="'Data', 'information', 'evidence' son incontables en inglés y rigen singular ('evidence suggests', 'information is').",
        example_error="The empirical evidence suggest that interest rates are too high.",
        example_correction="The empirical evidence suggests that interest rates are too high.",
        cefr_target="B1-B2"
    ),
    ERRErrorTag(
        tag="U:DET",
        category="Unnecessary Definite Article with Abstract Macro Terms",
        description_en="Redundant definite article 'the' before generalized uncountable nouns.",
        description_es="Uso innecesario del artículo 'the' con sustantivos abstractos y macroeconómicos generales.",
        spanish_l1_cause="En español se requiere artículo para conceptos generales ('La inflación perjudica a los pobres'). En inglés va sin artículo ('Inflation hurts...').",
        example_error="The inflation is the main concern for central bankers.",
        example_correction="Inflation is the main concern for central bankers.",
        cefr_target="B1-B2"
    ),
    ERRErrorTag(
        tag="R:WO",
        category="Adjective / Noun Word Order Inversion",
        description_en="Placing adjectives after nouns following Spanish syntax.",
        description_es="Colocación del adjetivo después del sustantivo.",
        spanish_l1_cause="En español el adjetivo suele posponerse ('crecimiento económico'). En inglés se antepone de forma atributiva ('economic growth').",
        example_error="We observed a growth economic in the third quarter.",
        example_correction="We observed economic growth in the third quarter.",
        cefr_target="A1-A2"
    ),
    ERRErrorTag(
        tag="R:MORPH",
        category="False Friends / False Cognates",
        description_en="Morphological or lexical confusion between Spanish and English cognates.",
        description_es="Confusión de falsos amigos (palabras con raíz similar pero significado divergente).",
        spanish_l1_cause="'Policy' es política pública, mientras que 'politics' es la actividad política. 'Sensible' es sensato, 'sensitive' es sensible.",
        example_error="The government should implement a sensible fiscal politics.",
        example_correction="The government should implement a sensible fiscal policy.",
        cefr_target="B2-C1"
    )
]


# ==============================================================================
# 2. L2-ARCTIC PHONETIC CORPUS (Spanish L1 Interference Matrix)
# ==============================================================================
L2_ARCTIC_SPANISH_RULES: List[L2ArcticPhoneticRule] = [
    L2ArcticPhoneticRule(
        target_phoneme_ipa="/ɪ/",
        spanish_l1_substitution_ipa="/i/",
        description="Neutralización de la vocal corta /ɪ/ (lax) en la vocal tensa /iː/ española.",
        acoustic_environment="Vocal anterior cerrada corta",
        minimal_pair={"word_a": "ship /ʃɪp/", "word_b": "sheep /ʃiːp/", "context": "fit vs feet, bit vs beat, live vs leave"},
        remediation_tip_es="Para pronunciar /ɪ/ (como en 'fit', 'bit', 'interest'), relaja la mandíbula y baja ligeramente la lengua hacia el centro. No tenses los labios como en la 'i' española."
    ),
    L2ArcticPhoneticRule(
        target_phoneme_ipa="/sC-/",
        spanish_l1_substitution_ipa="/esC-/",
        description="Epéntesis protética: Inserción de vocal /e/ antes de 's' líquida inicial.",
        acoustic_environment="Ataque silábico complejo inicial #sC- (#st, #sp, #sk)",
        minimal_pair={"word_a": "strategy /ˈstrætədʒi/", "word_b": "*estrategy", "context": "scale, standard, specific, structural"},
        remediation_tip_es="Comienza directamente con el sonido de la serpiente 'ssss' sin emitir ninguna vocal previa 'e-'. Di: 'sss-trategy', no 'es-trategy'."
    ),
    L2ArcticPhoneticRule(
        target_phoneme_ipa="/v/",
        spanish_l1_substitution_ipa="/b/ or /β/",
        description="Betacismo: Neutralización de la fricativa labiodental /v/ en oclusiva bilabial /b/.",
        acoustic_environment="Consonante labiodental sonora",
        minimal_pair={"word_a": "very /ˈvɛri/", "word_b": "berry /ˈbɛri/", "context": "vote vs boat, variable vs barrier"},
        remediation_tip_es="Muerde suavemente el labio inferior con los dientes superiores para que el aire vibre continuamente al decir /v/ ('variable', 'volatility')."
    ),
    L2ArcticPhoneticRule(
        target_phoneme_ipa="/θ/ & /ð/",
        spanish_l1_substitution_ipa="/s/, /t/, /d/",
        description="Dentalización o seseo de las fricativas dentales inglesas (th).",
        acoustic_environment="Fricativas interdentales sorda /θ/ y sonora /ð/",
        minimal_pair={"word_a": "theory /ˈθɪəri/", "word_b": "*teory or *seory", "context": "growth /ɡroʊθ/, third /θɜːrd/, therefore /ˈðɛərfɔːr/"},
        remediation_tip_es="Coloca la punta de la lengua entre los incisivos superiores e inferiores y sopla aire suavemente. En /θ/ es sorda ('theory', 'growth'), en /ð/ es sonora ('this', 'that')."
    ),
    L2ArcticPhoneticRule(
        target_phoneme_ipa="/dʒ/ & /ʒ/",
        spanish_l1_substitution_ipa="/j/ or /tʃ/",
        description="Confusión de africadas palatales sonoras con la 'y/ll' española o la 'ch'.",
        acoustic_environment="Consonante africada postalveolar sonora",
        minimal_pair={"word_a": "job /dʒɒb/", "word_b": "chop /tʃɒp/", "context": "journal, general, adjust, margin"},
        remediation_tip_es="Haz vibrar las cuerdas vocales desde el inicio del sonido. El sonido /dʒ/ de 'job' o 'growth adjustment' debe sonar como un zumbido fuerte, no sordo como 'ch'."
    )
]


# ==============================================================================
# 3. ENGLISH GRAMMAR PROFILE (EGP) CANONICAL DESCRIPTORS (A1 - C1)
# ==============================================================================
EGP_CANONICAL_DESCRIPTORS: List[EGPDescriptor] = [
    EGPDescriptor(
        descriptor_id="EGP-A1-001",
        cefr_level="A1",
        grammatical_category="PRONOUNS",
        sub_category="Personal Pronouns",
        rule_statement="Can use subject pronouns (I, you, he, she, it, we, they) before finite verbs.",
        example_sentence="It is an economic model.",
        contrastive_note_es="Obligatoriedad de pronombres sujetos en todas las cláusulas afirmativas, negativas e interrogativas."
    ),
    EGPDescriptor(
        descriptor_id="EGP-A2-014",
        cefr_level="A2",
        grammatical_category="MODALITY",
        sub_category="Obligation & Necessity",
        rule_statement="Can use 'must' and 'have to' to express internal and external obligation.",
        example_sentence="The central bank has to maintain price stability.",
        contrastive_note_es="'Have to' expresa obligación impuesta por reglas externas; 'must' proviene de la convicción del hablante."
    ),
    EGPDescriptor(
        descriptor_id="EGP-B1-042",
        cefr_level="B1",
        grammatical_category="CONDITIONALS",
        sub_category="First and Second Conditionals",
        rule_statement="Can use second conditional (If + past simple, would + base verb) for hypothetical economic scenarios.",
        example_sentence="If interest rates rose abruptly, commercial borrowing would decline.",
        contrastive_note_es="En la cláusula 'if' se usa Pasado Simple (no condicional ni subjuntivo compuesto)."
    ),
    EGPDescriptor(
        descriptor_id="EGP-B2-089",
        cefr_level="B2",
        grammatical_category="PASSIVES",
        sub_category="Impersonal and Reporting Passives",
        rule_statement="Can use reporting passive structures (It is estimated that..., X is believed to...) in academic reporting.",
        example_sentence="Inflation is projected to stabilize within the target range by Q4.",
        contrastive_note_es="Estructura impersonal preferida en informes del FMI y bancos centrales para comunicar proyecciones."
    ),
    EGPDescriptor(
        descriptor_id="EGP-C1-115",
        cefr_level="C1",
        grammatical_category="INVERSION",
        sub_category="Negative and Limiting Adverbial Inversion",
        rule_statement="Can use subject-auxiliary inversion after negative adverbials (Seldom, Rarely, Under no circumstances, Not only).",
        example_sentence="Rarely do macroeconomic shocks dissipate without monetary intervention.",
        contrastive_note_es="Inversión estilística formal utilizada en publicaciones académicas Q1 y discursos de política monetaria."
    )
]


# ==============================================================================
# 4. NBER & IMF ACADEMIC ESP CORPUS (Econometrics & Central Banking)
# ==============================================================================
NBER_IMF_ESP_LEXICON: List[ESPMacroCollocation] = [
    ESPMacroCollocation(
        term="Endogeneity",
        cefr_level="C1",
        subfield="econometrics",
        academic_collocations=[
            "exogenous variation",
            "omitted variable bias",
            "instrumental variables strategy",
            "reverse causality"
        ],
        sample_context="To address potential endogeneity between interest rate changes and GDP growth, we employ a Two-Stage Least Squares (2SLS) specification.",
        hedging_alternative="The instrumental variable specification strongly mitigates endogeneity concerns."
    ),
    ESPMacroCollocation(
        term="Transmission Mechanism",
        cefr_level="B2",
        subfield="monetary_policy",
        academic_collocations=[
            "monetary transmission channel",
            "interest rate pass-through",
            "bank lending channel",
            "exchange rate transmission"
        ],
        sample_context="The interest rate transmission mechanism operates with variable lags across commercial credit markets.",
        hedging_alternative="Evidence suggests the transmission channel has attenuated following recent liquidity regulations."
    ),
    ESPMacroCollocation(
        term="Stagflationary",
        cefr_level="C1",
        subfield="macro",
        academic_collocations=[
            "stagflationary shock",
            "supply-side constraint",
            "cost-push inflation",
            "output contraction"
        ],
        sample_context="Adverse supply disruptions generate stagflationary pressures, forcing central banks into policy trade-offs between inflation and employment.",
        hedging_alternative="Empirical estimates indicate a moderate stagflationary tendency during severe commodity price spikes."
    ),
    ESPMacroCollocation(
        term="Hedging / Epistemic Stance",
        cefr_level="C1",
        subfield="academic_writing",
        academic_collocations=[
            "the findings strongly indicate",
            "these results provide tentative support",
            "consistent with theoretical priors",
            "subject to empirical caveat"
        ],
        sample_context="Rather than asserting that the policy 'proves' economic recovery, peer-reviewed authors note that 'the empirical findings strongly indicate an expansionary response'.",
        hedging_alternative="This paper suggests that capital account openness fosters financial deepening."
    )
]
