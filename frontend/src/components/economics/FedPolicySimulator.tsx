'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Send, Bot, User, Volume2, Sparkles } from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { useAudioEffects } from '@/hooks/useAudioEffects';

interface Message {
  role: 'user' | 'chair' | 'system';
  content: string;
  summary_es?: string;
}

export const FedPolicySimulator: React.FC = () => {
  const { playSuccess, playClick, speakText } = useAudioEffects();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'chair',
      content:
        'Welcome to the FOMC Policy Meeting. Headline CPI inflation is hovering at 3.5%, while non-farm payroll growth has moderated to 140,000. As an advisory governor, what is your monetary policy stance regarding the target federal funds rate?',
      summary_es:
        'El Presidente de la Fed abre la sesión: La inflación está en 3.5% y el empleo se modera. ¿Cuál es tu propuesta sobre la tasa de interés de referencia?',
    },
  ]);
  const [inputArg, setInputArg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contrastiveAlert, setContrastiveAlert] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputArg.trim() || isLoading) return;

    playClick();
    const userText = inputArg.trim();
    setInputArg('');

    const newHistory: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await ApiClient.sendFedDebateTurn(
        'Stagflation Shock Decision',
        userText,
        newHistory
      );
      playSuccess();
      setMessages([
        ...newHistory,
        {
          role: 'chair',
          content: res.chair_response_en,
          summary_es: res.chair_response_es_summary,
        },
      ]);
      if (res.contrastive_correction) {
        setContrastiveAlert(res.contrastive_correction);
      }
    } catch {
      // Fallback
      setMessages([
        ...newHistory,
        {
          role: 'chair',
          content:
            'A data-dependent stance is appropriate. If we observe wage pressures persisting, an additional 25 basis point hike remains on the table.',
          summary_es:
            'El Presidente coincide en que una postura dependiente de los datos es la más prudente.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Fed Simulator Header */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
          <ShieldAlert className="w-4 h-4" />
          <span>Central Banking & Macroeconomic Policy Simulator</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">FOMC Rate Decision Arena</h2>
        <p className="text-sm text-gray-600 mt-2">
          Engage in a live macroeconomic debate with the AI Federal Reserve Chair. Formulate arguments on core inflation, quantitative tightening, and dual-mandate trade-offs.
        </p>
      </div>

      {/* Contrastive Alert */}
      {contrastiveAlert && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center justify-between shadow-sm"
        >
          <div>
            <span className="font-bold text-amber-700">Corrección L1: </span>
            Usa &quot;{contrastiveAlert.correction}&quot; en lugar de &quot;{contrastiveAlert.original}&quot;. {contrastiveAlert.note}
          </div>
          <button
            onClick={() => setContrastiveAlert(null)}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 ml-3"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Conversation Feed */}
      <div className="space-y-5 max-h-[460px] overflow-y-auto p-4 sm:p-6 rounded-2xl bg-gray-50 border border-gray-200 shadow-inner">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-3 ${
              m.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-emerald-600 border border-gray-200'
              }`}
            >
              {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className={`font-bold text-[11px] uppercase tracking-wider ${m.role === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {m.role === 'user' ? 'Governor (You)' : 'Federal Reserve Chair'}
                </span>
                {m.role === 'chair' && (
                  <button
                    onClick={() => speakText(m.content)}
                    className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className={m.role === 'user' ? 'text-indigo-50 font-medium' : 'text-gray-700'}>{m.content}</p>
              {m.summary_es && (
                <div className={`mt-3 pt-3 border-t ${m.role === 'user' ? 'border-indigo-500 text-indigo-200' : 'border-gray-100 text-gray-500'} text-[11px] italic`}>
                  💡 {m.summary_es}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-indigo-600 font-semibold animate-pulse pl-14 pt-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            The Fed Chair is evaluating your macroeconomic argument...
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 relative">
        <input
          type="text"
          value={inputArg}
          onChange={(e) => setInputArg(e.target.value)}
          placeholder="Present your argument in English (e.g. 'We should hike rates by 25 bps to curb inflation...')"
          className="flex-1 px-4 sm:px-6 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !inputArg.trim()}
          className="px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
