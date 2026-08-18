import re
import random
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.services.llm_service import llm_service
from app.services.pronunciation_eval import pronunciation_evaluator

# ==========================================
# 1. SPEAK METHOD: High-Frequency Drills
# ==========================================

class SpeakPatternDrill(BaseModel):
    pattern_id: str
    pattern_name: str
    target_rule: str
    cefr_level: str
    core_template: str
    variations: List[Dict[str, str]] # prompt_es, target_en, focus_word

SPEAK_DRILL_PATTERNS: List[Dict[str, Any]] = [
    {
        "pattern_id": "spk_gerund_prep",
        "pattern_name": "Preposition + Gerund Automation",
        "target_rule": "After any preposition (in, on, at, about, forward to), always use V-ing (never infinitive).",
        "cefr_level": "B1-B2",
        "core_template": "I am [adjective] in/about/to [verb-ing]...",
        "variations": [
            {"prompt_es": "Estoy interesado en expandir el negocio a Europa.", "target_en": "I am interested in expanding the business to Europe.", "focus_word": "expanding"},
            {"prompt_es": "Ella tiene miedo de perder su inversión en la bolsa.", "target_en": "She is afraid of losing her investment in the stock market.", "focus_word": "losing"},
            {"prompt_es": "Espero con ansias trabajar con tu equipo de investigación.", "target_en": "I am looking forward to working with your research team.", "focus_word": "working"},
            {"prompt_es": "Nosotros pensamos en reducir los costos operativos el próximo mes.", "target_en": "We are thinking about reducing operational costs next month.", "focus_word": "reducing"},
            {"prompt_es": "Él se disculpó por llegar tarde a la reunión de la junta.", "target_en": "He apologized for arriving late to the board meeting.", "focus_word": "arriving"},
            {"prompt_es": "Están cansados de esperar la aprobación del banco central.", "target_en": "They are tired of waiting for central bank approval.", "focus_word": "waiting"},
            {"prompt_es": "Insistimos en auditar los datos financieros trimestrales.", "target_en": "We insist on auditing the quarterly financial data.", "focus_word": "auditing"},
            {"prompt_es": "Ella es experta en pronosticar tendencias macroeconómicas.", "target_en": "She is skilled at forecasting macroeconomic trends.", "focus_word": "forecasting"}
        ]
    },
    {
        "pattern_id": "spk_third_conditional",
        "pattern_name": "Third Conditional Rapid Inversion",
        "target_rule": "Had I + V3, I would have + V3 (Subjunctive counter-factual fast trigger).",
        "cefr_level": "B2-C1",
        "core_template": "Had we [verb-ed], we would have [verb-ed]...",
        "variations": [
            {"prompt_es": "Si hubiéramos diversificado la cartera, habríamos minimizado el riesgo.", "target_en": "Had we diversified the portfolio, we would have minimized the risk.", "focus_word": "Had we diversified"},
            {"prompt_es": "Si hubieran bajado las tasas antes, la inflación habría aumentado.", "target_en": "Had they cut interest rates earlier, inflation would have surged.", "focus_word": "Had they cut"},
            {"prompt_es": "Si yo hubiera sabido sobre la fusión, habría comprado las acciones.", "target_en": "Had I known about the merger, I would have bought the shares.", "focus_word": "Had I known"},
            {"prompt_es": "Si la empresa hubiera innovado, no habría perdido cuota de mercado.", "target_en": "Had the firm innovated, it would not have lost market share.", "focus_word": "Had the firm innovated"},
            {"prompt_es": "Si hubieras revisado el modelo econométrico, habrías detectado el sesgo.", "target_en": "Had you checked the econometric model, you would have detected the bias.", "focus_word": "Had you checked"}
        ]
    },
    {
        "pattern_id": "spk_c1_inversion",
        "pattern_name": "Negative Inversions for Rhetorical Emphasis",
        "target_rule": "Under no circumstances / Not only [Aux + Subject + Verb].",
        "cefr_level": "C1",
        "core_template": "Under no circumstances should we [verb]...",
        "variations": [
            {"prompt_es": "Bajo ninguna circunstancia debemos subestimar la volatilidad del mercado.", "target_en": "Under no circumstances should we underestimate market volatility.", "focus_word": "should we underestimate"},
            {"prompt_es": "Rara vez hemos visto un crecimiento económico tan acelerado.", "target_en": "Seldom have we witnessed such accelerated economic growth.", "focus_word": "have we witnessed"},
            {"prompt_es": "No solo redujeron la deuda, sino que también aumentaron los ingresos.", "target_en": "Not only did they reduce debt, but they also increased revenue.", "focus_word": "did they reduce"},
            {"prompt_es": "En ningún momento el banco central garantizó un rescate financiero.", "target_en": "At no point did the central bank guarantee a bailout.", "focus_word": "did the central bank guarantee"}
        ]
    }
]

