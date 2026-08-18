'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { ExecutiveDialogueStudio } from '@/components/frontier/ExecutiveDialogueStudio';

export default function ExecutiveStudioPage() {
  return (
    <PageWrapper maxWidth="max-w-5xl">
      <div className="pb-16">
        <ExecutiveDialogueStudio />
      </div>
    </PageWrapper>
  );
}
