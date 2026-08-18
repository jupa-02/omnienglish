'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Heart, Shield, Diamond, Check, Sparkles, ShoppingBag, Gift, Crown, Zap } from 'lucide-react';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { motion } from 'framer-motion';

export default function ShopPage() {
  const [hearts, setHearts] = useState(4);
  const [points, setPoints] = useState(420);
  const [hasShield, setHasShield] = useState(false);
  const { playClick, playSuccess, playLevelUp } = useAudioEffects();

  const handleRefillHearts = () => {
    if (points >= 50 && hearts < 5) {
      playSuccess();
      setPoints((p) => p - 50);
      setHearts(5);
    }
  };

  const handleBuyShield = () => {
    if (points >= 100 && !hasShield) {
      playLevelUp();
      setPoints((p) => p - 100);
      setHasShield(true);
    }
  };

  return (
    <PageWrapper maxWidth="max-w-xl">
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Tienda
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Usa tus gemas para recargar vidas y proteger tu racha
            </p>
          </div>
        </div>

        {/* Current Balance */}
        <div className="flex items-center justify-center gap-6 p-4 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Diamond className="w-5 h-5 text-indigo-500" />
            <span>{points} gemas</span>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Heart className="w-5 h-5 text-rose-500" />
            <span>{hearts}/5 vidas</span>
          </div>
        </div>

        {/* Shop Items */}
        <div className="space-y-4">
          {/* Item 1: Refill Hearts */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 fill-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Recargar Vidas</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Restaura tus vidas al máximo (5/5)
                </p>
              </div>
            </div>

            <button
              disabled={hearts >= 5 || points < 50}
              onClick={handleRefillHearts}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95 transition-all"
            >
              {hearts >= 5 ? (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> LLENO
                </span>
              ) : (
                <>
                  <Diamond className="w-3.5 h-3.5" />
                  <span>50 Gemas</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Item 2: Streak Freeze */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-500 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Protector de Racha</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Mantiene tu racha si no practicas un día
                </p>
              </div>
            </div>

            <button
              disabled={hasShield || points < 100}
              onClick={handleBuyShield}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95 transition-all"
            >
              {hasShield ? (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> ACTIVO
                </span>
              ) : (
                <>
                  <Diamond className="w-3.5 h-3.5" />
                  <span>100 Gemas</span>
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Super OmniEnglish Promo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center mx-auto">
            <Crown className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Super OmniEnglish
            </h2>
            <p className="text-sm text-indigo-100 max-w-sm mx-auto">
              Sin anuncios, vidas ilimitadas, corrección de ensayos con IA y simulacros TOEFL ilimitados.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 text-white font-semibold text-xs border border-white/30">
            <Sparkles className="w-4 h-4" />
            <span>NIVEL PRO ACTIVO</span>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