# ==========================================
# 2. PRAKTIKA: Affective & Accent Engine
# ==========================================

AVATAR_PERSONAS = {
    "emma": {
        "name": "Emma",
        "accent": "British RP (Oxford)",
        "role": "Academic Senior Fellow",
        "avatar_style": "female_academic",
        "personality": "Refined, supportive, articulates with crisp Received Pronunciation.",
        "voice_id": "shimmer",
        "speed": 0.95
    },
    "liam": {
        "name": "Liam",
        "accent": "General American (Silicon Valley)",
        "role": "Tech Founder & Venture Partner",
        "avatar_style": "male_executive",
        "personality": "Dynamic, encouraging, contemporary executive dialogue.",
        "voice_id": "echo",
        "speed": 1.0
    },
    "chloe": {
        "name": "Chloe",
        "accent": "Australian Native (Sydney)",
        "role": "Conversational Coach",
        "avatar_style": "female_coach",
        "personality": "Warm, highly expressive, focuses on lowering the affective filter.",
        "voice_id": "nova",
        "speed": 0.95
    },
    "arthur": {
        "name": "Arthur",
        "accent": "British Formal (Diplomatic)",
        "role": "Senior Policy Advisor",
        "avatar_style": "male_diplomat",
        "personality": "Measured, diplomatic, teaches formal discourse connectors.",
        "voice_id": "onyx",
        "speed": 0.9
    }
}

# ==========================================
# 3. LOORA: Executive Lexical Upgrade & Surgery
# ==========================================

class LooraUpgradeResult(BaseModel):
    original_text: str
    cefr_detected: str
    grammar_corrections: List[Dict[str, str]]
    c1_c2_upgrades: List[Dict[str, str]] # original_fragment, upgraded_fragment, nuance_explanation
    executive_radar: Dict[str, float] # lexical_density, cohesion, formality, precision
    suggested_follow_up: str

