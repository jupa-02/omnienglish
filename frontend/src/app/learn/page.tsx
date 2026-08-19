'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api';
import { CurriculumUnit } from '@/lib/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Unit } from '@/components/map/Unit';
import { StreakModal } from '@/components/gamification/StreakModal';

const DEFAULT_UNITS: CurriculumUnit[] = [
  {
    id: 'unit_1',
    cefr_level: 'A1',
    unit_number: 1,
    title: 'Unit 1: Pronouns, Explicit Subjects & Essential Verbs',
    description: 'Laying foundational grammar without Spanish subject-omission errors.',
    icon_name: 'sparkles',
    nodes: [
      {
        id: 'node_1_1',
        unit_id: 'unit_1',
        node_type: 'standard_drill',
        title: 'Subject Pronouns & "It is" Rule',
        order_index: 1,
        xp_reward: 20,
        track: 'general',
        status: 'unlocked',
        score_percentage: 0,
      },
      {
        id: 'node_1_2',
        unit_id: 'unit_1',
        node_type: 'voice_roleplay',
        title: 'Phonetics Lab: Initial /s/ without "e"',
        order_index: 2,
        xp_reward: 25,
        track: 'general',
        status: 'locked',
        score_percentage: 0,
      },
      {
        id: 'node_1_3',
        unit_id: 'unit_1',
        node_type: 'standard_drill',
        title: 'Negation & Auxiliary Do/Does',
        order_index: 3,
        xp_reward: 20,
        track: 'general',
        status: 'locked',
        score_percentage: 0,
      },
      {
        id: 'node_1_4',
        unit_id: 'unit_1',
        node_type: 'boss_challenge',
        title: 'Unit 1 Master Review Checkpoint',
        order_index: 4,
        xp_reward: 40,
        track: 'general',
        status: 'locked',
        score_percentage: 0,
      },
    ],
  },
  {
    id: 'unit_2',
    cefr_level: 'A2',
    unit_number: 2,
    title: 'Unit 2: Prepositional Regimes & Business Routines',
    description: 'Mastering depend on, interested in, and daily economic indicators.',
    icon_name: 'trending-up',
    nodes: [
      {
        id: 'node_2_1',
        unit_id: 'unit_2',
        node_type: 'standard_drill',
        title: 'Dependent Prepositions (Depend on / Interested in)',
        order_index: 1,
        xp_reward: 20,
        track: 'general',
        status: 'locked',
        score_percentage: 0,
      },
      {
        id: 'node_2_2',
        unit_id: 'unit_2',
        node_type: 'chart_pitch',
        title: 'Chart Basics: Describing Upticks & Dips',
        order_index: 2,
        xp_reward: 30,
        track: 'economics',
        status: 'locked',
        score_percentage: 0,
      },
      {
        id: 'node_2_3',
        unit_id: 'unit_2',
        node_type: 'boss_challenge',
        title: 'Unit 2 Trophy Boss Checkpoint',
        order_index: 3,
        xp_reward: 50,
        track: 'general',
        status: 'locked',
        score_percentage: 0,
      },
    ],
  },
  {
    id: 'unit_3',
    cefr_level: 'B1',
    unit_number: 3,
    title: 'Unit 3: Professional Negotiations & Business Nuance',
    description: 'Hedging language, indirect questions, and corporate communications.',
    icon_name: 'briefcase',
    nodes: [
      {
        id: 'node_3_1',
        unit_id: 'unit_3',
        node_type: 'standard_drill',
        title: 'Diplomatic Language & Polite Requests',
        order_index: 1,
        xp_reward: 25,
        track: 'general',
        status: 'locked',
        score_percentage: 0,
      },
      {
        id: 'node_3_2',
        unit_id: 'unit_3',
        node_type: 'voice_roleplay',
        title: 'Salary Negotiation & Pitching Value',
        order_index: 2,
        xp_reward: 35,
        track: 'general',
        status: 'locked',
        score_percentage: 0,
      },
      {
        id: 'node_3_3',
        unit_id: 'unit_3',
        node_type: 'boss_challenge',
        title: 'Unit 3 B1 Milestone Assessment',
        order_index: 3,
        xp_reward: 60,
        track: 'general',
        status: 'locked',
        score_percentage: 0,
      },
    ],
  },
  {
    id: 'unit_4',
    cefr_level: 'B2',
    unit_number: 4,
    title: 'Unit 4: Macroeconomics & Econometric Storytelling',
    description: 'Inflation dynamics, monetary policy, and regression analysis narratives.',
    icon_name: 'activity',
    nodes: [
      {
        id: 'node_4_1',
        unit_id: 'unit_4',
        node_type: 'chart_pitch',
        title: 'Yield Curve Inversions & Inflationary Pressures',
        order_index: 1,
        xp_reward: 35,
        track: 'economics',
        status: 'locked',
        score_percentage: 0,
      },
      {
        id: 'node_4_2',
        unit_id: 'unit_4',
        node_type: 'standard_drill',
        title: 'Causal Inference & Econometric Jargon',
        order_index: 2,
        xp_reward: 30,
        track: 'economics',
        status: 'locked',
        score_percentage: 0,
      },
      {
        id: 'node_4_3',
        unit_id: 'unit_4',
        node_type: 'boss_challenge',
        title: 'Unit 4 B2 Macroeconomic Presentation',
        order_index: 3,
        xp_reward: 70,
        track: 'economics',
        status: 'locked',
        score_percentage: 0,
      },
    ],
  },
  {
    id: 'unit_5',
    cefr_level: 'C1',
    unit_number: 5,
    title: 'Unit 5: Executive C1/C2 Global Strategy & Boardroom Debate',
    description: 'Executive presence, spontaneous defense, and cross-border M&A discussions.',
    icon_name: 'award',
    nodes: [
      {
        id: 'node_5_1',
        unit_id: 'unit_5',
        node_type: 'voice_roleplay',
        title: 'Executive Boardroom Defense & Strategic Q&A',
        order_index: 1,
        xp_reward: 45,
        track: 'economics',
        status: 'locked',
        score_percentage: 0,
      },
      {
        id: 'node_5_2',
        unit_id: 'unit_5',
        node_type: 'boss_challenge',
        title: 'Master C1 Certification Capstone',
        order_index: 2,
        xp_reward: 100,
        track: 'general',
        status: 'locked',
        score_percentage: 0,
      },
    ],
  },
];

