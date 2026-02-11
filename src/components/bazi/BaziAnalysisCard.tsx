import React from 'react';
import { BaziAnalysis } from '@/types';
import { cn } from '@/lib/utils';
import { AIBadge } from '@/components/ui/ai-badge';
import { BaziPillarCard } from './BaziPillarCard';
import { WuxingStats } from './WuxingStats';
import { XiyongAnalysis } from './XiyongAnalysis';

interface BaziAnalysisCardProps {
  data: BaziAnalysis;
  className?: string;
}

export const BaziAnalysisCard: React.FC<BaziAnalysisCardProps> = ({ data, className }) => {
  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-amber-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📜</span>
          <h3 className="font-bold text-amber-900">八字命理分析</h3>
        </div>
        <AIBadge />
      </div>

      <div className="p-4 space-y-6">
        {/* 1. Four Pillars */}
        <section>
          <BaziPillarCard bazi={data.bazi} />
          <div className="mt-3 text-center">
             <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
               本命：{data.bazi.benming} · 日主：{data.wuxing.rizhu}（{data.wuxing.rizhuWuxing}）· {data.wuxing.wangshuai}
             </span>
          </div>
        </section>

        <div className="h-px bg-gray-100" />

        {/* 2. Wuxing Stats */}
        <section>
          <WuxingStats wuxing={data.wuxing} />
        </section>

        <div className="h-px bg-gray-100" />

        {/* 3. Xiyong Analysis */}
        <section>
          <XiyongAnalysis wuxing={data.wuxing} />
        </section>

        {/* 4. AI Analysis Text */}
        <section className="bg-blue-50/50 rounded-xl p-3 text-sm text-blue-900 leading-relaxed border border-blue-100">
          <p className="mb-2 font-semibold flex items-center gap-1">
            <span className="text-lg">🤖</span> AI 大师解读
          </p>
          <p className="opacity-90">{data.analysis}</p>
          <p className="mt-2 pt-2 border-t border-blue-200/50 font-medium text-amber-700">
            💡 建议：{data.suggestion}
          </p>
        </section>
      </div>
    </div>
  );
};