def perform_loora_upgrade(text: str) -> LooraUpgradeResult:
    """
    Surgical analysis: transforms basic A2/B1 spoken or written expressions
    into high-impact C1/C2 executive English with nuance explanations.
    """
    corrections = []
    upgrades = []
    
    # 1. Grammar & Syntax Check
    if re.search(r'\b(is|was)\s+(important|clear|obvious)\b', text, re.I) and not re.search(r'\bit\s+(is|was)\b', text, re.I):
        corrections.append({
            "error": "Missing dummy subject 'it'",
            "fix": "It is important / It was clear",
            "tag": "M:PRON",
            "explanation": "In English, verbs must have an explicit subject. Never start directly with 'Is important'."
        })
        
    if re.search(r'\bdepends?\s+of\b', text, re.I):
        corrections.append({
            "error": "Incorrect preposition 'depends of'",
            "fix": "depends on",
            "tag": "R:PREP",
            "explanation": "The verb 'depend' collocated with 'on', not 'of'."
        })

    if re.search(r'\bthe\s+inflation\b', text, re.I):
        corrections.append({
            "error": "Unnecessary definite article 'the inflation'",
            "fix": "inflation",
            "tag": "U:DET",
            "explanation": "General macroeconomic concepts do not take 'the' in English."
        })

    # 2. C1/C2 Executive Upgrades Dictionary
    lexical_enhancement_map = [
        {
            "match": r"\bi think\b",
            "upgrades": [
                ("From an analytical perspective / In our assessment", "Conveys rigorous empirical authority instead of casual subjectivity."),
                ("Empirical evidence indicates that", "Pivots the argument to empirical backing.")
            ]
        },
        {
            "match": r"\bvery (big|large)\b",
            "upgrades": [
                ("substantial / paramount / exponential", "Provides quantitative precision.")
            ]
        },
        {
            "match": r"\b(bad|poor) economy\b",
            "upgrades": [
                ("a contractionary macroeconomic climate with persistent headwinds", "Executive boardroom terminology.")
            ]
        },
        {
            "match": r"\bwe need to cut costs\b",
            "upgrades": [
                ("we must optimize operational expenditure to safeguard our margin profile", "Sophisticated corporate finance phrasing.")
            ]
        },
        {
            "match": r"\bmake sure\b",
            "upgrades": [
                ("ensure / safeguard / guarantee compliance", "More formal and definitive.")
            ]
        },
        {
            "match": r"\bgood result\b",
            "upgrades": [
                ("favorable outcome / robust performance / superior yield", "Academic and professional precision.")
            ]
        },
        {
            "match": r"\ba lot of\b",
            "upgrades": [
                ("a substantial volume of / an extensive array of", "Replaces colloquial quantifier with formal register.")
            ]
        },
        {
            "match": r"\blook at\b",
            "upgrades": [
                ("examine / scrutinize / evaluate the underlying metrics of", "Elevates analytical rigor.")
            ]
        },
        {
            "match": r"\bfix the problem\b",
            "upgrades": [
                ("rectify the structural bottleneck / remediate the underlying issue", "Formal institutional phrasing.")
            ]
        },
        {
            "match": r"\bgive more money\b",
            "upgrades": [
                ("allocate additional capital / increase liquidity provisioning", "Boardroom financial precision.")
            ]
        }
    ]

    for item in lexical_enhancement_map:
        if re.search(item["match"], text, re.I):
            for up, exp in item["upgrades"]:
                upgrades.append({
                    "original": re.search(item["match"], text, re.I).group(0),
                    "upgraded": up,
                    "nuance_explanation": exp
                })

    if not upgrades:
        upgrades.append({
            "original": text[:30] + "..." if len(text) > 30 else text,
            "upgraded": "Moreover, taking a strategic posture, " + text.lower(),
            "nuance_explanation": "Incorporate transitional discourse markers to elevate coherence and cadence."
        })

    words = text.split()
    word_count = len(words)
    unique_words = len(set(w.lower() for w in words))
    ttr = (unique_words / max(word_count, 1)) * 100

    cefr = "A2" if word_count < 8 else ("B1" if word_count < 18 else ("B2" if ttr > 75 else "B1+"))

    return LooraUpgradeResult(
        original_text=text,
        cefr_detected=cefr,
        grammar_corrections=corrections,
        c1_c2_upgrades=upgrades,
        executive_radar={
            "lexical_density": round(min(100.0, ttr * 1.1), 1),
            "cohesion": 85.0 if any(w in text.lower() for w in ["furthermore", "however", "therefore", "consequently", "whereas", "moreover"]) else 65.0,
            "formality": 90.0 if not any(w in text.lower() for w in ["gonna", "wanna", "stuff", "yeah", "kinda"]) else 55.0,
            "precision": round(min(98.0, 70.0 + len(upgrades) * 5), 1)
        },
        suggested_follow_up="How does this strategic perspective align with your quarterly capital allocation priorities?"
    )

# ==========================================
# 4. ELSA SPEAK: Articulatory Precision Lab
# ==========================================