export default function LearnPage() {
  const [units, setUnits] = useState<CurriculumUnit[]>(DEFAULT_UNITS);
  const [activeLessonId, setActiveLessonId] = useState<string>('node_1_1');
  const [showStreakModal, setShowStreakModal] = useState(false);

  useEffect(() => {
    // Read local progress first for instant responsive feel
    if (typeof window !== 'undefined') {
      let foundActive = false;
      let newActiveId = 'node_1_1';
      const processed = DEFAULT_UNITS.map((unit) => {
        const updatedNodes = unit.nodes.map((node) => {
          const isCompleted = localStorage.getItem(`completed_${node.id}`) === 'true';
          if (isCompleted) {
            return { ...node, status: 'completed' as const };
          } else if (!foundActive) {
            foundActive = true;
            newActiveId = node.id;
            return { ...node, status: 'unlocked' as const };
          } else {
            return { ...node, status: 'locked' as const };
          }
        });
        return { ...unit, nodes: updatedNodes };
      });
      setActiveLessonId(newActiveId);
      setUnits(processed);
    }

    async function loadBackendUnits() {
      try {
        const data = await ApiClient.getUnits();
        if (data && Array.isArray(data) && data.length > 0) {
          setUnits(data);
          if (data[0].nodes?.length > 0) {
            setActiveLessonId(data[0].nodes[0].id);
          }
        }
      } catch (err) {
        // Backend optional hydration - graceful fallback
      }
    }
    loadBackendUnits();
  }, []);

  return (
    <PageWrapper maxWidth="max-w-xl">
      <div className="space-y-6 pb-16">
        {units.map((unit) => (
          <Unit
            key={unit.id}
            id={unit.id}
            unitNumber={unit.unit_number}
            title={unit.title}
            description={unit.description}
            cefrLevel={unit.cefr_level}
            lessons={unit.nodes}
            activeLessonId={activeLessonId}
          />
        ))}
      </div>

      {/* Streak Celebration Modal */}
      {showStreakModal && (
        <StreakModal
          isOpen={showStreakModal}
          streakCount={7}
          freezeCount={2}
          onClose={() => setShowStreakModal(false)}
        />
      )}
    </PageWrapper>
  );
}
