'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Volume2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  Lightbulb,
  Tag
} from 'lucide-react';
import { useAudioEffects } from '@/hooks/useAudioEffects';

export interface ErrantDiagnostic {
  code: string;
  category: string;
  description: string;
}

export interface ParsedFeedback {
  errantDiagnostics: ErrantDiagnostic[];
  corrections: { original: string; corrected: string; reason: string }[];
  upgrades: { phrase: string; level: string; explanation: string }[];
  l1Tips: string[];
  overallSummary: string;
}

interface PedagogicalFeedbackCardProps {
  rawFeedback?: string | { analysis?: string; detected_errant_rules?: string[]; model_used?: string };
  lastUserMessage?: string;
  onApplyCorrection?: (text: string) => void;
}

const ERRANT_CODE_MAP: Record<string, string> = {
  'M:PRON': 'Missing Pronoun (Sujeto omitido)',
  'R:PREP': 'Preposition Regime (Régimen preposicional)',
  'U:DET': 'Unnecessary Article (Artículo redundante)',
  'R:VERB:SVA': 'Subject-Verb Agreement (Concordancia)',
  'R:MORPH': 'Morphology / False Friends (Falsos amigos)',
  'M:VERB': 'Missing Auxiliary Verb (Verbo auxiliar faltante)',
  'R:SPELL': 'Spelling Precision (Ortografía)',
  'R:WO': 'Word Order (Orden de palabras)'
};

/**
 * Robust linguistic parser that cleans all raw LLM markdown artifacts (**, ##, backticks, asterisks)
 * and structures the output into clean, beautifully styled educational SLA components.
 */
