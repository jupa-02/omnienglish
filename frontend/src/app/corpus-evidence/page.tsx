'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  BookOpen,
  Mic,
  Award,
  CheckCircle,
  FileCode,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
} from 'lucide-react';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { PageWrapper } from '@/components/layout/PageWrapper';

const CORPUS_SOURCES = [
  {
    id: 'efcamdat',
    name: 'EFCAMDAT & UniversalCEFR',
    badge: '1M+ Essays • A1 to C2',
    category: 'CEFR Calibration & Multilingual SLA',
    url: 'https://github.com/amichw/EFCAMDAT',
    description:
      'The EF-Cambridge Open Language Database with over 1 million real student essays from 174,000 learners categorized from A1 to C2, paired with UniversalCEFR linguistic annotations.',
    keyMetrics: ['1,000,000+ essays', '174,000 learners', 'Official CEFR A1-C2 level tagging'],
  },
  {
    id: 'bea2019',
    name: 'BEA-2019 & ERRANT (W&I+LOCNESS)',
    badge: 'NLP Gold Standard',
    category: 'Grammatical Error Correction (GEC)',
    url: 'https://huggingface.co/UniversalCEFR',
    description:
      'Gold-standard NLP benchmark for Grammatical Error Correction with the ERRANT taxonomy classifying Spanish L1 errors (M:PRON, R:PREP, R:VERB:SVA, U:DET).',
    keyMetrics: ['ERRANT Error Taxonomy', 'Spanish L1 Pro-Drop Rules', 'Prepositional Regime Fixes'],
  },
  {
    id: 'l2arctic',
    name: 'L2-ARCTIC Non-Native Speech Corpus',
    badge: 'Phonetic Acoustic Matrix',
    category: 'Non-Native Spanish L1 Phonetics',
    url: 'https://huggingface.co/datasets/KoelLabs/L2Arctic',
    description:
      'Phonetically aligned audio recordings of Spanish L1 speakers diagnosing vowel length (/iː/ vs /ɪ/), betacism (/v/ vs /b/), and liquid s-epenthesis (#sC).',
    keyMetrics: ['IPA Phoneme Alignments', 'Acoustic Minimal Pairs', 'Spanish L1 Specific Interferences'],
  },
  {
    id: 'egp',
    name: 'English Grammar Profile (EGP & EVP)',
    badge: 'Cambridge 1,239 Descriptors',
    category: 'Can-Do Grammar Descriptors',
    url: 'https://github.com/ninja33/EGP',
    description:
      '1,239 empirical Cambridge grammar descriptors and 10,000 vocabulary items systematically mapped from A1 to C1.',
    keyMetrics: ['1,239 EGP Rules', '10,000+ EVP Lemmas', 'CEFR Granular Progression'],
  },
  {
    id: 'esp_macro',
    name: 'NBER, IMF & Central Banking Corpus',
    badge: 'Applied Quantitative ESP',
    category: 'Econometrics & Macroeconomic Discourse',
    url: 'https://www.nber.org/',
    description:
      'Research abstracts, IMF working papers, and FOMC policy minutes establishing peer-reviewed academic collocations, time-series vocabulary, and academic hedging.',
    keyMetrics: ['Quantitative Collocations', '2SLS / TWFE Specifications', 'Academic Hedging Norms'],
  },
];

const ERRANT_RULES_SAMPLE = [
  {
    tag: 'M:PRON',
    name: 'Subject Pronoun Omission (Pro-Drop)',
    error: 'Is necessary to analyze the inflation data every month.',
    correction: 'It is necessary to analyze the inflation data every month.',
    cause: 'En español el sujeto es tácito ("Es necesario"), pero en inglés el pronombre "it" es sintácticamente obligatorio.',
    level: 'A1–A2',
  },
  {
    tag: 'R:PREP',
    name: 'Prepositional Regime Substitution',
    error: 'The asset valuation depends of monetary policy decisions.',
    correction: 'The asset valuation depends on monetary policy decisions.',
    cause: 'En español se rige "depender de", pero en inglés el régimen obligatorio es "depend ON".',
    level: 'A2–B1',
  },
  {
    tag: 'U:DET',
    name: 'Unnecessary Definite Article with Macro Concepts',
    error: 'The inflation is the primary concern for central bankers.',
    correction: 'Inflation is the primary concern for central bankers.',
    cause: 'Los conceptos macroeconómicos abstractos e incontables no llevan artículo en inglés al referirse al fenómeno general.',
    level: 'B1–B2',
  },
  {
    tag: 'R:MORPH',
    name: 'False Friend / False Cognate',
    error: 'The Ministry should implement a sensible fiscal politics.',
    correction: 'The Ministry should implement a sensible fiscal policy.',
    cause: '"Policy" significa política pública; "politics" es la actividad política electoral.',
    level: 'B2–C1',
  },
];

