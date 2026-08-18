'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ShieldAlert,
  Sigma,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { InteractiveChartPitch } from '@/components/economics/InteractiveChartPitch';
import { FedPolicySimulator } from '@/components/economics/FedPolicySimulator';
import { EconometricsStorytelling } from '@/components/economics/EconometricsStorytelling';
import { AcademicWritingCopilot } from '@/components/economics/AcademicWritingCopilot';
import { ChartPitchScenario } from '@/lib/types';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function EconomicsStudioPage() {
  const { playClick } = useAudioEffects();
  const [activeTab, setActiveTab] = useState<'charts' | 'fed' | 'econometrics' | 'writing'>('charts');

  const defaultChartScenario: ChartPitchScenario = {
    id: 'cpi_inflation_shock',
    title: 'US CPI Headline Inflation & Supply Chain Disruption (2021-2024)',
    indicator_type: 'inflation_cpi',
    context_en:
      'Present the trajectory of US headline CPI inflation as it surged to 9.1% before decelerating toward the 2% target.',
    context_es:
      'Presenta la evolución del IPC cuando alcanzó su pico en 9.1% antes de desacelerarse hacia la meta del 2%.',
    data_points: [
      { period: '2021-Q1', value: 2.6, secondary_value: 2.0 },
      { period: '2021-Q3', value: 5.4, secondary_value: 4.0 },
      { period: '2022-Q2', value: 9.1, secondary_value: 5.9 },
      { period: '2022-Q4', value: 7.1, secondary_value: 5.7 },
      { period: '2023-Q2', value: 4.0, secondary_value: 4.8 },
      { period: '2023-Q4', value: 3.4, secondary_value: 3.9 },
      { period: '2024-Q2', value: 2.9, secondary_value: 3.2 },
    ],
    key_movements: [
      'skyrocketed to a 40-year high of 9.1%',
      'tumbled sharply following unprecedented rate hikes',
      'plateaued around 3.4%',
      'decelerated steadily toward target',
    ],
    suggested_vocabulary: [
      {
        word: 'skyrocketed',
        definition: 'Rose extremely rapidly and steeply.',
        collocations: 'prices skyrocketed, inflation skyrocketed',
      },
      {
        word: 'tumbled',
        definition: 'Fell rapidly and suddenly.',
        collocations: 'yields tumbled, market tumbled',
      },
      {
        word: 'plateaued',
        definition: 'Reached a period of stability after a surge.',
        collocations: 'growth plateaued, rates plateaued',
      },
      {
        word: 'hovered around',
        definition: 'Remained near a specific numerical value.',
        collocations: 'hovered around 3%',
      },
    ],
    target_pitch_seconds: 45,
  };

  const tabs = [
    {
      id: 'charts',
      label: 'Chart Pitching Arena',
      icon: TrendingUp,
      desc: 'Oral description of macroeconomic time-series graphs',
    },
    {
      id: 'fed',
      label: 'Central Banking (FOMC)',
      icon: ShieldAlert,
      desc: 'Live policy rate debate with the AI Fed Chair',
    },
    {
      id: 'econometrics',
      label: 'Econometrics Lab',
      icon: Sigma,
      desc: 'Formal OLS, TWFE, and IV empirical interpretations',
    },
    {
      id: 'writing',
      label: 'Academic Writing Copilot',
      icon: Edit3,
      desc: 'Abstract and policy memo stylistic polish',
    },
  ];

  return (
    <PageWrapper maxWidth="max-w-5xl">
      <div className="space-y-8 pb-16 px-2 sm:px-0">
        {/* Studio Header */}
        <div className="p-8 rounded-[2rem] bg-white border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4" />
              <span>English for Specific Purposes (ESP) Track</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Economics & Quantitative Finance Studio
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-3 max-w-2xl leading-relaxed">
              Master the formal lexicon and rhetorical agility required for central banking debates, econometric publications in Q1 journals, and financial presentations.
            </p>

            {/* Tab Navigation Pill Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      playClick();
                      setActiveTab(tab.id as any);
                    }}
                    className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'bg-gray-50 border-gray-100 hover:border-gray-300 hover:bg-white text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-indigo-600'}`} />
                    </div>
                    <div>
                      <span className={`text-sm font-bold block ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {tab.label}
                      </span>
                      <span className={`text-[11px] leading-tight mt-1 hidden sm:block ${isActive ? 'text-indigo-100' : 'text-gray-500'}`}>
                        {tab.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Lab Component */}
        <div className="min-h-[600px]">
          {activeTab === 'charts' && <InteractiveChartPitch scenario={defaultChartScenario} />}
          {activeTab === 'fed' && <FedPolicySimulator />}
          {activeTab === 'econometrics' && <EconometricsStorytelling />}
          {activeTab === 'writing' && <AcademicWritingCopilot />}
        </div>
      </div>
    </PageWrapper>
  );
}
