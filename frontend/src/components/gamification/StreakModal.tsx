'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Shield, Check, X } from 'lucide-react';
import { useAudioEffects } from '@/hooks/useAudioEffects';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  freezeCount: number;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  streakCount,
  freezeCount,
}) => {
  const { playClick } = useAudioEffects();

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm p-6 rounded-3xl bg-white border border-gray-200-card border border-gamify-streak/40 shadow-2xl text-center relative overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Flame Disc */}
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-gamify-streak to-amber-400 flex items-center justify-center shadow-lg shadow-gamify-streak/40 mb-4 animate-bounce-slight">
              <Flame className="w-10 h-10 text-white fill-white" />
            </div>

            <h3 className="text-2xl font-black text-white">{streakCount} Day Streak!</h3>
            <p className="text-xs text-gray-700 mt-1">
              You are building unbreakable language retention habits.
            </p>

            {/* 7-Day Week Dots */}
            <div className="flex justify-center gap-2 my-5">
              {daysOfWeek.map((day, idx) => {
                const isActive = idx < (streakCount % 7 || 7);
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gamify-streak text-white shadow-md shadow-gamify-streak/30'
                          : 'bg-white shadow-sm border border-gray-200 text-gray-400 border border-gray-200'
                      }`}
                    >
                      {isActive ? <Check className="w-4 h-4 stroke-[3]" /> : day}
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500">{day}</span>
                  </div>
                );
              })}
            </div>

            {/* Freeze Shield Inventory */}
            <div className="p-3.5 rounded-2xl bg-white shadow-sm border border-gray-200 border border-gray-200 flex items-center justify-between text-left mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gamify-freeze/20 flex items-center justify-center text-gamify-freeze">
                  <Shield className="w-4 h-4 fill-gamify-freeze" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Streak Freeze</span>
                  <span className="text-[11px] text-gray-500">Protects your streak if you miss a day</span>
                </div>
              </div>
              <span className="text-sm font-black text-gamify-freeze">{freezeCount} equipped</span>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-gamify-streak to-amber-500 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-gamify-streak/30 active:scale-95 transition-all"
            >
              Continue Learning
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
