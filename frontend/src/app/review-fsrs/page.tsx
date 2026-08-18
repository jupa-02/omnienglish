'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Volume2,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { FSRSCard } from '@/lib/types';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { RewardSplash } from '@/components/gamification/RewardSplash';
import { PageWrapper } from '@/components/layout/PageWrapper';

function FSRSReviewContent() {
  const { playSuccess, playClick, playLevelUp, speakText } = useAudioEffects();
  const [cards, setCards] = useState<FSRSCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    async function loadCards() {
      try {
        const data = await ApiClient.getDueCards();
        setCards(data);
      } catch {
        const fallbackCards: FSRSCard[] = [
          {
            id: 'card_1',
            vocab_id: 'v_1',
            vocabulary: {
              id: 'v_1',
              lemma: 'depend on',
              part_of_speech: 'phrasal verb',
              cefr_level: 'A2',
              category: 'general',
              definition_en: 'To be determined or conditioned by something else.',
              definition_es: 'Depender de algo o alguien (¡siempre con ON, nunca of!).',
              collocations: ['depend on the outcome', 'depends heavily on data'],
              example_sentence: 'The economic forecast depends on global supply chain resilience.',
            },
            stability: 2.5,
            difficulty: 4.8,
            elapsed_days: 1,
            scheduled_days: 2,
            reps: 1,
            state: 1,
            due_date: new Date().toISOString(),
          },
          {
            id: 'card_2',
            vocab_id: 'v_2',
            vocabulary: {
              id: 'v_2',
              lemma: 'skyrocket',
              part_of_speech: 'verb',
              cefr_level: 'B2',
              category: 'macro',
              definition_en: 'To increase or rise very rapidly and to a high level.',
              definition_es: 'Dispararse, subir de forma abrupta.',
              collocations: ['prices skyrocketed', 'inflation skyrocketed to a 40-year peak'],
              example_sentence: 'Headline inflation skyrocketed before aggressive rate hikes were implemented.',
            },
            stability: 3.8,
            difficulty: 3.5,
            elapsed_days: 3,
            scheduled_days: 4,
            reps: 2,
            state: 2,
            due_date: new Date().toISOString(),
          },
        ];
        
        setCards(fallbackCards);
      }
    }
    loadCards();
  }, []);

  const currentCard = cards[currentIndex];

  const handleRating = async (rating: number) => {
    playClick();
    if (!currentCard) return;

    try {
      await ApiClient.submitFSRSReview(currentCard.id, rating);
    } catch {}

    playSuccess();
    setReviewedCount((prev) => prev + 1);
    setIsFlipped(false);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      setShowReward(true);
      playLevelUp();
    }
  };

  if (!currentCard || cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">¡Al día!</h2>
        <p className="text-sm text-gray-500">
          No hay tarjetas de repaso pendientes por ahora. Vuelve más tarde o continúa tu aprendizaje en el mapa.
        </p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-5"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Award className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900">¡Sesión de Repaso Completada!</h2>
          <p className="text-sm text-gray-500">
            Repasaste exitosamente {reviewedCount} tarjetas usando el algoritmo FSRS.
          </p>

          <div className="flex justify-center gap-4 py-4">
            <div className="p-4 rounded-2xl bg-gray-50 shadow-sm border border-gray-100 min-w-[120px]">
              <span className="text-xs text-gray-500 block font-semibold">XP Ganada</span>
              <span className="text-2xl font-black text-amber-500">+{reviewedCount * 5} XP</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 shadow-sm border border-gray-100 min-w-[120px]">
              <span className="text-xs text-gray-500 block font-semibold">Retención Target</span>
              <span className="text-2xl font-black text-indigo-600">90%</span>
            </div>
          </div>

          <a
            href="/learn"
            className="inline-block w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
          >
            Continuar Aprendiendo
          </a>
        </motion.div>

        <RewardSplash show={showReward} xpAmount={reviewedCount * 5} title="Memory Deck Review Complete!" />
      </div>
    );
  }

  const vocab = currentCard.vocabulary;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin-slow" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Repaso FSRS
          </span>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-600">
          Tarjeta {currentIndex + 1} de {cards.length}
        </span>
      </div>

      {/* 3D Flashcard */}
      <div
        onClick={() => {
          playClick();
          setIsFlipped(!isFlipped);
        }}
        className="min-h-[380px] p-6 sm:p-10 rounded-[2rem] bg-white border border-gray-200 hover:border-gray-300 shadow-sm cursor-pointer select-none transition-all flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 uppercase">
            {vocab.category} • {vocab.cefr_level}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              speakText(vocab.lemma);
            }}
            className="p-2 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors"
            title="Pronounce Lemma"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Card Center Content */}
        <div className="text-center space-y-3 my-auto py-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            {vocab.lemma}
          </h2>
          {vocab.part_of_speech && (
            <span className="text-sm text-gray-500 italic block">
              ({vocab.part_of_speech})
            </span>
          )}

          {/* Flipped Reveal Content */}
          <AnimatePresence>
            {isFlipped ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 pt-6 mt-4 border-t border-gray-100 text-left"
              >
                <div>
                  <span className="text-[11px] font-bold text-gray-400 block uppercase">Definition (EN):</span>
                  <p className="text-sm text-gray-800 font-medium">{vocab.definition_en}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <span className="text-[11px] font-bold text-amber-600 block uppercase">Contexto & Tip (ES):</span>
                  <p className="text-sm text-amber-900 mt-1">💡 {vocab.definition_es}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-400 block uppercase">Example Sentence:</span>
                  <p className="text-base text-gray-700 font-serif italic mt-1 border-l-2 border-indigo-200 pl-3">
                    &quot;{vocab.example_sentence}&quot;
                  </p>
                </div>
              </motion.div>
            ) : (
              <p className="text-sm text-gray-400 pt-8">
                Toca la tarjeta para revelar la definición y ejemplos
              </p>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center">
          <span className="text-[10px] font-medium text-gray-400">
            FSRS Stability: {currentCard.stability.toFixed(1)}d • Difficulty: {currentCard.difficulty.toFixed(1)}
          </span>
        </div>
      </div>

      {/* FSRS Rating Buttons */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-2 sm:gap-3 pt-2">
          <button
            onClick={() => handleRating(1)}
            className="py-3 rounded-2xl bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-rose-600 font-bold text-sm flex flex-col items-center gap-0.5 active:scale-95 transition-all shadow-sm"
          >
            <span>Olvidé</span>
            <span className="text-[10px] text-gray-400 font-normal">&lt;1 día</span>
          </button>
          <button
            onClick={() => handleRating(2)}
            className="py-3 rounded-2xl bg-white border border-amber-200 hover:bg-amber-50 hover:border-amber-300 text-amber-600 font-bold text-sm flex flex-col items-center gap-0.5 active:scale-95 transition-all shadow-sm"
          >
            <span>Difícil</span>
            <span className="text-[10px] text-gray-400 font-normal">2 días</span>
          </button>
          <button
            onClick={() => handleRating(3)}
            className="py-3 rounded-2xl bg-white border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-600 font-bold text-sm flex flex-col items-center gap-0.5 active:scale-95 transition-all shadow-sm"
          >
            <span>Bien</span>
            <span className="text-[10px] text-gray-400 font-normal">4 días</span>
          </button>
          <button
            onClick={() => handleRating(4)}
            className="py-3 rounded-2xl bg-white border border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-600 font-bold text-sm flex flex-col items-center gap-0.5 active:scale-95 transition-all shadow-sm"
          >
            <span>Fácil</span>
            <span className="text-[10px] text-gray-400 font-normal">7 días</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsFlipped(true)}
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
        >
          Mostrar Respuesta
        </button>
      )}
    </div>
  );
}

export default function FSRSReviewPage() {
  return (
    <PageWrapper maxWidth="max-w-3xl">
      <FSRSReviewContent />
    </PageWrapper>
  );
}
