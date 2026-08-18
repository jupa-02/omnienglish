'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserProgress } from '@/components/layout/UserProgress';
import { StickyWrapper } from '@/components/layout/StickyWrapper';

interface PageWrapperProps {
  children: React.ReactNode;
  showStickyWrapper?: boolean;
  maxWidth?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  showStickyWrapper = true,
  maxWidth = 'max-w-4xl',
}) => {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar className="hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0">
        <UserProgress
          activeCourse={{ title: 'English & Economics', imageSrc: '🇺🇸' }}
          hearts={5}
          points={420}
        />

        <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex gap-8 justify-center">
          <main className={`flex-1 ${maxWidth} w-full pb-24`}>
            {children}
          </main>

          {showStickyWrapper && <StickyWrapper />}
        </div>
      </div>
    </div>
  );
};
