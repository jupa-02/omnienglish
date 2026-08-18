'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { SpeakMethodGym } from '@/components/frontier/SpeakMethodGym';

export default function SpeakGymPage() {
  return (
    <PageWrapper maxWidth="max-w-4xl">
      <div className="pb-16">
        <SpeakMethodGym />
      </div>
    </PageWrapper>
  );
}
