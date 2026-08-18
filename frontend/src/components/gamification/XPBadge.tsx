'use client';

import React from 'react';
import { Zap } from 'lucide-react';

interface XPBadgeProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
}

export const XPBadge: React.FC<XPBadgeProps> = ({ amount, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-3 py-1.5',
    lg: 'text-sm px-4 py-2 font-black',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-xl bg-gamify-xp/15 border border-gamify-xp/30 text-gamify-xp font-extrabold ${sizeClasses[size]}`}
    >
      <Zap className="w-3.5 h-3.5 fill-gamify-xp" />
      <span>+{amount} XP</span>
    </div>
  );
};
