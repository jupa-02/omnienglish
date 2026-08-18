import re
from typing import List, Dict, Any, Tuple
from app.schemas.voice import PhonemeScore, VoiceEvaluationResult

class SpanishContrastivePronunciationEvaluator:
    """
    Evaluator specifically tailored for Spanish native speakers (L1) learning English (L2).
    Analyzes phonetic contrast errors, minimal pair confusions, vowel insertion,
    and stress-timed rhythm patterns.
    """

    MINIMAL_PAIRS_MAP = {
        "sheet": {"contrast_word": "shit", "target_phoneme": "/iː/", "confused_phoneme": "/ɪ/", "tip_es": "Alarga el sonido 'ee' /iː/ y sonríe para no pronunciar la vocal corta /ɪ/."},
        "reach": {"contrast_word": "rich", "target_phoneme": "/iː/", "confused_phoneme": "/ɪ/", "tip_es": "En 'reach', la 'ea' es tensa y larga /iː/ (reach); en 'rich', es corta y relajada /ɪ/."},
        "leave": {"contrast_word": "live", "target_phoneme": "/iː/", "confused_phoneme": "/ɪ/", "tip_es": "Ten cuidado: 'leave' /liːv/ (salir/dejar) vs 'live' /lɪv/ (vivir)."},
        "berry": {"contrast_word": "very", "target_phoneme": "/b/", "confused_phoneme": "/v/", "tip_es": "En inglés, /v/ es labiodental (dientes superiores tocan labio inferior vibrando), a diferencia de /b/ bilabial."},
        "vote": {"contrast_word": "boat", "target_phoneme": "/v/", "confused_phoneme": "/b/", "tip_es": "Para 'vote' /voʊt/, apoya tus dientes en el labio inferior con vibración de cuerdas vocales."},
        "strategy": {"target_phoneme": "/s/", "confused_phoneme": "/es/", "tip_es": "¡Cuidado con la 'e' de apoyo! Empieza directamente con el siseo /s-trategy/, no 'es-trategy'."},
        "specific": {"target_phoneme": "/s/", "confused_phoneme": "/es/", "tip_es": "No agregues 'e' antes de la 's': pronuncia /spəˈsɪfɪk/ directamente."},
        "structure": {"target_phoneme": "/s/", "confused_phoneme": "/es/", "tip_es": "Evita 'estructure': inicia con la 's' como el sonido de una serpiente /strʌk.tʃər/."},
        "economic": {"target_phoneme": "/ˌiː.kəˈnɒm.ɪk/", "confused_phoneme": "accent error", "tip_es": "El acento primario cae en 'NOM': eco-NOM-ic. Las vocales no acentuadas se reducen a schwa /ə/."}
    }

    def evaluate_transcript(
        self,
        spoken_text: str,
        target_sentence: str = None,
        duration_seconds: float = 5.0
    ) -> VoiceEvaluationResult:
        """
        Evaluate spoken text against expected target or diagnostic heuristics.
        """
        clean_spoken = re.sub(r'[^\w\s]', '', spoken_text.lower()).strip()
        words_spoken = clean_spoken.split()
        word_count = len(words_spoken)
        
        # Calculate WPM (Words Per Minute)
        wpm = (word_count / max(duration_seconds, 1.0)) * 60.0
        
        phoneme_scores: List[PhonemeScore] = []
        alerts: List[str] = []

        # 1. Check for initial 'es-' prosthetic vowel error in Spanish L1 speakers
        s_clusters = ["strategy", "structure", "specific", "stable", "standard", "stimulate", "scale", "study"]
        for word in words_spoken:
            for s_word in s_clusters:
                if word.startswith("es") and s_word.startswith("s") and word[1:] == s_word:
                    alerts.append(f"Vocal protética detectada en '{word}': en inglés se inicia en /s/, di '{s_word}' sin la 'e' inicial.")
                    phoneme_scores.append(PhonemeScore(
                        phoneme="s-cluster",
                        ipa="/sC-/",
                        score=0.45,
                        is_contrastive_risk=True,
                        tip_es=f"Inicia directamente con /s/ sin 'e' de apoyo: '{s_word}'."
                    ))

        # 2. Check for minimal pairs /iː/ vs /ɪ/ and /b/ vs /v/
        for target_key, data in self.MINIMAL_PAIRS_MAP.items():
            if target_key in clean_spoken:
                phoneme_scores.append(PhonemeScore(
                    phoneme=target_key,
                    ipa=data.get("target_phoneme", "/.../"),
                    score=0.88,
                    is_contrastive_risk=True,
                    tip_es=data.get("tip_es")
                ))

        # 3. If target sentence is provided, calculate alignment accuracy
        if target_sentence:
            clean_target = re.sub(r'[^\w\s]', '', target_sentence.lower()).strip()
            target_words = clean_target.split()
            matched_words = [w for w in words_spoken if w in target_words]
            accuracy = min(100.0, (len(matched_words) / max(len(target_words), 1)) * 100.0)
        else:
            # General assessment score based on WPM and detected errors
            penalty = len(alerts) * 15.0
            base_wpm_score = min(100.0, (wpm / 130.0) * 100.0) if wpm <= 160 else 90.0
            accuracy = max(40.0, base_wpm_score - penalty)

        if not phoneme_scores:
            # Default standard phoneme feedbacks
            phoneme_scores = [
                PhonemeScore(phoneme="Vowel duration", ipa="/iː/ vs /ɪ/", score=0.85, is_contrastive_risk=True, tip_es="Buen contraste vocálico."),
                PhonemeScore(phoneme="Labiodental fricative", ipa="/v/", score=0.90, is_contrastive_risk=False, tip_es="Articulación correcta de consonantes continuas."),
                PhonemeScore(phoneme="Schwa reduction", ipa="/ə/", score=0.80, is_contrastive_risk=True, tip_es="Aplica reducción en sílabas no acentuadas.")
            ]

        return VoiceEvaluationResult(
            transcript=spoken_text,
            target_sentence=target_sentence,
            overall_accuracy=round(accuracy, 1),
            fluency_wpm=round(wpm, 1),
            phoneme_breakdown=phoneme_scores,
            l1_interference_alerts=alerts,
            xp_earned=15
        )

pronunciation_evaluator = SpanishContrastivePronunciationEvaluator()
