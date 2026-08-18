'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Settings,
  ShieldCheck,
  Pause,
  RotateCcw,
  MessageSquare,
  Radio,
  X,
  TrendingUp,
  Activity,
  Headphones
} from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { ApiClient } from '@/lib/api';
import { WaveformLive } from '@/components/voice/WaveformLive';
import { Avatar3DCanvas } from '@/components/avatar3d/Avatar3DCanvas';

interface AvatarPersona {
  name: string;
  accent: string;
  role: string;
  personality: string;
  greeting: string;
  voice_name: string;
  speech_rate: number;
  themeColor: string;
}

const PERSONAS: Record<string, AvatarPersona> = {
  emma: {
    name: 'Emma',
    accent: 'British RP',
    role: 'Fluency Mentor',
    personality: 'Supportive, crisp British enunciation.',
    greeting: "Hello! I'm Emma, your British conversational partner. What's on your mind today?",
    voice_name: 'en-GB',
    speech_rate: 0.95,
    themeColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-500'
  },
  liam: {
    name: 'Liam',
    accent: 'General American',
    role: 'Tech Executive',
    personality: 'Dynamic, pragmatic Silicon Valley vocabulary.',
    greeting: "Hey there! Liam here. Ready to jump into some fast, natural conversation?",
    voice_name: 'en-US',
    speech_rate: 1.0,
    themeColor: 'from-cyan-500/20 to-blue-500/20 text-cyan-500'
  },
  chloe: {
    name: 'Chloe',
    accent: 'Australian Native',
    role: 'Conversational Coach',
    personality: 'Warm, expressive, high emotional intelligence.',
    greeting: "G'day! I'm Chloe from Sydney. Feel totally free to speak your mind!",
    voice_name: 'en-AU',
    speech_rate: 0.95,
    themeColor: 'from-amber-500/20 to-orange-500/20 text-amber-500'
  },
  arthur: {
    name: 'Arthur',
    accent: 'British Formal',
    role: 'Policy Fellow',
    personality: 'Diplomatic, academic rhetoric, structured discourse.',
    greeting: "A very warm welcome. I am Arthur. Shall we examine a pressing global topic?",
    voice_name: 'en-GB',
    speech_rate: 0.9,
    themeColor: 'from-purple-500/20 to-violet-500/20 text-purple-500'
  },
};

