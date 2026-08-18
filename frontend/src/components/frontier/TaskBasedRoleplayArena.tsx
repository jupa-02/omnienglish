'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Image as ImageIcon,
  Users,
  Mic,
  Send,
  Volume2,
  Sparkles,
  CheckCircle2,
  Timer,
  Award,
  ArrowRight,
  TrendingUp,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { ApiClient } from '@/lib/api';
import { RoleplayScenario, PhotoScenario } from '@/lib/types';
import { WaveformLive } from '@/components/voice/WaveformLive';

export const TaskBasedRoleplayArena: React.FC = () => {
  const { playClick, playSuccess, playLevelUp, speakText } = useAudioEffects();
  const { isListening, transcript, startListening, stopListening, resetTranscript, volumeLevel } =
    useSpeechRecognition();

  const [activeTab, setActiveTab] = useState<'debate' | 'photo' | 'roleplay'>('debate');

  // Roleplay & Debate states
  const [roleplayScenarios, setRoleplayScenarios] = useState<RoleplayScenario[]>([]);
  const [photoScenarios, setPhotoScenarios] = useState<PhotoScenario[]>([]);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);

  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [latestRhetoricalFeedback, setLatestRhetoricalFeedback] = useState<any>(null);

  // Photo description timer state
  const [photoTimer, setPhotoTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [rRes, pRes] = await Promise.all([
          ApiClient.getRoleplayScenarios(),
          ApiClient.getPhotoScenarios()
        ]);
        if (rRes.scenarios) setRoleplayScenarios(rRes.scenarios);
        if (pRes.scenarios) setPhotoScenarios(pRes.scenarios);
      } catch {
        // Fallback
      }
    }
    loadData();
  }, []);

  const currentRoleplay = roleplayScenarios[selectedScenarioIndex] || {
    id: 'rp_fed_debate',
    title: 'FOMC Monetary Policy Timed Debate',
    category: 'Debate Mode',
    ai_character: 'Dr. Marcus Vance (Hawkish Fed Governor)',
    objective: 'Argue against raising interest rates by 50 bps.',
    initial_prompt: 'Governor, core inflation remains above our 2% mandate. If we do not hike rates today, inflation expectations will become unanchored. How can you justify a pause?',
    evaluation_criteria: ['Economic ESP Lexicon', 'Rebuttal Agility', 'Cohesive Connectors']
  };

  const currentPhoto = photoScenarios[0] || {
    id: 'photo_macro',
    title: 'Central Bank Macroeconomic Yield Curve Inversion',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    prompt_en: 'You have 60 seconds. Describe the financial chart, explain the yield curve inversion trend between 2Y and 10Y Treasury notes, and articulate recession probabilities.',
    key_vocabulary: ['inverted yield curve', 'Treasury spreads', 'tightening cycle', 'recessionary signal']
  };

  useEffect(() => {
    if (currentRoleplay && conversationHistory.length === 0) {
      setConversationHistory([
        { role: 'assistant', content: currentRoleplay.initial_prompt }
      ]);
    }
  }, [currentRoleplay]);

  // Photo timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && photoTimer > 0) {
      interval = setInterval(() => setPhotoTimer((prev) => prev - 1), 1000);
    } else if (photoTimer === 0) {
      setIsTimerRunning(false);
      stopListening();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, photoTimer]);

  const handleSendTurn = async () => {
    const speech = transcript.trim();
    if (!speech) return;

    playClick();
    stopListening();
    setIsProcessing(true);

    const updatedHistory = [...conversationHistory, { role: 'user', content: speech }];
    setConversationHistory(updatedHistory);

    try {
      const res = await ApiClient.processRoleplayTurn({
        scenario_id: currentRoleplay.id,
        user_speech: speech,
        conversation_history: updatedHistory
      });

      setConversationHistory((prev) => [
        ...prev,
        { role: 'assistant', content: res.ai_reply }
      ]);
      setLatestRhetoricalFeedback(res.rhetorical_analysis);
      speakText(res.ai_reply, 0.95);
      playSuccess();
    } catch {
      // Fallback response
      const fallbackReply = "That is a well-structured argument. However, consider how foreign exchange volatility might counteract your proposed policy.";
      setConversationHistory((prev) => [
        ...prev,
        { role: 'assistant', content: fallbackReply }
      ]);
      speakText(fallbackReply, 0.95);
    } finally {
      setIsProcessing(false);
      resetTranscript();
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Mode Tabs */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 border border-orange-500/30 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Swords className="w-7 h-7 text-gray-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/30">
                Talkpal Task-Based Immersion™
              </span>
              <span className="text-xs font-mono text-gray-500">Debate &amp; Roleplay Arena</span>
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight mt-0.5">
              Task-Based Language Teaching (TBLT)
            </h2>
          </div>
        </div>

        {/* 3 Core Talkpal Modes */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200">
          <button
            onClick={() => {
              playClick();
              setActiveTab('debate');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'debate'
                ? 'bg-orange-600 text-gray-900 shadow-md shadow-orange-600/30'
                : 'text-gray-500 hover:text-gray-800 hover:bg-white'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Debate Mode</span>
          </button>

          <button
            onClick={() => {
              playClick();
              setActiveTab('photo');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'photo'
                ? 'bg-orange-600 text-gray-900 shadow-md shadow-orange-600/30'
                : 'text-gray-500 hover:text-gray-800 hover:bg-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photo / Chart Pitch</span>
          </button>

          <button
            onClick={() => {
              playClick();
              setActiveTab('roleplay');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'roleplay'
                ? 'bg-orange-600 text-gray-900 shadow-md shadow-orange-600/30'
                : 'text-gray-500 hover:text-gray-800 hover:bg-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Executive Roleplays</span>
          </button>
        </div>
      </div>

      {/* Mode 1 & 3: Debate & Roleplay Arena */}
      {(activeTab === 'debate' || activeTab === 'roleplay') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Scenario Briefing & Conversation Thread */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-gray-200 border border-surface-raised shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                    {currentRoleplay.category}
                  </span>
                  <h3 className="text-base font-black text-gray-900">{currentRoleplay.title}</h3>
                </div>
                <span className="text-xs font-mono text-gray-500 bg-white px-3 py-1 rounded-xl border border-gray-200">
                  AI: {currentRoleplay.ai_character}
                </span>
              </div>

              {/* Chat Thread */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                {conversationHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'assistant'
                        ? 'bg-gradient-to-r from-orange-950/40 to-gray-50 border border-orange-500/30 text-orange-100 mr-6'
                        : 'bg-gray-200 border border-gray-300 text-gray-900 ml-6'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold text-orange-400 block mb-1">
                      {msg.role === 'assistant' ? currentRoleplay.ai_character : 'You'}
                    </span>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))}
              </div>

              {/* Live Voice Recording & Action Bar */}
              <div className="pt-2 border-t border-gray-200 space-y-3">
                <WaveformLive isActive={isListening} volumeLevel={volumeLevel} height={40} />

                <div className="flex items-center gap-3">
                  {!isListening ? (
                    <button
                      onClick={() => {
                        playClick();
                        resetTranscript();
                        startListening();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-gray-900 font-black text-xs shadow-lg shadow-orange-600/30 active:scale-95 transition-all"
                    >
                      <Mic className="w-4 h-4 animate-bounce" />
                      <span>Speak Rebuttal / Argument</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSendTurn}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/40 animate-pulse active:scale-95 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Turn to AI Partner</span>
                    </button>
                  )}
                </div>

                {transcript && (
                  <p className="text-xs font-mono text-center text-orange-300">
                    "{transcript}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Rhetorical & Analytical Radar */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-gray-200 border border-surface-raised shadow-xl space-y-4">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Rhetorical Evaluation &amp; Upgrades</span>
              </span>

              {latestRhetoricalFeedback ? (
                <div className="space-y-4">
                  {/* Radar Telemetry */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-white border border-gray-200">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Persuasion</span>
                      <span className="text-sm font-black text-orange-400 font-mono">
                        {latestRhetoricalFeedback.radar?.precision || 85}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-gray-200">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Cohesion</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {latestRhetoricalFeedback.radar?.cohesion || 88}%
                      </span>
                    </div>
                  </div>

                  {/* C1 Upgrades */}
                  {latestRhetoricalFeedback.c1_upgrades?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                        Rhetorical Power Upgrades
                      </span>
                      {latestRhetoricalFeedback.c1_upgrades.map((up: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-white border border-gray-200 text-xs space-y-1">
                          <p className="font-bold text-emerald-300">"{up.upgraded}"</p>
                          <p className="text-[11px] text-gray-500">{up.nuance_explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500 leading-relaxed">
                  Speak your counter-argument. The TBLT engine will grade your persuasion, structure, and formal connectors.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Photo & Visual Scenario Oral Description */}
      {activeTab === 'photo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-gray-200 border border-surface-raised shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                  Oral Image/Chart Pitch
                </span>
                <h3 className="text-base font-black text-gray-900">{currentPhoto.title}</h3>
              </div>

              {/* 60s Countdown Timer */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gray-200 font-mono">
                <Timer className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-black text-orange-300">{photoTimer}s</span>
              </div>
            </div>

            {/* High-res Image / Chart Display */}
            <div className="w-full h-64 rounded-2xl overflow-hidden relative border border-gray-200">
              <img
                src={currentPhoto.image_url}
                alt={currentPhoto.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs text-gray-700 leading-relaxed bg-white p-3.5 rounded-2xl border border-gray-200">
              {currentPhoto.prompt_en}
            </p>

            {/* Voice Pitch Controls */}
            <div className="flex items-center gap-3 pt-2">
              {!isTimerRunning ? (
                <button
                  onClick={() => {
                    playClick();
                    setPhotoTimer(60);
                    setIsTimerRunning(true);
                    resetTranscript();
                    startListening();
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-gray-900 font-black text-xs shadow-lg shadow-orange-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Mic className="w-4 h-4 animate-bounce" />
                  <span>Start 60s Timed Pitch</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    stopListening();
                    playSuccess();
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 animate-pulse active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Complete Pitch</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Key ESP Vocabulary targets */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-gray-200 border border-surface-raised shadow-xl space-y-4">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block">
              Required Descriptive Vocabulary
            </span>

            <div className="space-y-2">
              {currentPhoto.key_vocabulary.map((voc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-gray-200 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-gray-800">{voc}</span>
                  <button
                    onClick={() => {
                      playClick();
                      speakText(voc, 0.9);
                    }}
                    className="p-1 text-orange-400 hover:bg-gray-100 rounded"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
