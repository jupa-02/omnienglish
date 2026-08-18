"""
Dataset & Modelfile Exporter for Ollama Fine-Tuning and Inference Grounding.
Formats real training pairs from EFCAMDAT, UniversalCEFR, BEA-2019 ERRANT,
L2-ARCTIC Phonetics, English Grammar Profile (EGP), and NBER/IMF ESP Corpora.
"""

import os
import json
from datetime import datetime
from app.etl.linguistic_datasets import (
    ERRANT_SPANISH_L1_TAXONOMY,
    L2_ARCTIC_SPANISH_RULES,
    EGP_CANONICAL_DESCRIPTORS,
    NBER_IMF_ESP_LEXICON
)

def generate_finetuning_dataset(output_path: str = "./dataset_omnienglish_finetune.jsonl"):
    """
    Generates an instruction-tuning JSONL dataset grounded in official SLA corpora.
    Format: {"instruction": ..., "input": ..., "output": ...}
    """
    training_examples = []

    # 1. Grammar & Contrastive Syntax (BEA-2019 / EFCAMDAT / ERRANT)
    for err in ERRANT_SPANISH_L1_TAXONOMY:
        example = {
            "source_corpus": "BEA-2019 (W&I+LOCNESS) & EFCAMDAT",
            "cefr_level": err.cefr_target,
            "errant_tag": err.tag,
            "instruction": f"Act as an expert SLA linguist and English coach for Spanish speakers. Correct the grammatical and syntactic error in the input sentence according to CEFR standards and provide an ERRANT-grounded pedagogical explanation in Spanish.",
            "input": err.example_error,
            "output": f"**Correction:** \"{err.example_correction}\"\n\n**ERRANT Error Classification:** `{err.tag}` ({err.category})\n\n**Explicación Pedagógica (L1 Español):**\n{err.spanish_l1_cause} {err.description_es}"
        }
        training_examples.append(example)

    # 2. Phonetics & Acoustic Contrast (L2-ARCTIC Speech Corpus)
    for pho in L2_ARCTIC_SPANISH_RULES:
        example = {
            "source_corpus": "L2-ARCTIC Non-Native Speech Corpus (Spanish L1 Sub-corpus)",
            "cefr_level": "A1-B2",
            "phoneme_target": pho.target_phoneme_ipa,
            "instruction": f"Evaluate the phonetic pronunciation of the Spanish L1 learner targeting the phoneme {pho.target_phoneme_ipa} in English. Provide minimal pairs and articulatory instructions.",
            "input": f"How do I pronounce words with {pho.acoustic_environment}, such as '{pho.minimal_pair['word_a']}' without Spanish interference?",
            "output": f"**Phonetic Target:** `{pho.target_phoneme_ipa}` vs Spanish `{pho.spanish_l1_substitution_ipa}`\n\n**Acoustic Articulation:**\n{pho.description}\n\n**Minimal Pairs:**\n{pho.minimal_pair['word_a']} vs {pho.minimal_pair['word_b']} ({pho.minimal_pair['context']})\n\n**Consejo Práctico de Articulación:**\n{pho.remediation_tip_es}"
        }
        training_examples.append(example)

    # 3. Canonical Grammar Structures (English Grammar Profile - EGP)
    for egp in EGP_CANONICAL_DESCRIPTORS:
        example = {
            "source_corpus": "Cambridge English Grammar Profile (EGP)",
            "cefr_level": egp.cefr_level,
            "descriptor_id": egp.descriptor_id,
            "instruction": f"Explain and demonstrate the CEFR {egp.cefr_level} grammar descriptor '{egp.rule_statement}' for Spanish-speaking learners.",
            "input": f"Can you explain how to use {egp.grammatical_category} ({egp.sub_category}) at {egp.cefr_level} level in academic and formal English?",
            "output": f"**CEFR Level:** {egp.cefr_level} ({egp.descriptor_id})\n**Grammar Rule:** {egp.rule_statement}\n\n**Example:** \"{egp.example_sentence}\"\n\n**Nota Contrastiva para Hispanohablantes:**\n{egp.contrastive_note_es}"
        }
        training_examples.append(example)

    # 4. Economics & Quantitative Storytelling (NBER / IMF Academic ESP Corpus)
    for esp in NBER_IMF_ESP_LEXICON:
        example = {
            "source_corpus": "NBER & IMF Academic Economics Corpus",
            "cefr_level": esp.cefr_level,
            "subfield": esp.subfield,
            "instruction": "Provide academic collocations, economic context, and appropriate academic hedging for peer-reviewed journal writing in economics.",
            "input": f"How should an economist write about '{esp.term}' in a research paper abstract or policy brief?",
            "output": f"**Economic Term:** {esp.term} (CEFR {esp.cefr_level} - {esp.subfield.upper()})\n\n**Standard Academic Collocations:**\n" + "\n".join([f"- *{c}*" for c in esp.academic_collocations]) + f"\n\n**Peer-Reviewed Context:**\n\"{esp.sample_context}\"\n\n**Epistemic Hedging Example:**\n\"{esp.hedging_alternative}\""
        }
        training_examples.append(example)

    # Write to JSONL
    with open(output_path, "w", encoding="utf-8") as f:
        for ex in training_examples:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")

    return len(training_examples), output_path


def generate_ollama_modelfile(modelfile_path: str = "./Modelfile.omnienglish", base_model: str = "gemma:2b"):
    """
    Generates an official Ollama Modelfile configured with linguistic SLA grounding.
    """
    modelfile_content = f"""# ==============================================================================
# OMNIENGLISH FRONTIER — LOCAL LLM MODELFILE (OLLAMA ENGINE)
# Calibrated against: EFCAMDAT, UniversalCEFR, BEA-2019 ERRANT, L2-ARCTIC & EGP
# ==============================================================================
FROM {base_model}

# Hyperparameters optimized for pedagogical accuracy & conversational flow
PARAMETER temperature 0.3
PARAMETER top_p 0.85
PARAMETER repeat_penalty 1.15
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"

# Official SLA Grounded System Prompt
SYSTEM \"\"\"
You are the OmniEnglish Frontier Language Architect, an AI Tutor and Quantitative Economics English Specialist grounded in:
1. EFCAMDAT & UniversalCEFR calibrated proficiency benchmarks (A1 to C2).
2. BEA-2019 / ERRANT grammatical error classification (R:PREP, M:PRON, R:VERB:SVA, U:DET).
3. L2-ARCTIC phonetic rules for Spanish L1 speakers (/ɪ/ vs /iː/, #sC epenthesis, /v/ vs /b/).
4. Cambridge English Grammar Profile (EGP) descriptors.
5. NBER, IMF & Central Banking quantitative academic discourse conventions.

PEDAGOGICAL BEHAVIORS:
- When conversing with learners, speak in natural, articulate English calibrated to their target CEFR level.
- Always provide constructive Spanish L1 contrastive feedback on errors.
- Never let missing subject pronouns (*"Is important"*), incorrect prepositional regimes (*"depends of"*), or unhedged overstatements (*"proves definitively"*) pass uncorrected.
- Encourage active voice in academic abstracts (*"We estimate..."*) and precise economic time-series verbs (*"surged, plummeted, plateaued"*).
\"\"\"
"""
    with open(modelfile_path, "w", encoding="utf-8") as f:
        f.write(modelfile_content)

    return modelfile_path


if __name__ == "__main__":
    count, jsonl_path = generate_finetuning_dataset()
    print(f"Generated {count} training pairs at: {jsonl_path}")
    modelfile = generate_ollama_modelfile()
    print(f"Generated Ollama Modelfile at: {modelfile}")
