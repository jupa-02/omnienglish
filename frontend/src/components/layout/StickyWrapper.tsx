'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, Target, Sparkles, Heart, Zap, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAudioEffects } from '@/hooks/useAudioEffects';

interface StickyWrapperProps {
  children?: React.ReactNode;
}

export const StickyWrapper: React.FC<StickyWrapperProps> = ({ children }) => {
  const { playClick } = useAudioEffects();

  return (
    <div className="hidden lg:block w-80 sticky top-24 z-20 space-y-4 shrink-0 pb-12">
      {/* 1. Super / Pro OmniEnglish Promo Card */}
      <div className="p-5 rounded-2xl bg-indigo-600 border border-indigo-700 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500 text-white flex items-center justify-center shrink-0 border border-indigo-400">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Super OmniEnglish
            </h3>
            <p className="text-xs text-indigo-100 mt-0.5">
              Vidas ilimitadas y feedback fonético
            </p>
          </div>
        </div>

        <div className="w-full py-2.5 px-4 rounded-lg bg-indigo-700/50 border border-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 cursor-default">
          <CheckCircle2 className="w-4 h-4 text-indigo-300" />
          <span>Suscripción Activa</span>
        </div>
      </div>

      {/* 2. Leaderboard / Ligas Card */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Liga Oro (#1)
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Termina en 3 días</p>
            </div>
          </div>
          <Link
            href="/leaderboard"
            onClick={playClick}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Ver tabla
          </Link>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="flex items-center gap-2 text-gray-900 font-medium">
              <span className="text-amber-600 font-semibold">1.</span>
              <span>Sandra Carolina (Tú)</span>
            </span>
            <span className="font-mono text-amber-600 font-medium">420 XP</span>
          </div>
          <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-white text-gray-600">
            <span className="flex items-center gap-2">
              <span className="font-medium text-gray-400">2.</span>
              <span>Elena Rostova</span>
            </span>
            <span className="font-mono text-gray-500">380 XP</span>
          </div>
          <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-white text-gray-600">
            <span className="flex items-center gap-2">
              <span className="font-medium text-gray-400">3.</span>
              <span>Carlos Méndez</span>
            </span>
            <span className="font-mono text-gray-500">310 XP</span>
          </div>
        </div>
      </div>

      {/* 3. Misiones Diarias (Quests) Card */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Misiones Diarias
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Completa y gana gemas</p>
            </div>
          </div>
          <Link
            href="/quests"
            onClick={playClick}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Ver todas
          </Link>
        </div>

        <div className="space-y-4 text-xs pt-1">
          {/* Quest 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-gray-700">
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-gray-400" />
                <span>Gana 50 XP hoy</span>
              </span>
              <span className="font-mono text-gray-500">35 / 50</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '70%' }} />
            </div>
          </div>

          {/* Quest 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-gray-700">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                <span>Completa 2 lecciones</span>
              </span>
              <span className="font-mono text-gray-500">1 / 2</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '50%' }} />
            </div>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
};
