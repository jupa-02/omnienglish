'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sigma, Check, AlertCircle, Award } from 'lucide-react';
import { useAudioEffects } from '@/hooks/useAudioEffects';

export const EconometricsStorytelling: React.FC = () => {
  const { playSuccess, playError } = useAudioEffects();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isEvaluated, setIsEvaluated] = useState(false);

  const scenario = {
    title: 'Minimum Wage & Employment Dynamics (TWFE & DiD)',
    formula: 'ln(Employment)_{it} = \\alpha_i + \\lambda_t + \\beta \\cdot \\text{Policy}_{it} + X_{it}\'\\gamma + \\varepsilon_{it}',
    table: [
      { var: 'Minimum Wage Policy (beta)', coef: '0.042***', se: '(0.013)', p: 'p < 0.001' },
      { var: 'Regional Log GDP', coef: '0.285***', se: '(0.071)', p: 'p < 0.001' },
      { var: 'State Fixed Effects', coef: 'Yes', se: '-', p: '-' },
      { var: 'Year Fixed Effects', coef: 'Yes', se: '-', p: '-' },
    ],
    question: 'How should you formally interpret the coefficient on the Minimum Wage Policy in a Q1 academic paper?',
    options: [
      {
        id: 'opt_1',
        text: 'The regression proves definitively that increasing the minimum wage always causes a 4.2% jump in jobs without doubt.',
        isCorrect: false,
        explanation: 'En economía académica evitamos afirmaciones categóricas ("proves definitively"). Falla de Academic Hedging.',
      },
      {
        id: 'opt_2',
        text: 'The estimated coefficient indicates a statistically significant positive effect at the 1% level (beta = 0.042, p < 0.001), while controlling for state and time fixed effects.',
        isCorrect: true,
        explanation: '¡Excelente! Expresión canónica formal en econometría empírica internacional.',
      },
      {
        id: 'opt_3',
        text: 'The policy has a big correlation of 4.2 percent in the employment.',
        isCorrect: false,
        explanation: 'Demasiado informal ("big correlation", "in the employment").',
      },
    ],
  };

  const handleSelect = (optId: string) => {
    setSelectedOption(optId);
    setIsEvaluated(true);
    const chosen = scenario.options.find((o) => o.id === optId);
    if (chosen?.isCorrect) {
      playSuccess();
    } else {
      playError();
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
          <Sigma className="w-4 h-4" />
          <span>Econometrics & Quantitative Storytelling Lab</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{scenario.title}</h2>
      </div>

      {/* Regression Model Table Card */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-6">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 font-mono text-center text-sm text-indigo-700 shadow-inner overflow-x-auto">
          {scenario.formula}
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-gray-500 font-bold uppercase text-xs tracking-wider">
                <th className="py-3 px-4 font-semibold">Regressor</th>
                <th className="py-3 px-4 font-semibold">Estimate (Coeff)</th>
                <th className="py-3 px-4 font-semibold">Std. Error</th>
                <th className="py-3 px-4 font-semibold">Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {scenario.table.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900">{row.var}</td>
                  <td className="py-3 px-4 font-mono text-indigo-600 font-bold">{row.coef}</td>
                  <td className="py-3 px-4 font-mono text-gray-500">{row.se}</td>
                  <td className="py-3 px-4 font-mono text-emerald-600">{row.p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Formulation Question */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-gray-900">{scenario.question}</h3>

        <div className="space-y-3">
          {scenario.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all flex items-start gap-3 border ${
                  isSelected
                    ? opt.isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm'
                      : 'bg-rose-50 border-rose-200 text-rose-900 shadow-sm'
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isSelected ? (
                    opt.isCorrect ? (
                      <Check className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                    )
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div>
                  <p className="leading-relaxed">{opt.text}</p>
                  {isEvaluated && isSelected && (
                    <div
                      className={`mt-3 p-3 rounded-lg text-xs sm:text-sm font-medium ${
                        opt.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      💡 {opt.explanation}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
