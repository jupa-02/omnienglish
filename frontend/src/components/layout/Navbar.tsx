'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Flame,
  Shield,
  Zap,
  Award,
  BookOpen,
  Mic,
  TrendingUp,
  RotateCcw,
  Trophy,
  Bot,
  Sparkles,
} from 'lucide-react';
import { ApiClient, OllamaStatus } from '@/lib/api';

interface NavbarProps {
  streakCount?: number;
  xpPoints?: number;
  freezeCount?: number;
  cefrLevel?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  streakCount = 5,
  xpPoints = 420,
  freezeCount = 2,
  cefrLevel = 'B1',
}) => {
  const pathname = usePathname();
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);

  useEffect(() => {
    async function checkOllama() {
      try {
        const res = await ApiClient.getLocalAIModels();
        setOllamaStatus(res);
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

  const navItems = [
    { href: '/chat', label: 'AI Partner', icon: Bot, highlight: true },
    { href: '/learn', label: 'Skill Tree', icon: BookOpen },
    { href: '/certification', label: 'TOEFL / IELTS', icon: Award, certBadge: true },
    { href: '/economics-studio', label: 'Economics ESP', icon: TrendingUp },
    { href: '/voice-arena', label: 'Phonetics', icon: Mic },
    { href: '/corpus-evidence', label: 'SLA Datasets', icon: Sparkles },
    { href: '/review-fsrs', label: 'FSRS Cards', icon: RotateCcw },
    { href: '/leaderboard', label: 'Leagues', icon: Trophy },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gray-50/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              OmniEnglish
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Frontier
              </span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-white border border-indigo-500/30 font-semibold shadow-sm'
                    : item.highlight
                    ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : ''}`} />
                <span>{item.label}</span>
                {item.certBadge && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Cert
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Stats & Ollama Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Local Ollama Indicator */}
          <Link
            href="/chat"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 hover:border-zinc-700 transition-all"
            title="Local AI Engine via Ollama"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-500">LLM:</span>
            <span className="font-mono text-emerald-400 font-medium">
              {ollamaStatus?.default_model || 'gemma:2b'}
            </span>
          </Link>

          {/* Streak Flame */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-orange-400 font-bold font-mono">
            <Flame className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
            <span>{streakCount}d</span>
          </div>

          {/* XP Points */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-amber-400 font-bold font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{xpPoints} XP</span>
          </div>

          {/* CEFR Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-800/60 text-[11px] text-indigo-300 font-bold font-mono">
            <span>{cefrLevel}</span>
          </div>

        </div>

      </div>
    </nav>
  );
};
