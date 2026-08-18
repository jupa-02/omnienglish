'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { InteractiveAvatar } from '@/components/frontier/InteractiveAvatar';

export default function AvatarImmersionPage() {
  return (
    <PageWrapper maxWidth="max-w-7xl" showStickyWrapper={false}>
      <div className="pb-8">
        <InteractiveAvatar />
      </div>
    </PageWrapper>
  );
}
