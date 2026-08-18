'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { ArticulatoryPhonemeLab } from '@/components/frontier/ArticulatoryPhonemeLab';

export default function PhonemeLabPage() {
  return (
    <PageWrapper maxWidth="max-w-5xl">
      <div className="pb-16">
        <ArticulatoryPhonemeLab />
      </div>
    </PageWrapper>
  );
}
