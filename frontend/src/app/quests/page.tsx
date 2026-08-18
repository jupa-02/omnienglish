'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Target, Zap, ShieldCheck, Flame, BookOpen, Diamond, Award } from 'lucide-react';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { motion } from 'framer-motion';

const QUESTS_DATA = [
  {
    id: 'q1',
    title: 'Gana 50 XP hoy',
    desc: 'Completa lecciones, ejercicios de fonética o simulacros.',
    progress: 35,
    total: 50,
    rewardGems: 10,
    icon: Zap,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500',
    iconBg: 'bg-amber-100',
  },
  {
    id: 'q2',
    title: 'Completa 2 lecciones en el Árbol',
    desc: 'Avanza en los nodos de gramática o economía.',
    progress: 1,
    total: 2,
    rewardGems: 15,
    icon: BookOpen,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500',
    iconBg: 'bg-emerald-100',
  },
  {
    id: 'q3',
    title: 'Mantén una racha de 7 días',
    desc: 'Practica al menos 5 minutos cada día.',
    progress: 7,
    total: 7,
    rewardGems: 25,
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    iconBg: 'bg-orange-100',
    completed: true,
  },
  {
    id: 'q4',
    title: 'Practica 1 diálogo con el AI Partner',
    desc: 'Conéctate para una inmersión completa.',
    progress: 1,
    total: 1,
    rewardGems: 20,
    icon: Award,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500',
    iconBg: 'bg-indigo-100',
    completed: true,
  },
];

export default function QuestsPage() {
  const { playClick } = useAudioEffects();

  return (
    <PageWrapper maxWidth="max-w-xl">
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Misiones y Desafíos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gana gemas diarias completando objetivos de aprendizaje
            </p>
          </div>
        </div>

        {/* Quests List */}
        <div className="space-y-4">
          {QUESTS_DATA.map((q, idx) => {
            const Icon = q.icon;
            const percentage = Math.min(100, Math.round((q.progress / q.total) * 100));
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                key={q.id}
                className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${q.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${q.color}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        {q.title}
                        {q.completed && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                            COMPLETADO
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">{q.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-semibold text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 shrink-0">
                    <Diamond className="w-4 h-4 fill-current" />
                    <span>+{q.rewardGems}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                    <span>Progreso</span>
                    <span>{q.progress} / {q.total}</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + idx * 0.1 }}
                      className={`h-full ${q.bgColor} rounded-full`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
