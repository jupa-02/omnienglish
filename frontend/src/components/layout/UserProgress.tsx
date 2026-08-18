'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, Heart, Zap, Diamond, Infinity as InfinityIcon, Menu } from 'lucide-react';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { MobileMenu } from '@/components/layout/MobileMenu';

interface UserProgressProps {
  activeCourse?: {
    title: string;
    imageSrc: string;
  };
  hearts?: number;
  points?: number;
  hasActiveSubscription?: boolean;
}

export const UserProgress: React.FC<UserProgressProps> = ({
  activeCourse = { title: 'English & Economics', imageSrc: '🇺🇸' },
  hearts = 5,
  points = 420,
  hasActiveSubscription = false,
}) => {
  const { playClick } = useAudioEffects();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-x-2 w-full max-w-5xl mx-auto px-4 py-3 sticky top-0 bg-white/95 backdrop-blur-md z-40 border-b border-gray-200">
        
        <div className="flex items-center gap-3">
          {/* Hamburger Menu (Mobile Only) */}
          <button
            onClick={() => {
              playClick();
              setIsMobileMenuOpen(true);
            }}
            className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors active:scale-95"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Active Course / Language Switcher */}
          <Link
            href="/learn"
            onClick={playClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all active:scale-95"
          >
            <span className="text-xl leading-none">{activeCourse.imageSrc}</span>
            <span className="text-xs font-semibold text-gray-700 hidden sm:inline">
              {activeCourse.title}
            </span>
          </Link>
        </div>

        {/* Stats Cluster: Streak, Gems, Hearts */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Streak Flame */}
          <Link
            href="/shop"
            onClick={playClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-100 text-orange-600 font-semibold text-xs transition-all active:scale-95"
            title="Racha Diaria"
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span>7</span>
          </Link>

          {/* Gems / Lingots */}
          <Link
            href="/shop"
            onClick={playClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 font-semibold text-xs transition-all active:scale-95"
            title="Gemas acumuladas"
          >
            <Diamond className="w-4 h-4 text-indigo-500" />
            <span>{points}</span>
          </Link>

          {/* Hearts / Lives */}
          <Link
            href="/shop"
            onClick={playClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 font-semibold text-xs transition-all active:scale-95"
            title="Vidas restantes"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>{hasActiveSubscription ? <InfinityIcon className="w-4 h-4" /> : hearts}</span>
          </Link>

        </div>
      </div>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
};