ARTICULATORY_DATA = {
    "/iː/ vs /ɪ/": {
        "title": "Tense High Front /iː/ vs Lax Near-Close /ɪ/",
        "spanish_interference": "Spanish only has one /i/ sound (always short and tense). In English, confusing 'reach' and 'rich' or 'sheet' and 'ship' disrupts communication.",
        "tongue_position": "For /iː/: Tongue arches high and forward near hard palate, lips spread in a firm smile. For /ɪ/: Tongue drops slightly, jaw relaxes, vocal tract is lax.",
        "lip_shape": "Spanned Smile (/iː/) vs Relaxed Neutral (/ɪ/)",
        "vocal_cords": "Voiced (Vibrating)",
        "minimal_pairs": [
            {"word_a": "reach /riːtʃ/", "word_b": "rich /rɪtʃ/", "contrast": "Tense vs Lax vowel"},
            {"word_a": "sheet /ʃiːt/", "word_b": "ship /ʃɪp/", "contrast": "Long vowel vs Short vowel"},
            {"word_a": "leave /liːv/", "word_b": "live /lɪv/", "contrast": "Action vs State"},
            {"word_a": "beat /biːt/", "word_b": "bit /bɪt/", "contrast": "High front vs Centralized"},
            {"word_a": "sleep /sliːp/", "word_b": "slip /slɪp/", "contrast": "Duration and tongue height"}
        ]
    },
    "/v/ vs /b/": {
        "title": "Labiodental Fricative /v/ vs Bilabial Plosive /b/",
        "spanish_interference": "Spanish native speakers merge 'b' and 'v' into a single bilabial sound /b/ or /β/. In English, /v/ requires upper teeth touching lower lip with continuous air friction.",
        "tongue_position": "Tongue is resting or neutral; focus is purely on upper dental and lower labial contact.",
        "lip_shape": "Upper incisors gently rest on inner lower lip, creating audible continuous friction (/v/).",
        "vocal_cords": "Voiced Fricative (Continuous vibration)",
        "minimal_pairs": [
            {"word_a": "vote /voʊt/", "word_b": "boat /boʊt/", "contrast": "Labiodental vs Bilabial"},
            {"word_a": "very /ˈvɛri/", "word_b": "berry /ˈbɛri/", "contrast": "Continuous friction vs Explosive release"},
            {"word_a": "curve /kɜːrv/", "word_b": "curb /kɜːrb/", "contrast": "End fricative vs Stop"},
            {"word_a": "vest /vɛst/", "word_b": "best /bɛst/", "contrast": "Fricative onset vs Plosive onset"},
            {"word_a": "van /væn/", "word_b": "ban /bæn/", "contrast": "Lip-teeth friction vs Full bilabial closure"}
        ]
    },
    "/sC-/": {
        "title": "Prosthetic Vowel Suppression in Initial S-Clusters",
        "spanish_interference": "Spanish phonotactics forbids starting a word with /s/ + consonant (e.g. *escuela*, *estrategia*). Spanish speakers involuntarily insert an /e/ before 'strategy', 'specific', 'structure'.",
        "tongue_position": "Tongue tip placed directly behind upper alveolar ridge before vocal cord onset.",
        "lip_shape": "Neutral, unrounded, slight smile.",
        "vocal_cords": "Voiceless Sibilant Friction directly without preceding phonation.",
        "minimal_pairs": [
            {"word_a": "strategy /ˈstrætədʒi/", "word_b": "NOT 'es-trategy'", "contrast": "Pure sibilant onset"},
            {"word_a": "specific /spəˈsɪfɪk/", "word_b": "NOT 'es-pecific'", "contrast": "Direct alveolar hiss"},
            {"word_a": "structure /ˈstrʌktʃər/", "word_b": "NOT 'es-tructure'", "contrast": "Three-consonant cluster"},
            {"word_a": "student /ˈstuːdənt/", "word_b": "NOT 'es-tudent'", "contrast": "Direct /st/ onset"},
            {"word_a": "special /ˈspɛʃəl/", "word_b": "NOT 'es-pecial'", "contrast": "Instant bilabial release after hiss"}
        ]
    },
    "/θ/ vs /s/": {
        "title": "Voiceless Dental Fricative /θ/ vs Alveolar Fricative /s/",
        "spanish_interference": "Latin American Spanish speakers lack the /θ/ interdental phoneme and substitute /s/ ('sink' instead of 'think', 'sick' instead of 'thick').",
        "tongue_position": "Tongue tip protrudes gently between upper and lower incisors for /θ/, whereas for /s/ it stays behind upper teeth.",
        "lip_shape": "Neutral, relaxed aperture allowing laminar airflow over tongue blade.",
        "vocal_cords": "Voiceless Dental Friction",
        "minimal_pairs": [
            {"word_a": "think /θɪŋk/", "word_b": "sink /sɪŋk/", "contrast": "Interdental vs Alveolar"},
            {"word_a": "thick /θɪk/", "word_b": "sick /sɪk/", "contrast": "Between teeth vs Behind teeth"},
            {"word_a": "thought /θɔːt/", "word_b": "sought /sɔːt/", "contrast": "Tongue protrusion vs Retraction"},
            {"word_a": "theme /θiːm/", "word_b": "seam /siːm/", "contrast": "Friction point shift"},
            {"word_a": "math /mæθ/", "word_b": "mass /mæs/", "contrast": "Coda interdental friction"}
        ]
    },
    "/dʒ/ vs /j/": {
        "title": "Voiced Postalveolar Affricate /dʒ/ vs Palatal Approximant /j/",
        "spanish_interference": "Spanish 'y' and 'll' often merge into a soft glide /j/ or /ʝ/. In English, /dʒ/ requires a full stop closure at the alveolar ridge before releasing with friction (e.g. 'job' vs 'yob').",
        "tongue_position": "Tongue tip touches alveolar ridge firmly, then releases into postalveolar position.",
        "lip_shape": "Slightly flared/protruded lips.",
        "vocal_cords": "Voiced Affricate (Stop + Friction)",
        "minimal_pairs": [
            {"word_a": "job /dʒɑːb/", "word_b": "yob /jɑːb/", "contrast": "Affricate stop vs Smooth glide"},
            {"word_a": "juice /dʒuːs/", "word_b": "use /juːs/", "contrast": "Explosive onset vs Continuous vowel glide"},
            {"word_a": "major /ˈmeɪdʒər/", "word_b": "mayor /ˈmeɪər/", "contrast": "Medial affricate vs Glide"},
            {"word_a": "jet /dʒɛt/", "word_b": "yet /jɛt/", "contrast": "Firm alveolar contact"}
        ]
    },
    "/æ/ vs /ʌ/": {
        "title": "Near-Open Front /æ/ vs Open-Mid Back /ʌ/",
        "spanish_interference": "Spanish has a single central /a/. English distinguishes the wide open front /æ/ (cat, bad, plan) from the central relaxed /ʌ/ (cut, bud, shut).",
        "tongue_position": "For /æ/: Tongue is pushed low and forward, jaw opens wide. For /ʌ/: Tongue rests neutrally in mid-back position.",
        "lip_shape": "Wide vertical opening (/æ/) vs Relaxed unrounded (/ʌ/)",
        "vocal_cords": "Voiced Resonant Phonation",
        "minimal_pairs": [
            {"word_a": "cat /kæt/", "word_b": "cut /kʌt/", "contrast": "Wide jaw opening vs Neutral jaw"},
            {"word_a": "hat /hæt/", "word_b": "hut /hʌt/", "contrast": "Front low vs Central mid"},
            {"word_a": "bad /bæd/", "word_b": "bud /bʌd/", "contrast": "Tense front vowel vs Lax vowel"},
            {"word_a": "match /mætʃ/", "word_b": "much /mʌtʃ/", "contrast": "Acoustic F1/F2 frequency displacement"}
        ]
    },
    "/ʃ/ vs /tʃ/": {
        "title": "Voiceless Postalveolar Fricative /ʃ/ vs Affricate /tʃ/",
        "spanish_interference": "Spanish has the affricate /tʃ/ ('chico', 'mucho') but lacks the smooth fricative /ʃ/ ('sh'). Spanish speakers often pronounce 'share' as 'chair' or 'wash' as 'watch'.",
        "tongue_position": "For /ʃ/: Tongue blade approaches postalveolar ridge without touching. For /tʃ/: Tongue tip makes full stop contact before releasing.",
        "lip_shape": "Rounded and slightly flared lips.",
        "vocal_cords": "Voiceless Friction (/ʃ/) vs Voiceless Stop-Friction (/tʃ/)",
        "minimal_pairs": [
            {"word_a": "share /ʃɛər/", "word_b": "chair /tʃɛər/", "contrast": "Continuous friction vs Explosive stop"},
            {"word_a": "wash /wɑːʃ/", "word_b": "watch /wɑːtʃ/", "contrast": "Fricative coda vs Affricate coda"},
            {"word_a": "shoe /ʃuː/", "word_b": "chew /tʃuː/", "contrast": "Soft hiss vs Sharp click-release"},
            {"word_a": "sheep /ʃiːp/", "word_b": "cheap /tʃiːp/", "contrast": "Pure fricative vs Dental stop release"}
        ]
    },
    "Final Consonants /d, t, k, g/": {
        "title": "Aspiration and Word-Final Consonant Coda Retention",
        "spanish_interference": "Spanish words rarely end in stop consonants (/d, t, k, g, p, b/). Spanish speakers tend to drop final stops or add a faint vowel (e.g. pronouncing 'hand' as 'han', 'card' as 'car').",
        "tongue_position": "Tongue tip or back makes a firm, definitive acoustic closure at the end of the word.",
        "lip_shape": "Maintains consonant closure before releasing.",
        "vocal_cords": "Voiced or Voiceless depending on consonant coda.",
        "minimal_pairs": [
            {"word_a": "hand /hænd/", "word_b": "NOT 'han'", "contrast": "Retain final alveolar stop /d/"},
            {"word_a": "card /kɑːrd/", "word_b": "NOT 'car'", "contrast": "Final stop creates distinct lexical meaning"},
            {"word_a": "project /ˈprɑːdʒɛkt/", "word_b": "NOT 'proyec'", "contrast": "Two-consonant cluster /kt/ at coda"},
            {"word_a": "world /wɜːrld/", "word_b": "NOT 'werl'", "contrast": "Liquid /l/ + Stop /d/ cluster"}
        ]
    }
}

