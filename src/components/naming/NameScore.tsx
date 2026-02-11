import React from 'react';
import { NameDetail } from '@/types';
import { cn } from '@/lib/utils';

interface NameScoreProps {
  score: number;
  uniqueness: string;
  uniquenessCount: string;
  className?: string;
}

export const NameScore: React.FC<NameScoreProps> = ({ score, uniqueness, uniquenessCount, className }) => {
  return (
    <div className={cn("flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-lg shadow-orange-200", className)}>
      <div className="flex flex-col">
        <span className="text-xs opacity-80 mb-0.5">综合评分</span>
        <span className="text-4xl font-bold">{score}</span>
      </div>
      
      <div className="h-8 w-px bg-white/20" />

      <div className="flex flex-col items-center">
        <span className="text-xs opacity-80 mb-0.5">重名度</span>
        <span className="font-bold">{uniqueness}</span>
      </div>

      <div className="h-8 w-px bg-white/20" />

      <div className="flex flex-col items-end">
        <span className="text-xs opacity-80 mb-0.5">全网同名估算</span>
        <span className="font-bold text-lg">≈ {uniquenessCount}</span>
      </div>
    </div>
  );
};
