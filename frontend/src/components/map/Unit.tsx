'use client';

import React from 'react';
import { UnitBanner } from './UnitBanner';
import { LessonButton } from './LessonButton';
import { LessonNode } from '@/lib/types';

interface UnitProps {
  id: string;
  unitNumber: number;
  title: string;
  description?: string;
  cefrLevel: string;
  lessons: LessonNode[];
  activeLessonId?: string;
}

export const Unit: React.FC<UnitProps> = ({
  id,
  unitNumber,
  title,
  description = '',
  cefrLevel,
  lessons,
  activeLessonId,
}) => {
  return (
    <div className="space-y-6 my-8">
      {/* Unit Header Banner */}
      <UnitBanner
        title={title}
        description={description}
        unitNumber={unitNumber}
        cefrLevel={cefrLevel}
      />

      {/* Sinuous Winding Lesson Nodes */}
      <div className="relative flex flex-col items-center justify-center py-4">
        {/* SVG Path linking nodes */}
        <div className="absolute inset-0 pointer-events-none flex justify-center w-full">
          <svg className="w-full h-full overflow-visible" style={{ maxWidth: '400px' }}>
            <path
              d={lessons.reduce((acc, lesson, index) => {
                const cycleLength = 8;
                const cycleIndex = index % cycleLength;
                let indentationLevel = 0;

                if (cycleIndex <= 2) {
                  indentationLevel = cycleIndex;
                } else if (cycleIndex <= 4) {
                  indentationLevel = 4 - cycleIndex;
                } else if (cycleIndex <= 6) {
                  indentationLevel = 4 - cycleIndex;
                } else {
                  indentationLevel = cycleIndex - 8;
                }

                const x = 200 + indentationLevel * 45; // 200 is center
                const y = index * 144 + 40 + 16; // 40 = half of 80px button, 16 = py-4

                if (index === 0) {
                  return `M ${x} ${y}`;
                }
                
                // We need to calculate previous point to draw a bezier curve
                const prevCycleIndex = (index - 1) % cycleLength;
                let prevIndentationLevel = 0;
                if (prevCycleIndex <= 2) prevIndentationLevel = prevCycleIndex;
                else if (prevCycleIndex <= 4) prevIndentationLevel = 4 - prevCycleIndex;
                else if (prevCycleIndex <= 6) prevIndentationLevel = 4 - prevCycleIndex;
                else prevIndentationLevel = prevCycleIndex - 8;
                
                const prevX = 200 + prevIndentationLevel * 45;
                const prevY = (index - 1) * 144 + 40 + 16;
                
                // Curve control points
                const controlY1 = prevY + 72;
                const controlY2 = y - 72;
                
                return `${acc} C ${prevX} ${controlY1}, ${x} ${controlY2}, ${x} ${y}`;
              }, '')}
              fill="none"
              stroke="#e2e8f0" /* zinc-200 */
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={lessons.reduce((acc, lesson, index) => {
                const cycleLength = 8;
                const cycleIndex = index % cycleLength;
                let indentationLevel = 0;

                if (cycleIndex <= 2) {
                  indentationLevel = cycleIndex;
                } else if (cycleIndex <= 4) {
                  indentationLevel = 4 - cycleIndex;
                } else if (cycleIndex <= 6) {
                  indentationLevel = 4 - cycleIndex;
                } else {
                  indentationLevel = cycleIndex - 8;
                }

                const x = 200 + indentationLevel * 45;
                const y = index * 144 + 40 + 16;
                
                // Don't draw colored path if the current and previous nodes are locked
                const isCurrent = lesson.id === activeLessonId || (!activeLessonId && index === 0 && lesson.status !== 'locked');
                const isCompleted = lesson.status === 'completed';
                
                // We want to color the path up to the active node. 
                // If it's the first node, just M it.
                if (index === 0) {
                  return `M ${x} ${y}`;
                }
                
                // Check if previous was completed or current
                const prevLesson = lessons[index-1];
                const prevIsCurrent = prevLesson.id === activeLessonId || (!activeLessonId && index-1 === 0 && prevLesson.status !== 'locked');
                const prevIsCompleted = prevLesson.status === 'completed';
                
                // We only draw colored path if the PREVIOUS node is completed.
                // Or if it's the current node, wait, no, the path *to* a node is colored if the previous node is completed.
                if (!prevIsCompleted && !prevIsCurrent) {
                  return acc; // Stop drawing colored path
                }

                const prevCycleIndex = (index - 1) % cycleLength;
                let prevIndentationLevel = 0;
                if (prevCycleIndex <= 2) prevIndentationLevel = prevCycleIndex;
                else if (prevCycleIndex <= 4) prevIndentationLevel = 4 - prevCycleIndex;
                else if (prevCycleIndex <= 6) prevIndentationLevel = 4 - prevCycleIndex;
                else prevIndentationLevel = prevCycleIndex - 8;
                
                const prevX = 200 + prevIndentationLevel * 45;
                const prevY = (index - 1) * 144 + 40 + 16;
                
                const controlY1 = prevY + 72;
                const controlY2 = y - 72;
                
                return `${acc} C ${prevX} ${controlY1}, ${x} ${controlY2}, ${x} ${y}`;
              }, '')}
              fill="none"
              stroke="#6366f1" /* indigo-500 */
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
        </div>

        {lessons.map((lesson, index) => {
          const isCurrent = lesson.id === activeLessonId || (!activeLessonId && index === 0 && lesson.status !== 'locked');
          const isLocked = lesson.status === 'locked' && !isCurrent;

          return (
            <LessonButton
              key={lesson.id}
              id={lesson.id}
              index={index}
              totalCount={lessons.length}
              current={isCurrent}
              locked={isLocked}
              percentage={lesson.score_percentage || (isCurrent ? 25 : 100)}
              title={lesson.title}
              xpReward={lesson.xp_reward}
              nodeType={lesson.node_type}
            />
          );
        })}
      </div>
    </div>
  );
};
