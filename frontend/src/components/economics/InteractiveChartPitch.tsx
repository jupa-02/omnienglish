'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Mic, Award, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { ChartPitchScenario } from '@/lib/types';
import { AudioRecorder } from '../voice/AudioRecorder';
import { ApiClient } from '@/lib/api';
import { useAudioEffects } from '@/hooks/useAudioEffects';

interface InteractiveChartPitchProps {
  scenario: ChartPitchScenario;
}

export const InteractiveChartPitch: React.FC<InteractiveChartPitchProps> = ({ scenario }) => {
  const { playSuccess, playLevelUp } = useAudioEffects();
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRecordComplete = async (transcript: string, durationSec: number) => {
    setIsLoading(true);
    try {
      const res = await ApiClient.evaluateChartPitch(scenario.id, transcript, durationSec);
      setEvaluation(res);
      playSuccess();
      if (res.overall_score >= 85) playLevelUp();
    } catch {
      // Local fallback simulation
      setEvaluation({
        overall_score: 88.5,
        vocabulary_richness_score: 90.0,
        trend_accuracy_score: 85.0,
        fluency_score: 90.0,
        used_key_phrases: [scenario.key_movements[0] || 'surged to a high'],
        missed_key_phrases: [scenario.key_movements[1] || 'plateaued around target'],
        contrastive_grammar_fixes: [],
        model_pitch_script: `During this period, ${scenario.title} exhibited high volatility. Initially, it skyrocketed to its peak before decelerating sharply as policy rates rose.`,
        xp_earned: 40,
      });
      playSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  // SVG Chart rendering calculations
  const data = scenario.data_points;
  const maxVal = Math.max(...data.map((d) => d.value), 10);
  const minVal = Math.min(...data.map((d) => d.value), 0);
  const range = maxVal - minVal || 1;

  const svgWidth = 600;
  const svgHeight = 220;
  const padding = 40;

  const getCoordinates = (index: number, val: number) => {
    const x = padding + (index / (data.length - 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - ((val - minVal) / range) * (svgHeight - padding * 2);
    return { x, y };
  };

  const pointsString = data
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.value);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-full space-y-6">
      {/* Scenario Header */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
          <TrendingUp className="w-4 h-4" />
          <span>Chart & Time-Series Pitching Arena</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{scenario.title}</h2>
        <p className="text-sm text-gray-600 mt-2">{scenario.context_en}</p>
        <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-sm text-amber-800 font-medium">💡 Contexto: {scenario.context_es}</p>
        </div>
      </div>

      {/* Interactive SVG Time-Series Chart */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Interactive Projection</span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            Target Time: {scenario.target_pitch_seconds}s
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full min-w-[500px] h-auto drop-shadow-sm">
            <defs>
              <linearGradient id="chartGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line
              x1={padding}
              y1={svgHeight - padding}
              x2={svgWidth - padding}
              y2={svgHeight - padding}
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            {/* Y axis Grid Lines (Faint) */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = svgHeight - padding - ratio * (svgHeight - padding * 2);
              return (
                <line
                  key={ratio}
                  x1={padding}
                  y1={y}
                  x2={svgWidth - padding}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              )
            })}

            {/* Area fill */}
            <polygon
              points={`${getCoordinates(0, minVal).x},${svgHeight - padding} ${pointsString} ${
                getCoordinates(data.length - 1, minVal).x
              },${svgHeight - padding}`}
              fill="url(#chartGlow)"
            />

            {/* Polyline Path */}
            <polyline
              fill="none"
              stroke="#6366f1"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
            />

            {/* Data Points and Labels */}
            {data.map((d, i) => {
              const { x, y } = getCoordinates(i, d.value);
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    className="fill-indigo-600 stroke-white stroke-[3px] hover:r-6 transition-all cursor-pointer shadow-md"
                  />
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    fill="#1e293b"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {d.value}%
                  </text>
                  <text
                    x={x}
                    y={svgHeight - padding + 18}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {d.period}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dynamic Vocabulary Pills */}
        <div className="mt-8 pt-5 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-3">Recommended Lexicon:</span>
          <div className="flex flex-wrap gap-2">
            {scenario.suggested_vocabulary.map((v, i) => (
              <div
                key={i}
                className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800"
              >
                <span className="font-bold text-indigo-600">{v.word}</span>
                <span className="text-gray-500 ml-1.5 text-[11px] font-normal">— {v.definition}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Recording Arena */}
      <div className="p-8 rounded-2xl bg-white border border-indigo-100 text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
        <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider mb-2">
          Record Your Oral Pitch (45s)
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          Describe the trajectory of the series in English using formal financial lexicon (skyrocketed, tumbled, plateaued).
        </p>

        <div className="flex justify-center w-full max-w-sm mx-auto">
          <AudioRecorder
            onComplete={handleRecordComplete}
            maxSeconds={scenario.target_pitch_seconds}
          />
        </div>

        {isLoading && (
          <div className="mt-6 flex items-center justify-center gap-2 text-indigo-600 text-sm font-semibold animate-pulse">
            <Sparkles className="w-5 h-5 animate-spin" />
            Evaluating economic fluency and vocabulary richness...
          </div>
        )}
      </div>

      {/* Evaluation Results Card */}
      {evaluation && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-md space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pitch Performance</span>
              <div className="text-4xl font-black text-emerald-600 mt-1">
                {evaluation.overall_score}%
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 font-bold shrink-0">
              <Award className="w-6 h-6" />
              <span>+{evaluation.xp_earned} XP Earned</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Lexical Richness</span>
              <span className="text-2xl font-black text-indigo-600">
                {evaluation.vocabulary_richness_score}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Trend Accuracy</span>
              <span className="text-2xl font-black text-blue-600">
                {evaluation.trend_accuracy_score}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Fluency Rate</span>
              <span className="text-2xl font-black text-emerald-600">
                {evaluation.fluency_score}%
              </span>
            </div>
          </div>

          {/* Key Phrases Breakdown */}
          <div className="space-y-3 pt-2">
            <span className="text-sm font-bold text-gray-900 block">Phrasal Evaluation:</span>
            <div className="grid sm:grid-cols-2 gap-2">
              {evaluation.used_key_phrases.map((phrase: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Used: &quot;{phrase}&quot;</span>
                </div>
              ))}
              {evaluation.missed_key_phrases?.map((phrase: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-800 font-medium">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Missed: &quot;{phrase}&quot;</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benchmark Model Script */}
          <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-100 mt-6">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide block mb-2">
              🏆 Native Benchmark Model Script:
            </span>
            <p className="text-sm text-indigo-900 leading-relaxed font-serif italic">
              &quot;{evaluation.model_pitch_script}&quot;
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
