import React from 'react';
import { YinyunInfo } from '@/types';
import { cn } from '@/lib/utils';

interface YinyunAnalysisProps {
  yinyun: YinyunInfo;
  className?: string;
}

export const YinyunAnalysis: React.FC<YinyunAnalysisProps> = ({ yinyun, className }) => {
  return (
    <div className={cn("bg-indigo-50/50 rounded-xl p-4 border border-indigo-100", className)}>
      <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
        <span>🎵</span> 音韵美学
      </h4>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="bg-white p-2 rounded border border-indigo-50">
          <span className="text-xs text-gray-400 block mb-0.5">声调组合</span>
          <span className="text-sm font-medium text-gray-700">{yinyun.tone}</span>
        </div>
        <div className="bg-white p-2 rounded border border-indigo-50">
          <span className="text-xs text-gray-400 block mb-0.5">声母搭配</span>
          <span className="text-sm font-medium text-gray-700">{yinyun.initials}</span>
        </div>
      </div>

      <p className="text-sm text-indigo-800/80 leading-relaxed">
        {yinyun.analysis}
      </p>
    </div>
  );
};
