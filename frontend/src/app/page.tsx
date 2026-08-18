'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Flame,
  Zap,
  TrendingUp,
  Mic,
  BookOpen,
  RefreshCw,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Award,
  Bot,
  Volume2,
  PenTool,
  Headphones,
  CheckCircle2,
  Smile,
  Briefcase,
  Activity,
  Swords,
  Layers,
  Globe,
  Heart
} from 'lucide-react';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function HomePage() {
  const { playClick } = useAudioEffects();

  const frontierMethodologies = [
    {
      title: 'The Speak Method™',
      appRef: 'Inspirado en Speak',
      subtitle: 'Micro-Repetición Oral de Alta Frecuencia',
      desc: 'Acumula más de 1.000 palabras habladas por lección con 30-50 variaciones rápidas para automatizar tu habla sin traducir mentalmente.',
      href: '/speak-gym',
      icon: Zap,
      badge: 'Speak Flow',
      action: 'Iniciar Gym de Repetición'
    },
    {
      title: 'Praktika Avatar Immersion™',
      appRef: 'Inspirado en Praktika',
      subtitle: 'Avatares Interactivos & Filtro Afectivo',
      desc: 'Avatares animados con sincronización labial y acentos nativos (Británico, Americano, Australiano) que adaptan su velocidad para que pierdas el miedo a hablar.',
      href: '/avatar-immersion',
      icon: Smile,
      badge: 'Interactive 3D',
      action: 'Conversar con Emma'
    },
    {
      title: 'Loora Executive C1/C2™',
      appRef: 'Inspirado en Loora',
      subtitle: 'Diálogo Ejecutivo & Cirugía Sintáctica',
      desc: 'Conversación técnica libre sin guión con upgrades léxicos instantáneos que transforman tus frases en inglés ejecutivo de nivel C1/C2.',
      href: '/executive-studio',
      icon: Briefcase,
      badge: 'C1/C2 Upgrades',
      action: 'Entrar al Estudio Ejecutivo'
    },
    {
      title: 'ELSA Acoustic Precision™',
      appRef: 'Inspirado en ELSA Speak',
      subtitle: 'Guía Articulataria & Pares Mínimos',
      desc: 'Visualización de la anatomía vocal (lengua, labios, cuerdas) con corrección de interferencias del español (/iː/ vs /ɪ/, /b/ vs /v/, clusters /s/).',
      href: '/phoneme-lab',
      icon: Activity,
      badge: 'IPA Spectrogram',
      action: 'Entrenar Articulación'
    },
    {
      title: 'Talkpal TBLT Arena™',
      appRef: 'Inspirado en Talkpal',
      subtitle: 'Debates Cronometrados & Roleplays',
      desc: 'Enfrenta debates con la IA, describe gráficos y fotos en 60 segundos, y simula negociaciones de alto riesgo y entrevistas de trabajo.',
      href: '/roleplay-arena',
      icon: Swords,
      badge: 'Debate & Roleplay',
      action: 'Entrar a la Arena de Debate'
    }
  ];

  const coreModules = [
    {
      title: 'Ruta de Aprendizaje Gamificada',
      subtitle: 'Currículo Completo A1 – C1',
      desc: 'Progresión estructurada con gramática contrastiva, lecturas y audios profundos.',
      href: '/learn',
      icon: BookOpen,
      badge: '5 Unidades',
      action: 'Continuar Lección',
    },
    {
      title: 'Certificación TOEFL / IELTS',
      subtitle: 'Simulador Oficial Estandarizado',
      desc: 'Mide tus 4 habilidades con rúbricas internacionales y reporte de banda certificado.',
      href: '/certification',
      icon: Award,
      badge: 'Oficial Standard',
      action: 'Hacer Test',
    },
    {
      title: 'Economics & ESP Studio',
      subtitle: 'Investigación & Finanzas',
      desc: 'Pitching de gráficos macroeconómicos, simulación de la Reserva Federal y redacción académica.',
      href: '/economics-studio',
      icon: TrendingUp,
      badge: 'Econometría & ESP',
      action: 'Explorar Laboratorio',
    },
    {
      title: 'Repaso Espaciado FSRS',
      subtitle: 'Algoritmo de Retención Máxima',
      desc: 'Tarjetas inteligentes calculadas con la fórmula de estabilidad y dificultad cognitiva.',
      href: '/review-fsrs',
      icon: RefreshCw,
      badge: 'FSRS v4.5',
      action: 'Repasar Tarjetas',
    },
  ];

  return (
    <PageWrapper maxWidth="max-w-5xl">
      <div className="space-y-16 pb-20">
        {/* Main Hero Header */}
        <div className="relative py-16 px-6 sm:px-12 rounded-[2rem] bg-gray-50 border border-gray-100 overflow-hidden shadow-sm">
          <div className="relative z-10 max-w-3xl space-y-6 mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>OmniEnglish: Superando las Mejores Plataformas</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              La Suite de Inglés Definitiva:{' '}
              <span className="text-indigo-600">
                Speak, Praktika, Loora, ELSA y Talkpal
              </span>{' '}
              Unificadas
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Hemos integrado y mejorado las metodologías líderes del mercado global: acumulación de tiempo de habla, avatares interactivos, diálogos ejecutivos y precisión articulatoria.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/speak-gym"
                onClick={playClick}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm active:scale-[0.98] transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Iniciar Entrenamiento</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/avatar-immersion"
                onClick={playClick}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm shadow-sm active:scale-[0.98] transition-all"
              >
                <Smile className="w-4 h-4" />
                <span>Explorar Avatares</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Frontier Methodologies Showcase Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 font-mono">
                The Frontier AI Suite
              </span>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
                5 Metodologías de Vanguardia
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frontierMethodologies.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 rounded-[1.5rem] bg-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 flex flex-col justify-between transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-200">
                        {item.badge}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-gray-400 block">{item.appRef}</span>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mt-0.5">
                        {item.title}
                      </h3>
                      <span className="text-xs font-medium text-indigo-600 block mt-1">
                        {item.subtitle}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 font-normal leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-gray-100">
                    <Link
                      href={item.href}
                      onClick={playClick}
                      className="flex items-center justify-between group-hover:text-indigo-600 text-gray-700 text-sm font-semibold transition-colors"
                    >
                      <span>{item.action}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Secondary Core Hubs (Learn, TOEFL, Economics, FSRS) */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Rutas Académicas & Certificación Oficial
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreModules.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.title}
                  href={m.href}
                  onClick={playClick}
                  className="p-5 rounded-[1.25rem] bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-indigo-600 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 font-medium">{m.badge}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{m.title}</h4>
                      <p className="text-xs text-gray-500 font-normal leading-relaxed mt-1">{m.desc}</p>
                    </div>
                  </div>

                  <div className="pt-2 text-xs font-semibold text-indigo-600 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                    <span>{m.action}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