export const InteractiveAvatar: React.FC = () => {
  const { playClick, playSuccess } = useAudioEffects();

  const [activePersonaKey, setActivePersonaKey] = useState<'emma' | 'liam' | 'chloe' | 'arthur'>('emma');
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [isHandsFreeMode, setIsHandsFreeMode] = useState<boolean>(true);
  const [confidenceScore, setConfidenceScore] = useState<number>(88);
  const [recastTips, setRecastTips] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [talkTimeSeconds, setTalkTimeSeconds] = useState<number>(0);
  
  // UI States
  const [showTranscript, setShowTranscript] = useState(false);

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; recast?: string }>>([
    {
      role: 'assistant',
      content: PERSONAS.emma.greeting,
    },
  ]);

  const activePersona = PERSONAS[activePersonaKey];
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const talkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Text to Speech with Barge-In capability and viseme sync
  const speakAvatarResponse = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setAvatarState('speaking');

    const cleanText = text.replace(/\[.*?\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = activePersona.voice_name;
    utterance.rate = activePersona.speech_rate * speechSpeed;
    utterance.pitch = activePersonaKey === 'emma' ? 1.05 : activePersonaKey === 'chloe' ? 1.1 : 0.95;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.includes(activePersona.voice_name) || v.name.toLowerCase().includes(activePersona.name.toLowerCase())
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      setAvatarState('idle');
      currentUtteranceRef.current = null;
      if (isHandsFreeMode) {
        setTimeout(() => {
          startListening();
        }, 300);
      }
    };

    utterance.onerror = () => {
      setAvatarState('idle');
      currentUtteranceRef.current = null;
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [activePersona, activePersonaKey, isHandsFreeMode, speechSpeed]);

  // 2. Stop Avatar Speaking (Barge-in Interrupt)
  const interruptAvatar = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (avatarState === 'speaking') {
      setAvatarState('idle');
    }
  }, [avatarState]);

  // 3. User Speech Processing Loop
  const handleUserSpeechTurn = useCallback(async (spokenText: string) => {
    if (!spokenText.trim()) return;

    interruptAvatar();
    setAvatarState('thinking');
    playClick();

    const userMsg = { role: 'user' as const, content: spokenText.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setTurnCount((c) => c + 1);

    try {
      const response = await ApiClient.proactiveVoiceConverse({
        persona_key: activePersonaKey,
        user_transcript: spokenText,
        conversation_history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        target_cefr: 'B2',
      });

      if (response && response.response_text) {
        if (response.affective_filter_score) {
          setConfidenceScore(response.affective_filter_score);
        }
        if (response.recast_feedback) {
          setRecastTips(response.recast_feedback);
          // Auto open transcript to show feedback
          setShowTranscript(true);
        }

        const assistantMsg = {
          role: 'assistant' as const,
          content: response.response_text,
          recast: response.recast_feedback || undefined,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        speakAvatarResponse(response.response_text);
      } else {
        const fallbackText = `I understand! Speaking of ${spokenText.slice(0, 30)}..., could you share a bit more about how that impacts your day-to-day workflow?`;
        setMessages((prev) => [...prev, { role: 'assistant', content: fallbackText }]);
        speakAvatarResponse(fallbackText);
      }
    } catch (err) {
      console.error('Voice converse error:', err);
      const fallbackText = "That's very interesting! Could you elaborate a bit more on that point?";
      setMessages((prev) => [...prev, { role: 'assistant', content: fallbackText }]);
      speakAvatarResponse(fallbackText);
    }
  }, [activePersonaKey, messages, interruptAvatar, playClick, speakAvatarResponse]);

  // 4. Speech Recognition Hook
  const {
    isListening,
    transcript,
    interimTranscript,
    volumeLevel,
    startListening,
    stopListening,
    resetTranscript,
    hasSupport
  } = useSpeechRecognition({
    lang: 'en-US',
    continuous: true,
    autoStopOnSilenceMs: 1600,
    onSilenceDetected: (spokenText: string) => {
      if (spokenText && spokenText.trim().length > 1) {
        handleUserSpeechTurn(spokenText);
        resetTranscript();
      }
    },
  });

  useEffect(() => {
    if (isListening) {
      talkTimerRef.current = setInterval(() => {
        setTalkTimeSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (talkTimerRef.current) clearInterval(talkTimerRef.current);
    }
    return () => {
      if (talkTimerRef.current) clearInterval(talkTimerRef.current);
    };
  }, [isListening]);

  useEffect(() => {
    if (isListening && avatarState !== 'speaking' && avatarState !== 'thinking') {
      setAvatarState('listening');
    } else if (!isListening && avatarState === 'listening') {
      setAvatarState('idle');
    }
  }, [isListening, avatarState]);

  const handleSelectPersona = (key: 'emma' | 'liam' | 'chloe' | 'arthur') => {
    interruptAvatar();
    setActivePersonaKey(key);
    playClick();
    const persona = PERSONAS[key];
    setMessages([
      {
        role: 'assistant',
        content: persona.greeting,
      },
    ]);
    setTimeout(() => {
      speakAvatarResponse(persona.greeting);
    }, 200);
  };

  const getStatusText = () => {
    switch (avatarState) {
      case 'speaking': return 'Speaking...';
      case 'listening': return 'Listening...';
      case 'thinking': return 'Thinking...';
      case 'idle': return 'Ready to talk';
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-100px)] rounded-[32px] overflow-hidden bg-[#fafafa] border border-gray-200/60 shadow-2xl flex flex-col md:flex-row">
      
      {/* 3D Background Canvas & Avatar */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40">
        <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px]">
          <Avatar3DCanvas
            personaKey={activePersonaKey}
            isSpeaking={avatarState === 'speaking'}
            isListening={isListening || avatarState === 'listening'}
            audioLevel={volumeLevel}
            onCanvasClick={() => {
              if (avatarState === 'speaking') interruptAvatar();
            }}
          />
        </div>
      </div>

      {/* Main UI Overlay */}
      <div className="relative z-10 flex-1 flex flex-col pointer-events-none p-6">
        
        {/* Top Bar */}
        <header className="flex items-start justify-between pointer-events-auto">
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-1.5 rounded-2xl shadow-sm flex items-center gap-1">
            {(Object.keys(PERSONAS) as Array<'emma' | 'liam' | 'chloe' | 'arthur'>).map((key) => {
              const isSelected = activePersonaKey === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectPersona(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-white shadow-sm text-gray-900 scale-100'
                      : 'text-gray-500 hover:text-gray-900 scale-95 hover:scale-100'
                  }`}
                >
                  {PERSONAS[key].name}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <div className="hidden sm:flex bg-white/70 backdrop-blur-xl border border-white/40 px-4 py-2 rounded-2xl shadow-sm items-center gap-4 text-sm font-medium text-gray-600">
              <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-500"/> {Math.floor(talkTimeSeconds / 60)}m {talkTimeSeconds % 60}s</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-500"/> {confidenceScore}% SLA</span>
            </div>
            
            <button 
              onClick={() => setShowTranscript(!showTranscript)}
              className="bg-white/70 backdrop-blur-xl border border-white/40 p-2.5 rounded-2xl shadow-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-end items-center pb-4">
          
          {/* Subtitles Overlay */}
          <AnimatePresence mode="wait">
            {(interimTranscript || avatarState === 'speaking') && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="max-w-2xl text-center mb-10 px-8 py-4 bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-lg pointer-events-auto"
              >
                {interimTranscript ? (
                  <p className="text-xl font-medium text-gray-800">
                    "{interimTranscript}"
                  </p>
                ) : avatarState === 'speaking' ? (
                  <div className="flex flex-col items-center gap-2">
                    <WaveformLive volumeLevel={volumeLevel} isActive={true} />
                    <p className="text-lg text-gray-600 font-medium">{getStatusText()}</p>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Action Dock */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-3 rounded-full shadow-2xl flex items-center gap-4 pointer-events-auto ring-1 ring-black/5">
            <button
              onClick={() => {
                const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
                if (lastAssistant) speakAvatarResponse(lastAssistant.content);
              }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              title="Repeat"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (isListening) stopListening();
                else startListening();
              }}
              className={`w-16 h-16 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${
                isListening 
                  ? 'bg-rose-500 text-white shadow-rose-500/30' 
                  : 'bg-gray-900 text-white shadow-black/20'
              }`}
            >
              {isListening ? <Pause className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>

            <button
              onClick={() => setSpeechSpeed(s => s === 1.0 ? 0.85 : s === 0.85 ? 1.15 : 1.0)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all"
              title="Speed"
            >
              {speechSpeed}x
            </button>
          </div>
        </div>
      </div>

      {/* Side Transcript Drawer */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div 
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-white/90 backdrop-blur-2xl border-l border-gray-200/60 shadow-2xl z-20 flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Conversation</h3>
              <button 
                onClick={() => setShowTranscript(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 text-sm space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[11px] font-medium text-gray-400 mb-1 px-1">
                    {msg.role === 'user' ? 'You' : activePersona.name}
                  </span>
                  <div className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gray-900 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.recast && (
                    <div className="mt-2 max-w-[85%] bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-800">
                      <div className="flex items-center gap-1 font-semibold mb-1">
                        <Sparkles className="w-3.5 h-3.5" /> Grammatical Polish
                      </div>
                      {msg.recast}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem('directText') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handleUserSpeechTurn(input.value.trim());
                    input.value = '';
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  name="directText"
                  placeholder="Type a message..."
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