function parseLlmFeedback(
  raw: string | { analysis?: string; detected_errant_rules?: string[] } | undefined,
  userMessage?: string
): ParsedFeedback {
  const result: ParsedFeedback = {
    errantDiagnostics: [],
    corrections: [],
    upgrades: [],
    l1Tips: [],
    overallSummary: ''
  };

  if (!raw) return result;

  let text = typeof raw === 'string' ? raw : raw.analysis || '';
  const detectedRules = typeof raw === 'object' && raw.detected_errant_rules ? raw.detected_errant_rules : [];

  const addDiagnostic = (rawStr: string) => {
    // Clean backticks, asterisks, quotes
    let clean = rawStr.replace(/[`*"'#]/g, '').trim();
    
    // Find ERRANT code pattern e.g. M:PRON, R:PREP, U:DET
    const match = clean.match(/\b([MUR]:[A-Z]+(?::[A-Z]+)?)\b/i);
    let code = 'SLA:RULE';
    let category = 'Grammar Diagnosis';
    let desc = clean;

    if (match) {
      code = match[1].toUpperCase();
      category = ERRANT_CODE_MAP[code] || 'Linguistic Accuracy';
      // Remove code prefix from description
      desc = clean.replace(match[0], '').replace(/^[:\s-]+/, '').trim();
    }

    // Avoid duplicates
    if (!result.errantDiagnostics.some((d) => d.code === code && d.description === desc)) {
      result.errantDiagnostics.push({
        code,
        category,
        description: desc || clean
      });
    }
  };

  // Add deterministic detected rules
  for (const rule of detectedRules) {
    addDiagnostic(rule);
  }

  // Parse lines
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let currentSection: 'corrections' | 'upgrades' | 'l1' | 'general' = 'general';

  for (const line of lines) {
    const cleanLine = line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*•]\s*/, '').trim();
    const lower = cleanLine.toLowerCase();

    if (lower.includes('correction') || lower.includes('errant') || lower.includes('grammar') || lower.includes('corrección')) {
      currentSection = 'corrections';
      continue;
    } else if (lower.includes('upgrade') || lower.includes('vocabulary') || lower.includes('native') || lower.includes('vocabulario') || lower.includes('cefr')) {
      currentSection = 'upgrades';
      continue;
    } else if (lower.includes('spanish') || lower.includes('contrast') || lower.includes('interferencia') || lower.includes('l1') || lower.includes('español')) {
      currentSection = 'l1';
      continue;
    }

    const unstarred = cleanLine.replace(/[`*"'#]/g, '').trim();
    if (!unstarred) continue;

    if (currentSection === 'corrections') {
      if (unstarred.includes('->') || unstarred.includes('→') || unstarred.includes('➔')) {
        const parts = unstarred.split(/->|→|➔/);
        result.corrections.push({
          original: parts[0]?.replace(/[❌]/g, '').trim() || '',
          corrected: parts[1]?.replace(/[✅]/g, '').trim() || '',
          reason: 'Grammatical recast aligned with BEA-2019 standards.'
        });
      } else if (/^[MUR]:[A-Z]+/i.test(unstarred) || unstarred.includes('M:PRON') || unstarred.includes('R:PREP') || unstarred.includes('U:DET')) {
        addDiagnostic(unstarred);
      } else if (unstarred.length > 5) {
        addDiagnostic(unstarred);
      }
    } else if (currentSection === 'upgrades') {
      const upgradeClean = unstarred.replace(/^[0-9\.\-\*\s]+/, '');
      result.upgrades.push({
        phrase: upgradeClean,
        level: upgradeClean.toLowerCase().includes('c1') ? 'C1' : 'B2',
        explanation: 'Elevates discursive authority and executive cadence.'
      });
    } else if (currentSection === 'l1') {
      result.l1Tips.push(unstarred);
    } else {
      if (!result.overallSummary) {
        result.overallSummary = unstarred;
      }
    }
  }

  // Deterministic checks if user message is provided
  if (userMessage) {
    if (/\b(is|was|are|were)\s+(important|necessary|possible|clear|essential)\b/i.test(userMessage) && !/\bit\s+(is|was|are|were)\b/i.test(userMessage)) {
      if (!result.corrections.some((c) => c.original.includes('is important'))) {
        result.corrections.push({
          original: 'is important',
          corrected: 'it is important',
          reason: 'In English, dummy subject pronoun "it" is obligatory for impersonal predicates.'
        });
      }
      if (!result.errantDiagnostics.some((d) => d.code === 'M:PRON')) {
        result.errantDiagnostics.push({
          code: 'M:PRON',
          category: 'Missing Subject Pronoun',
          description: 'Omisión del pronombre sujeto "it" (*is important* → *it is important*).'
        });
      }
      if (result.l1Tips.length === 0) {
        result.l1Tips.push('En español el sujeto tácito es natural, pero en inglés toda oración requiere un sujeto explícito.');
      }
    }

    if (/\bdepends?\s+of\b/i.test(userMessage)) {
      if (!result.corrections.some((c) => c.original.includes('depends of'))) {
        result.corrections.push({
          original: 'depends of',
          corrected: 'depends on',
          reason: 'Fixed prepositional regime in English (depend + on).'
        });
      }
      if (!result.errantDiagnostics.some((d) => d.code === 'R:PREP')) {
        result.errantDiagnostics.push({
          code: 'R:PREP',
          category: 'Preposition Regime',
          description: 'Régimen preposicional incorrecto (*depends of* → *depends on*).'
        });
      }
      if (!result.l1Tips.some((t) => t.includes('depende de'))) {
        result.l1Tips.push('Régimen preposicional: en español decimos "depende de", en inglés siempre es "depends on".');
      }
    }
  }

  return result;
}

export const PedagogicalFeedbackCard: React.FC<PedagogicalFeedbackCardProps> = ({
  rawFeedback,
  lastUserMessage,
  onApplyCorrection
}) => {
  const { playClick, speakText } = useAudioEffects();
  const [activeTab, setActiveTab] = useState<'all' | 'grammar' | 'upgrades' | 'l1'>('all');
  const [isExpanded, setIsExpanded] = useState(true);

  const parsed = parseLlmFeedback(rawFeedback, lastUserMessage);
  const totalCorrectionsCount = parsed.corrections.length + parsed.errantDiagnostics.length;

  const hasContent =
    totalCorrectionsCount > 0 ||
    parsed.upgrades.length > 0 ||
    parsed.l1Tips.length > 0 ||
    parsed.overallSummary.length > 0;

  if (!hasContent) {
    return (
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-zinc-300">Awaiting Your Input</p>
          <p className="text-[11px] text-zinc-500 max-w-xs">
            Send a message or voice turn to receive real-time BEA-2019 grammar diagnosis, CEFR upgrades, and Spanish L1 transfer alerts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all">
      {/* Card Header */}
      <div className="p-4 bg-gradient-to-r from-zinc-900/90 to-zinc-950 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              SLA Pedagogical Feedback
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                BEA-2019 / EGP
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400">Real-time linguistic diagnosis &amp; Spanish L1 bridge</p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 text-xs">
          {/* Navigation Filter Pills */}
          <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
            {[
              { id: 'all', label: 'All Highlights' },
              { id: 'grammar', label: 'Corrections', count: totalCorrectionsCount },
              { id: 'upgrades', label: 'C1 Upgrades', count: parsed.upgrades.length },
              { id: 'l1', label: 'Spanish L1 Tips', count: parsed.l1Tips.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[9px] px-1 rounded-full ${
                      activeTab === tab.id ? 'bg-indigo-700 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 1. Surgical Corrections & Structured ERRANT Badges */}
          {(activeTab === 'all' || activeTab === 'grammar') && totalCorrectionsCount > 0 && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Grammar Diagnosis &amp; Recast</span>
              </span>

              {/* Side-by-side Recast Cards */}
              {parsed.corrections.map((c, i) => (
                <div
                  key={`corr_${i}`}
                  className="p-3 rounded-xl bg-gradient-to-br from-rose-950/20 via-zinc-900 to-zinc-950 border border-rose-500/30 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-rose-300 font-mono line-through text-[11px]">
                      ❌ {c.original}
                    </span>
                    <button
                      onClick={() => {
                        playClick();
                        speakText(c.corrected, 0.9);
                      }}
                      className="p-1 rounded bg-zinc-800 hover:bg-emerald-600/20 text-emerald-400 transition-colors"
                      title="Listen correct pronunciation"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-300 font-mono font-bold text-xs">
                    <span>✅</span>
                    <span>{c.corrected}</span>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-1.5">
                    {c.reason}
                  </p>
                </div>
              ))}

              {/* Structured Visual Diagnostic Badges */}
              {parsed.errantDiagnostics.map((diag, i) => (
                <div
                  key={`diag_${i}`}
                  className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-2 text-xs"
                >
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30 shrink-0 mt-0.5">
                    {diag.code}
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-zinc-200 font-semibold text-[11px] block">{diag.category}</span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">{diag.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. C1/C2 Lexical Upgrades */}
          {(activeTab === 'all' || activeTab === 'upgrades') && parsed.upgrades.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Lexical Upgrades</span>
              </span>

              {parsed.upgrades.map((u, i) => (
                <div key={i} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {u.level} Target
                    </span>
                    <button
                      onClick={() => {
                        playClick();
                        speakText(u.phrase, 0.9);
                      }}
                      className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                      title="Listen"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-emerald-300 font-mono">
                    "{u.phrase}"
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    💡 {u.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 3. Spanish L1 Cognitive Contrast */}
          {(activeTab === 'all' || activeTab === 'l1') && parsed.l1Tips.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Cognitive Transfer (Spanish L1 Alert)</span>
              </span>

              {parsed.l1Tips.map((tip, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed space-y-1"
                >
                  <p className="font-semibold text-amber-300 flex items-center gap-1">
                    <span>🧠</span>
                    <span>Patrón de Transferencia L1:</span>
                  </p>
                  <p className="text-zinc-300 text-[11px]">{tip}</p>
                </div>
              ))}
            </div>
          )}

          {/* 4. Overall Linguistic Summary if present */}
          {parsed.overallSummary && activeTab === 'all' && (
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
              <span className="font-bold text-zinc-300 block mb-1">Pedagogical Summary:</span>
              <p>{parsed.overallSummary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
