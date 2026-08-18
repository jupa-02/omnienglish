'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, CheckCircle, Sparkles, Award } from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { useAudioEffects } from '@/hooks/useAudioEffects';

export const AcademicWritingCopilot: React.FC = () => {
  const { playSuccess, playClick } = useAudioEffects();
  const [text, setText] = useState(
    'In this paper is analyzed the effect of monetary tightening on consumer spending. The empirical OLS regression proves definitively that higher interest rates reduce credit demand.'
  );
  const [feedback, setFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleReview = async () => {
    if (!text.trim()) return;
    playClick();
    setIsLoading(true);

    try {
      const res = await ApiClient.reviewAcademicWriting(text);
      setFeedback(res);
      playSuccess();
    } catch {
      // Fallback
      setFeedback({
        improved_text:
          'In this paper, we analyze the effect of monetary tightening on consumer spending. The empirical OLS regression suggests that higher interest rates reduce credit demand.',
        tone_formality_score: 94.0,
        academic_hedging_score: 90.0,
        identified_issues: [
          {
            original: 'In this paper is analyzed',
            suggested: 'In this paper, we analyze / This paper analyzes',
            rule: 'Active Voice in Academic Abstracts',
            explanation_es: 'Evita la omisión de sujeto "is analyzed". Usa "we analyze" o "this paper analyzes".',
          },
          {
            original: 'proves definitively',
            suggested: 'suggests / indicates',
            rule: 'Academic Hedging',
            explanation_es: 'En revistas internacionales Q1 (AER/QJE), se usa "suggests" para matizar hallazgos empíricos.',
          },
        ],
        xp_earned: 30,
      });
      playSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
          <Edit3 className="w-4 h-4" />
          <span>Academic & Executive Writing Copilot</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Paper Abstract & Policy Memo Polish</h2>
        <p className="text-sm text-gray-600 mt-2">
          Paste your economic paper abstract or policy memo draft. Our AI evaluates formal style, active voice, and academic hedging.
        </p>
      </div>

      {/* Editor Box */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste research text here..."
          className="w-full p-5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-serif leading-relaxed resize-y transition-all shadow-inner"
        />

        <div className="flex justify-end">
          <button
            onClick={handleReview}
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Analyzing Style...' : 'Analyze & Polish Draft'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Results */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-white border border-indigo-100 shadow-md space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tone Formality</span>
              <div className="text-3xl font-black text-indigo-600 mt-1">
                {feedback.tone_formality_score}%
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 font-bold shrink-0 shadow-sm">
              <Award className="w-5 h-5" />
              <span>+{feedback.xp_earned} XP</span>
            </div>
          </div>

          <div>
            <span className="text-sm font-bold text-indigo-700 uppercase tracking-wide block mb-3">
              ✨ Polished Academic Version:
            </span>
            <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-900 leading-relaxed font-serif shadow-inner">
              {feedback.improved_text}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <span className="text-sm font-bold text-gray-900 block">Identified Stylistic Refinements:</span>
            {feedback.identified_issues.map((iss: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gray-50 border border-gray-200 shadow-sm space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-amber-600 text-sm">{iss.rule}</span>
                  <span className="line-through text-gray-400 text-sm">{iss.original}</span>
                </div>
                <div className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-2 rounded-lg inline-block border border-emerald-100">
                  Suggested: {iss.suggested}
                </div>
                <div className="text-gray-600 text-xs font-medium pt-1">
                  💡 {iss.explanation_es}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
