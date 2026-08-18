'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Trophy,
  Target,
  ShoppingBag,
  Bot,
  Award,
  TrendingUp,
  Mic,
  Database,
  Sparkles,
  RotateCcw,
  Zap,
  Smile,
  Briefcase,
  Activity,
  Swords,
} from 'lucide-react';
import { useAudioEffects } from '@/hooks/useAudioEffects';

interface SidebarProps {
  className?: string;
}

export const SIDEBAR_ITEMS = [
  { label: 'APRENDER', href: '/learn', icon: BookOpen, color: 'text-emerald-500' },
  { label: 'SPEAK GYM', href: '/speak-gym', icon: Zap, color: 'text-emerald-400', badge: 'Speak' },
  { label: 'AVATAR IMMERSION', href: '/avatar-immersion', icon: Smile, color: 'text-purple-400', badge: 'Praktika' },
  { label: 'EXECUTIVE C1', href: '/executive-studio', icon: Briefcase, color: 'text-cyan-400', badge: 'Loora' },
  { label: 'FONÉTICA LAB', href: '/phoneme-lab', icon: Activity, color: 'text-teal-400', badge: 'ELSA' },
  { label: 'ROLEPLAY & DEBATE', href: '/roleplay-arena', icon: Swords, color: 'text-orange-400', badge: 'Talkpal' },
  { label: 'AI PARTNER', href: '/chat', icon: Bot, color: 'text-indigo-400', badge: 'Ollama' },
  { label: 'CERTIFICACIÓN', href: '/certification', icon: Award, color: 'text-purple-400', badge: 'TOEFL' },
  { label: 'ECONOMICS ESP', href: '/economics-studio', icon: TrendingUp, color: 'text-blue-400' },
  { label: 'REPASO FSRS', href: '/review-fsrs', icon: RotateCcw, color: 'text-orange-400' },
  { label: 'LIGAS', href: '/leaderboard', icon: Trophy, color: 'text-amber-400' },
  { label: 'MISIONES', href: '/quests', icon: Target, color: 'text-rose-400' },
  { label: 'TIENDA', href: '/shop', icon: ShoppingBag, color: 'text-cyan-400' },
  { label: 'CORPUS SLA', href: '/corpus-evidence', icon: Database, color: 'text-emerald-400' },
];

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const pathname = usePathname();
  const { playClick } = useAudioEffects();

  return (
    <aside
      className={`w-64 border-r border-gray-200 bg-white flex flex-col justify-between p-4 h-screen sticky top-0 z-30 shrink-0 ${className}`}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <Link
          href="/learn"
          onClick={playClick}
          className="flex items-center gap-3 px-3 py-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
              Omni<span className="text-indigo-600">English</span>
            </h1>
            <span className="text-[10px] font-semibold text-gray-400 block -mt-1">
              Frontier Pro
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/learn' && pathname.startsWith('/lesson'));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={playClick}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-medium border border-gray-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile summary */}
      <div className="pt-4 border-t border-gray-100 px-3 space-y-1">
        <p className="text-xs font-medium text-gray-500">
          Nivel: <span className="text-indigo-600 font-semibold">B1 Intermediate</span>
        </p>
        <p className="text-[10px] text-gray-400">
          OmniEnglish SLA Engine • v1.0
        </p>
      </div>
    </aside>
  );
};
