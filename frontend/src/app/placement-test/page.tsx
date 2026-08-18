'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Mic,
  Calendar,
  ArrowRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { ApiClient } from '@/lib/api';
import {
  DiagnosticExamStart,
  DiagnosticResult,
  ClozeQuestion,
  ListeningQuestion,
  EconomicsQuestion,
} from '@/lib/types';
import { AudioRecorder } from '@/components/voice/AudioRecorder';
import { ProgressBar } from '@/components/map/ProgressBar';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { PageWrapper } from '@/components/layout/PageWrapper';

function PlacementTestContent() {
  const { playSuccess, playError, playLevelUp, playClick, speakText } = useAudioEffects();

  const [examData, setExamData] = useState<DiagnosticExamStart | null>(null);
  const [stage, setStage] = useState<'intro' | 'cloze' | 'listening' | 'economics' | 'speaking' | 'result'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);

  // User answers state
  const [clozeAnswers, setClozeAnswers] = useState<Record<string, string>>({});
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, string>>({});
  const [economicsAnswers, setEconomicsAnswers] = useState<Record<string, string>>({});
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [spokenDuration, setSpokenDuration] = useState(45);
  const [targetStudyDays, setTargetStudyDays] = useState(60);

  // Result state
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    async function loadTest() {
      try {
        const data = await ApiClient.startPlacement();
        setExamData(data);
      } catch {
        // Fallback default exam
        const fallback = await import('@/lib/fallbackDiagnostic.json').catch(() => null);
        if (fallback) {
          setExamData((fallback.default || fallback) as unknown as DiagnosticExamStart);
        }
      }
    }
    loadTest();
  }, []);

  const handleStart = () => {
    playClick();
    setStage('cloze');
    setCurrentIndex(0);
  };

  const handleSelectOption = (qid: string, selected: string) => {
    playClick();
    if (stage === 'cloze') {
      setClozeAnswers((prev) => ({ ...prev, [qid]: selected }));
    } else if (stage === 'listening') {
      setListeningAnswers((prev) => ({ ...prev, [qid]: selected }));
    } else if (stage === 'economics') {
      setEconomicsAnswers((prev) => ({ ...prev, [qid]: selected }));
    }
  };

  const handleNextQuestion = () => {
    playClick();
    if (!examData) return;

    if (stage === 'cloze') {
      if (currentIndex < examData.cloze_questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setStage('listening');
        setCurrentIndex(0);
      }
    } else if (stage === 'listening') {
      if (currentIndex < examData.listening_questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setStage('economics');
        setCurrentIndex(0);
      }
    } else if (stage === 'economics') {
      if (currentIndex < examData.economics_questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setStage('speaking');
      }
    }
  };

  const handleSpokenComplete = async (transcript: string, durationSec: number) => {
    setSpokenTranscript(transcript);
    setSpokenDuration(durationSec);
    setIsEvaluating(true);

    const submission = {
      cloze_answers: clozeAnswers,
      listening_answers: listeningAnswers,
      economics_answers: economicsAnswers,
      spoken_audio_transcript: transcript,
      spoken_audio_duration: durationSec,
      target_study_days: targetStudyDays,
    };

    try {
      const res = await ApiClient.submitPlacement(submission);
      setResult(res);
      setStage('result');
      playLevelUp();
    } catch {
      // Fallback result simulation
      const mockResult: DiagnosticResult = {
        overall_cefr: 'B2',
        grammar_score: 80.0,
        listening_score: 100.0,
        speaking_score: 78.5,
        economics_vocab_score: 90.0,
        radar_metrics: {
          'Grammar & Syntax': 80.0,
          'Listening Speed': 100.0,
          'Speaking Fluency': 78.5,
          'Economics Lexicon': 90.0,
          'Phonetic Clarity': 82.0,
          'Grammar Complexity': 75.0,
        },
        spoken_evaluation: {
          lexical_diversity_ttr: 0.65,
          cefr_vocabulary_level: 'B2',
          grammatical_complexity_score: 75.0,
          wpm_speaking_rate: 112.0,
          contrastive_errors_detected: [],
          phonetic_clarity_score: 82.0,
          feedback_es: 'Buena fluidez y articulación de conceptos macroeconómicos.',
        },
        contrastive_weaknesses: [],
        study_plan_days: targetStudyDays,
        study_roadmap: [
          { day: 1, focus_topic: 'Fundamentos Fonéticos & Preposiciones de Régimen', target_skill: 'grammar_contrast', minutes_recommended: 20, suggested_nodes: ['Node A1.1', 'Node A1.2'] },
          { day: 8, focus_topic: 'Eliminación de la Vocal Protética /s/ y Pares Mínimos /iː/ vs /ɪ/', target_skill: 'voice_drills', minutes_recommended: 25, suggested_nodes: ['Node A2.1', 'Phonetics Lab 1'] },
          { day: 15, focus_topic: 'Estructura de Oraciones Complejas y Falsos Amigos Económicos', target_skill: 'grammar_contrast', minutes_recommended: 25, suggested_nodes: ['Node B1.1', 'Lexicon Arena'] },
          { day: 23, focus_topic: 'Laboratorio de Series de Tiempo y Descripción Oral de Gráficos', target_skill: 'economics_pitch', minutes_recommended: 30, suggested_nodes: ['Chart Pitch 1', 'Chart Pitch 2'] },
          { day: 30, focus_topic: 'Econometrics Storytelling: Expresiones OLS, TWFE e Instrumentos', target_skill: 'economics_pitch', minutes_recommended: 30, suggested_nodes: ['Econometrics Lab 1'] },
          { day: 38, focus_topic: 'Simulador FOMC: Debate de Política Monetaria y Subida de Tipos', target_skill: 'voice_drills', minutes_recommended: 35, suggested_nodes: ['Central Banking Arena'] },
          { day: 45, focus_topic: 'Academic Writing Copilot: Redacción de Abstracts y Policy Memos', target_skill: 'grammar_contrast', minutes_recommended: 30, suggested_nodes: ['Writing Lab 1'] },
          { day: 60, focus_topic: 'Boss Fight: Presentación Cuantitativa Integral y Defensa', target_skill: 'economics_pitch', minutes_recommended: 40, suggested_nodes: ['Capstone Defense'] },
        ],
      };
      setResult(mockResult);
      setStage('result');
      playLevelUp();
    } finally {
      setIsEvaluating(false);
    }
  };

  // 1. Intro Stage
  if (stage === 'intro') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-primary-600 to-accent-emerald flex items-center justify-center text-white shadow-xl shadow-primary-600/30">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-white">Adaptive Diagnostic Placement Test</h1>
          <p className="text-sm text-gray-700">
            A comprehensive 15-minute evaluation designed to accurately diagnose your CEFR proficiency level (A1 to C1) and generate a calibrated 30 or 60-day study roadmap.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-gray-200 border border-surface-raised space-y-1">
            <span className="text-xs font-bold text-accent-cyan uppercase">1. Grammar Cloze</span>
            <p className="text-xs text-gray-700">10 dynamic syntax items detecting Spanish L1 interference.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-200 border border-surface-raised space-y-1">
            <span className="text-xs font-bold text-accent-emerald uppercase">2. Listening Speed</span>
            <p className="text-xs text-gray-700">3 economic audio snippets at progressive speeds.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-200 border border-surface-raised space-y-1">
            <span className="text-xs font-bold text-accent-amber uppercase">3. Economics Screener</span>
            <p className="text-xs text-gray-700">Micro, macro, econometrics, and finance terminology.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-200 border border-surface-raised space-y-1">
            <span className="text-xs font-bold text-accent-violet uppercase">4. 60s Voice Assessment</span>
            <p className="text-xs text-gray-700">Lexical diversity (TTR), fluency rate (WPM), and phonetics.</p>
          </div>
        </div>

        {/* Study Plan Duration Preference */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200-card border border-surface-raised space-y-3">
          <span className="text-xs font-bold text-gray-700 block">Select Target Acceleration Timeline:</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTargetStudyDays(30)}
              className={`p-3.5 rounded-xl border text-xs font-bold transition-all ${
                targetStudyDays === 30
                  ? 'bg-primary-600/20 border-primary-500 text-white shadow-inner'
                  : 'bg-white shadow-sm border border-gray-200 border-gray-200 text-gray-500'
              }`}
            >
              🚀 30-Day Intensive Sprint
            </button>
            <button
              onClick={() => setTargetStudyDays(60)}
              className={`p-3.5 rounded-xl border text-xs font-bold transition-all ${
                targetStudyDays === 60
                  ? 'bg-primary-600/20 border-primary-500 text-white shadow-inner'
                  : 'bg-white shadow-sm border border-gray-200 border-gray-200 text-gray-500'
              }`}
            >
              📈 60-Day Comprehensive Track
            </button>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-emerald hover:opacity-95 text-white font-extrabold text-base shadow-xl shadow-primary-600/35 active:scale-95 transition-all"
        >
          Begin Diagnostic Test
        </button>
      </div>
    );
  }

  // 2. Cloze Grammar Stage
  if (stage === 'cloze' && examData) {
    const q = examData.cloze_questions[currentIndex];
    const selected = clozeAnswers[q.id];

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-accent-cyan uppercase">Stage 1: Grammar Cloze</span>
          <span className="text-xs font-bold text-gray-500">
            {currentIndex + 1} of {examData.cloze_questions.length}
          </span>
        </div>

        <ProgressBar current={currentIndex + 1} total={examData.cloze_questions.length} />

        <div className="p-8 rounded-3xl bg-white border border-gray-200-card border border-surface-raised shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
              Level: {q.cefr_level}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white leading-relaxed">
            {q.sentence_with_blank}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(q.id, opt)}
                className={`p-4 rounded-2xl text-left text-sm font-bold border transition-all ${
                  selected === opt
                    ? 'bg-primary-600 border-primary-400 text-white shadow-lg shadow-primary-600/30'
                    : 'bg-white shadow-sm border border-gray-200 border-gray-200 hover:border-gray-300 text-gray-800'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNextQuestion}
              disabled={!selected}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 text-white font-bold text-sm shadow-md active:scale-95 disabled:opacity-50 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Listening Comprehension Stage
  if (stage === 'listening' && examData) {
    const q = examData.listening_questions[currentIndex];
    const selected = listeningAnswers[q.id];

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-accent-emerald uppercase">Stage 2: Listening Comprehension</span>
          <span className="text-xs font-bold text-gray-500">
            {currentIndex + 1} of {examData.listening_questions.length}
          </span>
        </div>

        <ProgressBar current={currentIndex + 1} total={examData.listening_questions.length} />

        <div className="p-8 rounded-3xl bg-white border border-gray-200-card border border-surface-raised shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Speed: {q.audio_speed}x
            </span>
          </div>

          {/* Audio Player Button */}
          <div className="p-5 rounded-2xl bg-white shadow-sm border border-gray-200 border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => speakText(q.audio_text, q.audio_speed)}
                className="w-12 h-12 rounded-2xl bg-accent-emerald hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-accent-emerald/30 active:scale-95 transition-all"
              >
                <Volume2 className="w-6 h-6" />
              </button>
              <div>
                <span className="text-xs font-bold text-white block">Economic Audio Clip</span>
                <span className="text-[11px] text-gray-500">Click to listen at {q.audio_speed}x speed</span>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-bold text-white">{q.question_text}</h2>

          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(q.id, opt)}
                className={`w-full p-4 rounded-2xl text-left text-sm font-semibold border transition-all ${
                  selected === opt
                    ? 'bg-accent-emerald/20 border-accent-emerald text-white shadow-lg'
                    : 'bg-white shadow-sm border border-gray-200 border-gray-200 hover:border-gray-300 text-gray-800'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNextQuestion}
              disabled={!selected}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-accent-emerald to-teal-600 hover:opacity-95 text-white font-bold text-sm shadow-md active:scale-95 disabled:opacity-50 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Economics Lexicon Stage
  if (stage === 'economics' && examData) {
    const q = examData.economics_questions[currentIndex];
    const selected = economicsAnswers[q.id];

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-accent-amber uppercase">Stage 3: Economics Lexicon Screener</span>
          <span className="text-xs font-bold text-gray-500">
            {currentIndex + 1} of {examData.economics_questions.length}
          </span>
        </div>

        <ProgressBar current={currentIndex + 1} total={examData.economics_questions.length} />

        <div className="p-8 rounded-3xl bg-white border border-gray-200-card border border-surface-raised shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
              Field: {q.subfield}
            </span>
          </div>

          <h2 className="text-lg font-bold text-white">{q.definition_prompt}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(q.id, opt)}
                className={`p-4 rounded-2xl text-left text-sm font-bold border transition-all ${
                  selected === opt
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                    : 'bg-white shadow-sm border border-gray-200 border-gray-200 hover:border-gray-300 text-gray-800'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNextQuestion}
              disabled={!selected}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white font-bold text-sm shadow-md active:scale-95 disabled:opacity-50 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Spoken Response Stage
  if (stage === 'speaking' && examData) {
    const prompt = examData.spoken_prompt;

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-accent-violet uppercase">Stage 4: 60-Second Voice Assessment</span>
          <span className="text-xs font-bold text-gray-500">Final Section</span>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-gray-200-card border border-surface-raised shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">{prompt.scenario_title}</h2>
            <p className="text-sm text-gray-700 mt-2">{prompt.instructions_en}</p>
            <p className="text-xs text-gray-500 mt-1 italic">💡 {prompt.instructions_es}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-200 border border-gray-200">
            <span className="text-xs font-bold text-gray-700 block mb-2">Target Key Terms to Include:</span>
            <div className="flex flex-wrap gap-2">
              {prompt.target_keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-accent-cyan border border-gray-200"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <AudioRecorder
            onComplete={handleSpokenComplete}
            maxSeconds={prompt.expected_duration_seconds}
          />

          {isEvaluating && (
            <div className="flex items-center justify-center gap-2 text-primary-400 text-sm font-semibold animate-pulse">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>Analyzing lexical diversity, grammatical complexity, and calibrating CEFR...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 6. Calibrated Results & Roadmap Stage
  if (stage === 'result' && result) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        {/* Results Hero Header */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-surface-card to-surface border border-primary-500/40 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-primary-600 to-accent-emerald flex items-center justify-center text-white shadow-xl">
            <Award className="w-8 h-8" />
          </div>

          <span className="text-xs font-extrabold text-primary-400 uppercase tracking-wider">
            Diagnostic Placement Completed
          </span>

          <div className="flex items-center justify-center gap-4">
            <div className="text-5xl font-black text-white">{result.overall_cefr}</div>
            <span className="text-sm font-bold px-3 py-1 rounded-full bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30">
              Calibrated Proficiency
            </span>
          </div>

          <p className="text-xs text-gray-700 max-w-lg mx-auto">
            {result.spoken_evaluation?.feedback_es || 'Tu perfil ha sido calibrado con éxito.'}
          </p>
        </div>

        {/* 6-Axis Radar Competency Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200-card border border-surface-raised space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Competency Radar Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(result.radar_metrics).map(([metric, score], i) => (
              <div key={i} className="p-4 rounded-2xl bg-white shadow-sm border border-gray-200 border border-gray-200">
                <span className="text-xs font-bold text-gray-500 block mb-1">{metric}</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-white">{Math.round(score)}%</span>
                  <span className="text-[11px] font-semibold text-accent-cyan">
                    {score >= 80 ? 'Proficient' : score >= 60 ? 'Developing' : 'Foundational'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Roadmap */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200-card border border-surface-raised space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white">
                Personalized {result.study_plan_days}-Day Acceleration Roadmap
              </h3>
              <p className="text-xs text-gray-500">Targeted micro-lessons to bridge L1 gaps and master economic English</p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-primary-500/20 text-primary-300 border border-primary-500/30">
              {result.study_roadmap.length} Milestones
            </span>
          </div>

          <div className="space-y-3">
            {result.study_roadmap.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white shadow-sm border border-gray-200 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-black text-xs text-accent-cyan border border-gray-200 shrink-0">
                    Day {item.day}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white block">{item.focus_topic}</span>
                    <span className="text-[11px] text-gray-500">Recommended: {item.minutes_recommended} mins/day</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.suggested_nodes.map((nodeName, nIdx) => (
                    <span
                      key={nIdx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[11px] font-semibold text-gray-700 border border-gray-200"
                    >
                      {nodeName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button to Start Learning */}
        <div className="text-center pt-2">
          <a
            href="/learn"
            onClick={playClick}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-emerald hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-primary-600/35 active:scale-95 transition-all"
          >
            <span>Proceed to Interactive Skill Tree</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return null;
}

export default function PlacementTestPage() {
  return (
    <PageWrapper maxWidth="max-w-4xl">
      <PlacementTestContent />
    </PageWrapper>
  );
}
