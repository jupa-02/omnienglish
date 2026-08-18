'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api';
import { CurriculumUnit } from '@/lib/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Unit } from '@/components/map/Unit';
import { StreakModal } from '@/components/gamification/StreakModal';

export default function LearnPage() {
  const [units, setUnits] = useState<CurriculumUnit[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string>('node_1_1');
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUnits() {
      try {
        const data = await ApiClient.getUnits();
        setUnits(data);
        if (data.length > 0 && data[0].nodes.length > 0) {
          setActiveLessonId(data[0].nodes[0].id);
        }
      } catch {
        // Fallback rich Duolingo-style units
        let fallbackUnits: CurriculumUnit[] = [
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
        ];
        
        // Progression logic
        if (typeof window !== 'undefined') {
          let foundActive = false;
          let newActiveId = '';
          const processedUnits = fallbackUnits.map(unit => {
            const updatedNodes = unit.nodes.map(node => {
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
          
          if (newActiveId) {
            setActiveLessonId(newActiveId);
          }
          setUnits(processedUnits);
        } else {
          setUnits(fallbackUnits);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadUnits();
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
