'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Lock, Star, Mic, TrendingUp, Crown, BookOpen, Flame } from 'lucide-react';
import { LessonNode as LessonNodeType } from '@/lib/types';
import { useAudioEffects } from '@/hooks/useAudioEffects';

interface LessonNodeProps {
  node: LessonNodeType;
  index: number;
}

export const LessonNode: React.FC<LessonNodeProps> = ({ node, index }) => {
  const { playClick } = useAudioEffects();

  const isLocked = node.status === 'locked';
  const isMastered = node.status === 'mastered';
  const isCompleted = node.status === 'completed';
  const isUnlocked = node.status === 'unlocked';

  // Offset nodes in snake-like path pattern
  const horizontalOffset = Math.sin(index * 1.1) * 75; // -75px to +75px

  // Select node icon based on type
  const getIcon = () => {
    if (isMastered) return <Crown className="w-8 h-8 text-amber-300 fill-amber-300" />;
    if (isCompleted) return <Check className="w-8 h-8 text-white stroke-[3]" />;
    if (isLocked) return <Lock className="w-6 h-6 text-gray-400" />;

    switch (node.node_type) {
      case 'voice_roleplay':
        return <Mic className="w-7 h-7 text-white" />;
      case 'chart_pitch':
        return <TrendingUp className="w-7 h-7 text-white" />;
      case 'boss_challenge':
        return <Crown className="w-8 h-8 text-amber-400 animate-pulse" />;
      default:
        return <BookOpen className="w-7 h-7 text-white" />;
    }
  };

  // Node styling themes
  const getNodeColor = () => {
    if (isLocked) return 'bg-white shadow-sm border border-gray-200 border-gray-200 text-gray-400 cursor-not-allowed shadow-none';
    if (isMastered) return 'bg-gradient-to-tr from-amber-500 to-yellow-400 border-amber-300 shadow-xl shadow-amber-500/40 text-amber-950';
    if (isCompleted) return 'bg-gradient-to-tr from-accent-emerald to-emerald-400 border-emerald-300 shadow-xl shadow-emerald-500/35 text-white';
    
    // Active unlocked state
    if (node.node_type === 'boss_challenge') {
      return 'bg-gradient-to-tr from-rose-600 to-amber-500 border-rose-300 shadow-xl shadow-rose-600/40 text-white animate-pulse-glow';
    }
    if (node.track === 'economics') {
      return 'bg-gradient-to-tr from-primary-600 to-accent-cyan border-cyan-300 shadow-xl shadow-primary-600/40 text-white animate-pulse-glow';
    }
    return 'bg-gradient-to-tr from-primary-600 to-indigo-500 border-indigo-300 shadow-xl shadow-primary-600/40 text-white animate-pulse-glow';
  };

  const NodeContent = (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      style={{ transform: `translateX(${horizontalOffset}px)` }}
      className="relative flex flex-col items-center my-6 group"
    >
      {/* Active Glowing Ring */}
      {isUnlocked && (
        <span className="absolute -inset-2.5 rounded-full bg-primary-500/25 blur-md animate-pulse" />
      )}

      {/* Interactive Node Disc */}
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-b-8 transition-transform active:translate-y-1 group-hover:scale-105 select-none ${getNodeColor()}`}
      >
        {getIcon()}
      </div>

      {/* Floating XP & Title Tooltip */}
      <div className="mt-2.5 flex flex-col items-center text-center max-w-[160px]">
        <span className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-white transition-colors">
          {node.title}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] font-semibold text-gamify-xp">+{node.xp_reward} XP</span>
          {node.track === 'economics' && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              ESP
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (isLocked) {
    return <div className="pointer-events-none opacity-60">{NodeContent}</div>;
  }

  return (
    <Link href={`/lesson/${node.id}`} onClick={playClick}>
      {NodeContent}
    </Link>
  );
};
