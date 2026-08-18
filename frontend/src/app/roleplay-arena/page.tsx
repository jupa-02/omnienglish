'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TaskBasedRoleplayArena } from '@/components/frontier/TaskBasedRoleplayArena';

export default function RoleplayArenaPage() {
  return (
    <PageWrapper maxWidth="max-w-5xl">
      <div className="pb-16">
        <TaskBasedRoleplayArena />
      </div>
    </PageWrapper>
  );
}
