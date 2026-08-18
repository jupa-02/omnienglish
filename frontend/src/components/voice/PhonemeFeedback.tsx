'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Volume2 } from 'lucide-react';
import { useAudioEffects } from '@/hooks/useAudioEffects';

export interface PhonemeScoreData {
  phoneme: string;
  ipa: string;
  score: number; // 0.0 to 1.0
  is_contrastive_risk?: boolean;
  tip_es?: string;
}

interface PhonemeFeedbackProps {
  accuracy: number;
  wpm: number;
  phonemes: PhonemeScoreData[];
  alerts: string[];
}

export const PhonemeFeedback: React.FC<PhonemeFeedbackProps> = ({
  accuracy,
  wpm,
  phonemes,
  alerts,
}) => {
  const { speakText } = useAudioEffects();

  return (
    <div className="w-full space-y-4 rounded-2xl bg-white border border-gray-200 border border-surface-raised p-5 backdrop-blur-md">
      {/* Accuracy & Fluency Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surface-raised">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Overall Clarity
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-black ${
                accuracy >= 80
                  ? 'text-accent-emerald'
                  : accuracy >= 60
                  ? 'text-accent-amber'
                  : 'text-accent-rose'
              }`}
            >
              {Math.round(accuracy)}%
            </span>
            <span className="text-xs text-gray-500">match accuracy</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-white shadow-sm border border-gray-200 border border-gray-200 text-right">
            <span className="text-[11px] block font-medium text-gray-500">Pacing (WPM)</span>
            <span className="text-sm font-bold text-gray-800">{Math.round(wpm)} words/min</span>
          </div>
        </div>
      </div>

      {/* Spanish L1 Interference Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/30 text-rose-200 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-accent-rose shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300">Interferencia L1 Detectada: </span>
                {alert}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Phoneme Breakdown Cards */}
      <div>
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
          Phonetic & Contrastive Analysis (IPA)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {phonemes.map((item, idx) => {
            const isGood = item.score >= 0.75;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white shadow-sm border border-gray-200/80 border border-gray-200 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">{item.phoneme}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-white border border-gray-200 border border-gray-200 text-accent-cyan">
                      {item.ipa}
                    </span>
                  </div>
                  <button
                    onClick={() => speakText(item.phoneme)}
                    className="p-1 rounded-lg hover:bg-white border border-gray-200 text-gray-500 hover:text-white transition-colors"
                    title="Hear native pronunciation"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Score Bar */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-white border border-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isGood ? 'bg-accent-emerald' : 'bg-accent-amber'
                      }`}
                      style={{ width: `${item.score * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700">
                    {Math.round(item.score * 100)}%
                  </span>
                </div>

                {item.tip_es && (
                  <p className="text-[11px] text-gray-500 mt-2 italic leading-tight">
                    💡 {item.tip_es}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
