'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Cpu,
  Sparkles,
  Bot,
  User as UserIcon,
  RefreshCw,
  Award,
  BookOpen,
  TrendingUp,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { ApiClient, OllamaStatus, ChatTurnResponse } from '@/lib/api';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { PedagogicalFeedbackCard } from '@/components/chat/PedagogicalFeedbackCard';
import { AvatarCanvas } from '@/components/voice/AvatarCanvas';
import { Menu } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  feedback?: {
    analysis?: string;
  };
}

const PERSONAS = [
  {
    id: 'tutor',
    name: 'SLA English Tutor',
    desc: 'Supportive coach with real-time Spanish L1 corrections',
    icon: Sparkles,
    badge: 'CEFR Coach',
  },
  {
    id: 'examiner',
    name: 'TOEFL/IELTS Examiner',
    desc: 'Formal academic questions & structured prompts',
    icon: Award,
    badge: 'Exam Prep',
  },
  {
    id: 'friend',
    name: 'Casual Native Friend',
    desc: 'Everyday idioms, natural rhythm & coffee shop chats',
    icon: MessageSquare,
    badge: 'Fluency',
  },
  {
    id: 'economist',
    name: 'Senior Economist',
    desc: 'Quantitative debates, policy trade-offs & data pitching',
    icon: TrendingUp,
    badge: 'ESP Lab',
  },
];