function CorpusEvidenceContent() {
  const [activeTab, setActiveTab] = useState<'corpora' | 'errant' | 'phonetics' | 'finetune'>('corpora');
  const { playClick } = useAudioEffects();

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <header className="border-b border-gray-200 pb-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Database className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              SLA Scientific Corpus & Dataset Evidence
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Official datasets validating CEFR calibration, ERRANT error detection, and L2-ARCTIC phonetics.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'corpora', label: 'Corpora (5)', icon: Layers },
            { id: 'errant', label: 'ERRANT Taxonomy', icon: ShieldCheck },
            { id: 'phonetics', label: 'Phonetics Matrix', icon: Mic },
            { id: 'finetune', label: 'Ollama Fine-Tuning', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  playClick();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* TAB 1: VALIDATED CORPORA OVERVIEW */}
      {activeTab === 'corpora' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CORPUS_SOURCES.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {c.category}
                    </span>
                    <span className="text-xs font-mono text-emerald-600 font-medium">{c.badge}</span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900">{c.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.description}</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5 border-t border-gray-100 pt-3">
                    {c.keyMetrics.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      <span>View Open Source Dataset</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 2: BEA-2019 ERRANT TAXONOMY */}
      {activeTab === 'errant' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
            <div>
              <span className="text-xs font-mono uppercase text-indigo-600 font-semibold">
                BEA-2019 / W&I+LOCNESS Error Correction Standard
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-1">
                L1 Spanish Interference & ERRANT Rule Tagging
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Every grammar correction and feedback card is grounded in the standard ERRANT grammatical taxonomy.
              </p>
            </div>

            <div className="space-y-4">
              {ERRANT_RULES_SAMPLE.map((rule) => (
                <div
                  key={rule.tag}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 font-mono text-xs font-bold">
                        {rule.tag}
                      </span>
                      <h4 className="text-sm font-semibold text-gray-900">{rule.name}</h4>
                    </div>
                    <span className="text-xs font-mono text-gray-400">CEFR {rule.level}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                      <span className="text-rose-600 font-mono block mb-1">❌ Incorrect (L1 Interference):</span>
                      <span className="text-gray-700">{rule.error}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-600 font-mono block mb-1">✅ Standard Target (CEFR):</span>
                      <span className="text-gray-700">{rule.correction}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 italic bg-amber-50 p-3 rounded-lg border border-amber-100">
                    💡 <strong>Causa en español:</strong> {rule.cause}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: L2-ARCTIC PHONETICS */}
      {activeTab === 'phonetics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
            <div>
              <span className="text-xs font-mono uppercase text-teal-600 font-semibold">
                L2-ARCTIC Non-Native Speech Corpus
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-1">
                Spanish L1 Acoustic & Phonemic Interference Matrix
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Phonetically calibrated minimal pairs and articulatory instructions from empirical Spanish learner recordings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: '/ɪ/ (Lax) vs /iː/ (Tense)',
                  category: 'Vowel Duration',
                  text: 'En español solo existe una vocal "i" tensa. En inglés, /ɪ/ (\'fit\', \'bit\') requiere relajar la mandíbula sin sonreír.',
                  pair: 'leave /liːv/ vs live /lɪv/',
                },
                {
                  title: '#sC- Epenthesis (Liquid S)',
                  category: 'Syllable Attack',
                  text: 'Eliminación de la vocal protética \'e-\' antes de \'s\' líquida. Iniciar directamente con /s-/ sin vocal previa.',
                  pair: '/strætədʒi/ (NO: /estrategy/)',
                },
                {
                  title: '/v/ vs /b/ Betacism',
                  category: 'Labiodental Friction',
                  text: 'Diferenciación entre la oclusiva bilabial /b/ y la fricativa labiodental /v/ mordiendo el labio inferior.',
                  pair: 'vote /voʊt/ vs boat /boʊt/',
                },
                {
                  title: '/θ/ & /ð/ Dental Fricatives',
                  category: 'Interdental',
                  text: 'Articulación de \'th\' sorda /θ/ (\'theory\') y sonora /ð/ (\'therefore\') con la lengua entre los incisivos.',
                  pair: 'theory /ˈθɪəri/ vs *teory',
                },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-teal-700">{item.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">{item.category}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-700">
                    Minimal Pair: {item.pair}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: LOCAL OLLAMA FINE-TUNING HUB */}
      {activeTab === 'finetune' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
            <div>
              <span className="text-xs font-mono uppercase text-emerald-600 font-semibold">
                Local LLM Customization & Training Pipeline
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-1">
                Train Your Local Ollama Model
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Auto-generated Modelfile and instruction dataset ready for one-click local training.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-500" />
                  <span className="font-mono text-xs font-bold text-gray-900">
                    1. Generated Ollama Modelfile
                  </span>
                </div>
                <pre className="bg-gray-900 p-4 rounded-xl text-xs font-mono text-green-400 overflow-x-auto">
{`FROM gemma:2b

PARAMETER temperature 0.3
PARAMETER top_p 0.85
PARAMETER repeat_penalty 1.15

SYSTEM """
You are the OmniEnglish Frontier Language Architect, grounded in:
1. EFCAMDAT & UniversalCEFR calibrated proficiency benchmarks (A1-C2).
2. BEA-2019 / ERRANT grammatical error classification.
3. L2-ARCTIC phonetic rules for Spanish L1 speakers.
4. Cambridge English Grammar Profile (EGP) descriptors.
5. NBER, IMF & Central Banking academic discourse conventions.
"""`}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  <span className="font-mono text-xs font-bold text-gray-900">
                    2. Build Custom Local Model
                  </span>
                </div>
                <div className="bg-gray-900 p-4 rounded-xl text-xs font-mono text-green-400">
                  <code>ollama create omnienglish -f ./backend/Modelfile.omnienglish</code>
                </div>
                <p className="text-xs text-gray-500">
                  Once created, the model appears automatically in the AI Partner selector.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}

export default function CorpusEvidencePage() {
  return (
    <PageWrapper maxWidth="max-w-4xl">
      <CorpusEvidenceContent />
    </PageWrapper>
  );
}
