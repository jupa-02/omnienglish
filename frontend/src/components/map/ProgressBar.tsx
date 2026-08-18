'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  colorClass = 'bg-gradient-to-r from-primary-500 to-accent-emerald',
}) => {
  const percentage = Math.min(100, Math.max(0, (current / Math.max(total, 1)) * 100));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-1.5">
          <span>{label}</span>
          <span className="text-gray-700 font-bold">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-3 w-full bg-white shadow-sm border border-gray-200 rounded-full overflow-hidden p-0.5 border border-gray-200 shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorClass} shadow-md`}
        />
      </div>
    </div>
  );
};