# ==========================================
# 5. TALKPAL: Task-Based Immersion & Roleplays
# ==========================================

ROLEPLAY_SCENARIOS = [
    {
        "id": "rp_vc_pitch",
        "title": "Series A Venture Capital Term Sheet Negotiation",
        "category": "Executive & Negotiation",
        "ai_character": "Victoria Sterling (General Partner at Frontier Capital)",
        "objective": "Defend your startup's $25M pre-money valuation and negotiate board composition without sounding defensive.",
        "initial_prompt": "Thank you for joining us today. We love your product metrics, but a $25M valuation in this macroeconomic environment feels aggressive. Why should we not price this round at $18M with 2 board seats?",
        "evaluation_criteria": ["Rhetorical Hedging", "Data-Backed Justification", "Executive Tone", "Diplomatic Disagreement"]
    },
    {
        "id": "rp_fed_debate",
        "title": "FOMC Monetary Policy Timed Debate",
        "category": "Debate Mode",
        "ai_character": "Dr. Marcus Vance (Hawkish Federal Reserve Governor)",
        "objective": "Argue against raising the Federal Funds rate by 50 bps given the fragility of commercial real estate and bank liquidity.",
        "initial_prompt": "Governor, core services inflation remains stubbornly above our 2% mandate. If we do not hike by 50 basis points today, inflation expectations will become unanchored. How can you justify a pause?",
        "evaluation_criteria": ["Economic Terminology (ESP)", "Logical Fallacy Avoidance", "Rebuttal Agility", "Cohesive Connectors"]
    },
    {
        "id": "rp_job_interview",
        "title": "Goldman Sachs / McKinsey Senior Quantitative Interview",
        "category": "Career & Interview",
        "ai_character": "Eleanor Vance (Head of Global Macro Strategy)",
        "objective": "Walk the committee through how you diagnose an endogeneity bias in a cross-sectional econometric asset pricing model.",
        "initial_prompt": "Welcome. Let's get straight to technicals: suppose you observe a significant positive correlation between ESG disclosure and stock alpha. How do you prove this isn't simply reverse causality or omitted variable bias?",
        "evaluation_criteria": ["Econometric Accuracy (2SLS, DiD)", "Structured STAR Method", "Conciseness", "Fluency"]
    }
]

PHOTO_SCENARIOS = [
    {
        "id": "photo_macro_dashboard",
        "title": "Central Bank Macroeconomic Yield Curve Inversion",
        "image_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
        "prompt_en": "You have 60 seconds. Describe the financial chart, explain the yield curve inversion trend between 2Y and 10Y Treasury notes, and articulate the macroeconomic recession probabilities.",
        "key_vocabulary": ["inverted yield curve", "Treasury spreads", "tightening cycle", "recessionary signal", "steepening"]
    },
    {
        "id": "photo_corporate_boardroom",
        "title": "High-Stakes Cross-Border Boardroom Strategy",
        "image_url": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
        "prompt_en": "Describe the scene: focus on the body language of the key executives, the spatial layout of the conference room, and hypothesize the conflict currently being negotiated.",
        "key_vocabulary": ["stakeholder alignment", "deliberating", "body language", "consensus", "impasse"]
    }
]
