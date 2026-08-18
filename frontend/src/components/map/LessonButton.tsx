'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crown, Check, Star, Lock, Play, Sparkles } from 'lucide-react';
import { useAudioEffects } from '@/hooks/useAudioEffects';

interface LessonButtonProps {
  id: string;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  percentage?: number;
  title: string;
  xpReward?: number;
  nodeType?: string;
}

export const LessonButton: React.FC<LessonButtonProps> = ({
  id,
  index,
  totalCount,
  locked = false,
  current = false,
  percentage = 0,
  title,
  xpReward = 20,
  nodeType = 'standard_drill',
}) => {
  const router = useRouter();
  const { playClick } = useAudioEffects();

  // Sinuous horizontal offset calculation (Duolingo style)
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;
  let indentationLevel = 0;

  if (cycleIndex <= 2) {
    indentationLevel = cycleIndex;
  } else if (cycleIndex <= 4) {
    indentationLevel = 4 - cycleIndex;
  } else if (cycleIndex <= 6) {
    indentationLevel = 4 - cycleIndex;
  } else {
    indentationLevel = cycleIndex - 8;
  }

  const rightPosition = indentationLevel * 45;

  const isFirst = index === 0;
  const isLast = index === totalCount - 1;
  const isCompleted = !current && !locked;

  const Icon = isCompleted ? Check : isLast ? Crown : current ? Star : Lock;

  return (
    <div
      className="relative flex flex-col items-center justify-center my-8"
      style={{
        transform: `translateX(${rightPosition}px)`,
      }}
    >
      {/* Animated Bouncing Speech Bubble for Current Active Node */}
      {current && (
        <div 
          onClick={() => {
            playClick();
            router.push(`/lesson/${id}`);
          }}
          className="absolute -top-12 z-20 flex flex-col items-center pointer-events-auto cursor-pointer"
        >
          <div className="px-3.5 py-1.5 rounded-lg bg-white text-indigo-600 font-semibold text-xs tracking-wide shadow-sm border border-gray-200 flex items-center gap-1.5 whitespace-nowrap hover:bg-gray-50 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Continuar</span>
          </div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white -mt-0.5" />
        </div>
      )}

      {/* Button & Circular Progress Container */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        
        {/* Circular Progress Ring for Current Node */}
        {current && (
          <div className="absolute inset-0 -m-1">
            <svg className="w-22 h-22 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="6"
                className="text-gray-800 fill-none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * Math.max(percentage, 25)) / 100}
                strokeLinecap="round"
                className="text-indigo-500 fill-none transition-all duration-700"
              />
            </svg>
          </div>
        )}

        {/* 3D Tactile Lesson Button */}
        {locked ? (
          <div
            className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm cursor-not-allowed"
            title={`${title} (Bloqueado)`}
          >
            <Lock className="w-6 h-6 text-gray-400" />
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playClick();
              router.push(`/lesson/${id}`);
            }}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-sm group border ${
              isCompleted
                ? 'bg-amber-400 border-amber-500 hover:bg-amber-500'
                : 'bg-indigo-600 border-indigo-700 hover:bg-indigo-700'
            }`}
            title={`${title} (+${xpReward} XP)`}
          >
            <Icon
              className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                isCompleted
                  ? 'text-amber-900 fill-amber-900 stroke-[2.5]'
                  : 'text-white fill-white'
              }`}
            />
          </motion.button>
        )}
      </div>

      {/* Node Subtitle Tag */}
      <span className="text-[11px] font-medium text-gray-500 mt-2 max-w-[120px] text-center truncate">
        {title}
      </span>
    </div>
  );
};
