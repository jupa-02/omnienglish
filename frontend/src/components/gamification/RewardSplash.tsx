'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Zap, Sparkles } from 'lucide-react';

interface RewardSplashProps {
  show: boolean;
  xpAmount: number;
  title?: string;
  subtitle?: string;
}

export const RewardSplash: React.FC<RewardSplashProps> = ({
  show,
  xpAmount,
  title = 'Lesson Completed!',
  subtitle = 'Great progress on your language frontier.',
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className="fixed bottom-8 right-8 z-50 p-4 rounded-2xl bg-white border border-gray-200-card border border-gamify-xp/50 shadow-2xl shadow-gamify-xp/20 flex items-center gap-4 backdrop-blur-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-gamify-xp/20 border border-gamify-xp/40 flex items-center justify-center text-gamify-xp">
            <Zap className="w-6 h-6 fill-gamify-xp animate-bounce-slight" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-white block">{title}</span>
            <span className="text-xs text-gray-700">{subtitle}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-gamify-xp text-white font-black text-sm shadow-md">
            +{xpAmount} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
