import React from 'react';
import { BaziAnalysis } from '@/types';
import { cn } from '@/lib/utils';
import { WuxingTag } from '@/components/ui/wuxing-tag';
import { CheckCircle2, XCircle } from 'lucide-react';

interface XiyongAnalysisProps {
  wuxing: BaziAnalysis['wuxing'];
  className?: string;
}

export const XiyongAnalysis: React.FC<XiyongAnalysisProps> = ({ wuxing, className }) => {
  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      {/* Xi Yong (Favorable) */}
      <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
        <div className="flex items-center gap-1.5 mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span className="text-sm font-bold text-green-800">喜用神</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {wuxing.xiyong.length > 0 ? (
            wuxing.xiyong.map((w, i) => (
              <WuxingTag key={i} wuxing={w} className="bg-white border-green-200 text-green-700" />
            ))
          ) : (
            <span className="text-xs text-gray-400">无</span>
          )}
        </div>
        <p className="text-[10px] text-green-600/80 mt-2 leading-tight">
          起名建议补益此类五行
        </p>
      </div>

      {/* Ji Yong (Unfavorable) */}
      <div className="bg-red-50/50 p-3 rounded-lg border border-red-100">
        <div className="flex items-center gap-1.5 mb-2">
          <XCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm font-bold text-red-800">忌用神</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {wuxing.jiyong.length > 0 ? (
            wuxing.jiyong.map((w, i) => (
              <WuxingTag key={i} wuxing={w} className="bg-white border-red-200 text-red-700" />
            ))
          ) : (
            <span className="text-xs text-gray-400">无</span>
          )}
        </div>
        <p className="text-[10px] text-red-600/80 mt-2 leading-tight">
          起名建议避开此类五行
        </p>
      </div>
    </div>
  );
};
