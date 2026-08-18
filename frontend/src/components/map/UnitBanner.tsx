'use client';

import React from 'react';
import Link from 'next/link';
import { Book, Sparkles } from 'lucide-react';
import { useAudioEffects } from '@/hooks/useAudioEffects';

interface UnitBannerProps {
  title: string;
  description?: string;
  unitNumber: number;
  cefrLevel: string;
}

export const UnitBanner: React.FC<UnitBannerProps> = ({
  title,
  description = '',
  unitNumber,
  cefrLevel,
}) => {
  const { playClick } = useAudioEffects();

  return (
    <div className="w-full rounded-2xl bg-indigo-600 p-6 text-white flex items-center justify-between shadow-sm relative overflow-hidden">
      <div className="space-y-2 z-10 max-w-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider bg-indigo-700/50 px-2.5 py-1 rounded-md">
            SECCIÓN {unitNumber} • CEFR {cefrLevel}
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-indigo-100 font-normal leading-relaxed">
          {description}
        </p>
      </div>

      <Link
        href="/learn"
        onClick={playClick}
        className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 font-semibold text-sm shadow-sm transition-all active:scale-95 z-10 shrink-0"
      >
        <Book className="w-4 h-4" />
        <span>Ver Guía</span>
      </Link>
    </div>
  );
};