const SUGGESTED_STARTERS = [
  "What are the best strategies to master English grammar as a Spanish speaker?",
  "Let's simulate a TOEFL Speaking Task 1 question on university education.",
  "How would you explain the difference between 'policy' and 'politics' in economics?",
  "Can we practice a job interview in English for a quantitative analyst role?"
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I am your AI Conversational Partner powered by your local Ollama engine. How would you like to practice today? You can speak using the microphone or type below.",
      timestamp: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [activePersona, setActivePersona] = useState('tutor');
  const [activeModel, setActiveModel] = useState('gemma:2b');
  const [targetCefr, setTargetCefr] = useState('B1');
  const [latestFeedback, setLatestFeedback] = useState<any>(null);
  const [lastUserText, setLastUserText] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { playClick, playSuccess, speakText } = useAudioEffects();
  const { isListening, transcript, startListening, stopListening, hasSupport } =
    useSpeechRecognition();

  // Load local Ollama model status on mount
  useEffect(() => {
    async function checkOllama() {
      try {
        const status = await ApiClient.getLocalAIModels();
        setOllamaStatus(status);
        if (status.default_model) {
          setActiveModel(status.default_model);
        }
      } catch {
        setOllamaStatus({
          status: 'offline',
          default_model: 'gemma:2b',
          models: [],
          provider: 'Ollama',
        });
      }
    }
    checkOllama();
  }, []);

  // Update input if microphone transcribed text
  useEffect(() => {
    if (transcript) {
      setInputVal(transcript);
    }
  }, [transcript]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || loading) return;

    playClick();
    if (isListening) stopListening();

    setLastUserText(text);
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      // Prepare conversation history
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res: ChatTurnResponse = await ApiClient.sendAIChat(
        history,
        activePersona,
        targetCefr,
        activeModel
      );

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedback: res.feedback,
      };

      setMessages((prev) => [...prev, aiMsg]);
      playSuccess();

      if (res.feedback) {
        setLatestFeedback(res.feedback);
      }

      // Read response aloud automatically using Web Speech Synthesis
      speakText(res.reply);
    } catch {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content:
          "I'm here and ready to help! Please check that your local Ollama server is running (ollama serve), or feel free to type your next sentence.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Removed local speakText to use global hook directly

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar className="hidden md:flex" />
        <div className="flex-1 flex flex-col min-w-0 text-gray-900 overflow-x-hidden">
          {/* Top Status Header */}
          <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  playClick();
                  setIsMobileMenuOpen(true);
                }}
                className="md:hidden p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors active:scale-95"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-semibold tracking-tight text-gray-900 flex items-center gap-2">
                  Conversational AI Partner
                  <span className="hidden sm:flex text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 font-mono items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Nemotron
                  </span>
                </h1>
                <p className="hidden sm:block text-xs text-gray-500">
                  Real-time conversational immersion powered by advanced Low-Latency VoiceChat
                </p>
              </div>
            </div>

        {/* Simplified Friendly Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tutor en línea</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs">
            <span className="text-gray-500">Tu Meta:</span>
            <select
              value={targetCefr}
              onChange={(e) => setTargetCefr(e.target.value)}
              className="bg-transparent text-indigo-400 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="A2" className="bg-white">A2 (Básico)</option>
              <option value="B1" className="bg-white">B1 (Intermedio)</option>
              <option value="B2" className="bg-white">B2 (Avanzado)</option>
              <option value="C1" className="bg-white">C1 (Fluidez)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pb-24 lg:pb-6">
        
        {/* Left Column: Chat Area */}
        <div className="lg:col-span-8 flex flex-col h-[60vh] lg:h-[75vh] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Persona Selector Bar */}
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2 overflow-x-auto">
            {PERSONAS.map((p) => {
              const Icon = p.icon;
              const isSelected = activePersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePersona(p.id);
                    playClick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white text-gray-500 hover:text-gray-800 border border-gray-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                      : 'bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  
                  <div className="mt-2 flex items-center justify-between gap-4 text-[11px] text-gray-500">
                    <span suppressHydrationWarning>{msg.timestamp}</span>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakText(msg.content)}
                        className="p-1 hover:text-indigo-300 transition-colors flex items-center gap-1"
                        title="Listen pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Listen</span>
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4 text-gray-700" />
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-gray-500 text-xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                </div>
                <span className="italic">{activeModel} is formulating response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Conversation Starters */}
          {messages.length <= 2 && (
            <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-2">
              {SUGGESTED_STARTERS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(s)}
                  className="text-xs bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl transition-all text-left flex items-center gap-1.5 hover:border-gray-300"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input & Voice Controls */}
          <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              {hasSupport && (
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    if (isListening) stopListening();
                    else startListening();
                  }}
                  className={`p-3 rounded-xl transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40'
                      : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
                  }`}
                  title={isListening ? 'Stop recording' : 'Speak to practice pronunciation'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}

              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  isListening
                    ? 'Listening to your voice...'
                    : 'Type a message or sentence in English...'
                }
                className="flex-1 bg-white border border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
              />

              <button
                type="submit"
                disabled={!inputVal.trim() || loading}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Real-Time Pedagogical Feedback & Spanish L1 Tips */}
        <div className="lg:col-span-4 flex flex-col gap-4 lg:overflow-y-auto lg:max-h-[calc(100vh-140px)]">
          
          {/* 3D Avatar Canvas */}
          <div className="w-full aspect-[4/3] relative rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <AvatarCanvas
              isListening={isListening}
              isSpeaking={loading} // Simple proxy for speaking for now
              volumeLevel={0.5} // Would ideally connect to audio analyzer
            />
          </div>

          {/* Pedagogical Breakdown Card with clean parsed UI */}
          <PedagogicalFeedbackCard
            rawFeedback={latestFeedback}
            lastUserMessage={lastUserText}
            onApplyCorrection={(corrected) => setInputVal(corrected)}
          />

          {/* Key SLA Cognitive Traps Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xl">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Key Spanish L1 Traps
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-rose-400">❌ Is important</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-emerald-400">✅ It is important</span>
                </div>
                <p className="text-[10px] text-gray-500">Never omit subject pronouns in English.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-rose-400">❌ Depends of</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-emerald-400">✅ Depends on</span>
                </div>
                <p className="text-[10px] text-gray-500">Obligatory prepositional regime in English.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-rose-400">❌ The inflation</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-emerald-400">✅ Inflation</span>
                </div>
                <p className="text-[10px] text-gray-500">No article with generic macroscopic nouns.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
    
    <MobileMenu 
      isOpen={isMobileMenuOpen} 
      onClose={() => setIsMobileMenuOpen(false)} 
    />
    </>
  );
}
