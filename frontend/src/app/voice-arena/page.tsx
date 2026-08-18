'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Volume2, Sparkles, Award, ShieldAlert, Check } from 'lucide-react';
import { AudioRecorder } from '@/components/voice/AudioRecorder';
import { PhonemeFeedback, PhonemeScoreData } from '@/components/voice/PhonemeFeedback';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function VoiceArenaPage() {
  const { playSuccess, playLevelUp, speakText } = useAudioEffects();

  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [evaluation, setEvaluation] = useState<{
    accuracy: number;
    wpm: number;
    phonemes: PhonemeScoreData[];
    alerts: string[];
  } | null>(null);

  const practiceScenarios = [
    {
      title: 'Minimal Pair: /iː/ vs /ɪ/ (reach vs rich / sheet)',
      target: 'The financial research indicates that the balance sheet will reach a rich valuation.',
      focus_ipa: '/iː/ vs /ɪ/',
      tip_es: 'Alarga "reach" /riːtʃ/ y "sheet" /ʃiːt/, contrástalo con "rich" /rɪtʃ/.',
    },
    {
      title: 'Initial /s/ Cluster: (strategy, specific, structure)',
      target: 'The specific investment strategy focuses on long term market structure.',
      focus_ipa: '/sC-/',
      tip_es: 'Inicia directamente con el sonido de la "s", sin agregar una "e" de apoyo (no "estrategy").',
    },
    {
      title: 'Consonant Contrast: /b/ vs /v/ (berry vs very / vote)',
      target: 'The committee will vote on a very beneficial monetary stimulus.',
      focus_ipa: '/v/ vs /b/',
      tip_es: 'En "vote" y "very", los dientes superiores vibran contra el labio inferior (/v/).',
    },
    {
      title: 'Vowel Reduction to Schwa: /ə/ in Macro Lexicon',
      target: 'The economic indicator suggests inflation will normalize by next quarter.',
      focus_ipa: '/ˌiː.kəˈnɒm.ɪk/',
      tip_es: 'Reduce las sílabas débiles a la vocal neutra schwa /ə/.',
    },
  ];

  const currentScenario = practiceScenarios[selectedScenarioIndex];

  const handleSpokenComplete = (transcript: string, durationSec: number) => {
    // Contrastive check logic
    const lower = transcript.toLowerCase();
    const alerts: string[] = [];

    if (lower.includes('estrategy') || lower.includes('especific') || lower.includes('estructure')) {
      alerts.push('Vocal protética detectada: evita pronunciar "e" antes de palabras con /s/ inicial.');
    }

    const accuracy = Math.min(96, Math.max(65, 88 + (transcript.length > 20 ? 5 : -10)));
    const wpm = (transcript.split(' ').length / Math.max(1, durationSec)) * 60;

    const mockPhonemes: PhonemeScoreData[] = [
      {
        phoneme: currentScenario.focus_ipa,
        ipa: currentScenario.focus_ipa,
        score: accuracy / 100,
        is_contrastive_risk: true,
        tip_es: currentScenario.tip_es,
      },
      {
        phoneme: 'Rhythm & Stress',
        ipa: 'Stress-Timed',
        score: 0.85,
        is_contrastive_risk: false,
        tip_es: 'Buen ritmo acentual en las palabras clave de contenido.',
      },
    ];

    setEvaluation({
      accuracy,
      wpm: Math.round(wpm),
      phonemes: mockPhonemes,
      alerts,
    });

    playSuccess();
    if (accuracy >= 90) playLevelUp();
  };

  return (
    <PageWrapper maxWidth="max-w-4xl">
      <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 border border-surface-raised backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-accent-emerald uppercase tracking-wider">
            <Mic className="w-4 h-4" />
            <span>Real-Time SLA Voice Arena</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[10px] font-bold tracking-wide">
            <Sparkles className="w-3 h-3" />
            <span>Powered by Nvidia VoiceChat (Full-Duplex)</span>
          </div>
        </div>
        <h1 className="text-2xl font-black text-white">Live Pronunciation & Contrastive Lab</h1>
        <p className="text-xs text-gray-700 mt-1">
          Practice high-contrast phonetic drills with ultra-low latency waveform visualizers, AI phoneme accuracy feedback, and Spanish L1 interference detection.
        </p>
      </div>

      {/* Drill Scenario Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {practiceScenarios.map((sc, idx) => {
          const isSelected = selectedScenarioIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => {
                setSelectedScenarioIndex(idx);
                setEvaluation(null);
              }}
              className={`p-4 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-primary-600/20 border-primary-500 text-white shadow-lg'
                  : 'bg-white border border-gray-200-card border-surface-raised hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-accent-cyan">{sc.focus_ipa}</span>
                {isSelected && <Check className="w-4 h-4 text-primary-400" />}
              </div>
              <h3 className="text-sm font-extrabold text-white">{sc.title}</h3>
            </button>
          );
        })}
      </div>

      {/* Target Sentence Card */}
      <div className="p-8 rounded-3xl bg-white border border-gray-200-card border border-surface-raised shadow-2xl space-y-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => speakText(currentScenario.target, 0.9)}
            className="w-12 h-12 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-600/30 active:scale-95 transition-all"
            title="Hear native audio"
          >
            <Volume2 className="w-6 h-6" />
          </button>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Click to hear target pronunciation
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed max-w-2xl mx-auto">
          &quot;{currentScenario.target}&quot;
        </h2>

        <p className="text-xs text-accent-cyan max-w-lg mx-auto italic">
          💡 {currentScenario.tip_es}
        </p>

        {/* Live Audio Recorder Component */}
        <AudioRecorder
          onComplete={handleSpokenComplete}
          targetSentence={currentScenario.target}
          maxSeconds={30}
        />
      </div>

      {/* Phoneme Evaluation & Heatmap Results */}
      {evaluation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <PhonemeFeedback
            accuracy={evaluation.accuracy}
            wpm={evaluation.wpm}
            phonemes={evaluation.phonemes}
            alerts={evaluation.alerts}
          />
        </motion.div>
      )}
    </div>
    </PageWrapper>
  );
}
