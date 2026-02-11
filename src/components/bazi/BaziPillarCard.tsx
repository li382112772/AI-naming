import React from 'react';
import { BaziAnalysis } from '@/types';
import { cn } from '@/lib/utils';
import { WuxingTag } from '@/components/ui/wuxing-tag';

interface BaziPillarCardProps {
  bazi: BaziAnalysis['bazi'];
  className?: string;
}

export const BaziPillarCard: React.FC<BaziPillarCardProps> = ({ bazi, className }) => {
  const pillars = [
    { label: '年柱', pillar: bazi.yearPillar, wuxing: bazi.yearWuxing, nayin: bazi.yearNayin },
    { label: '月柱', pillar: bazi.monthPillar, wuxing: bazi.monthWuxing, nayin: bazi.monthNayin },
    { label: '日柱', pillar: bazi.dayPillar, wuxing: bazi.dayWuxing, nayin: bazi.dayNayin, isMain: true },
    { label: '时柱', pillar: bazi.hourPillar, wuxing: bazi.hourWuxing, nayin: bazi.hourNayin },
  ];

  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {pillars.map((item, index) => (
        <div 
          key={index} 
          className={cn(
            "flex flex-col items-center p-3 rounded-lg border",
            item.isMain ? "bg-amber-50 border-amber-200 ring-1 ring-amber-300" : "bg-white border-gray-100"
          )}
        >
          <span className="text-xs text-gray-400 mb-1">{item.label}</span>
          <span className="text-xl font-bold text-gray-800 font-serif mb-1">{item.pillar}</span>
          <div className="flex gap-0.5 mb-1">
            {/* Split wuxing string (e.g. "金木") into individual chars */}
            {item.wuxing.split('').map((w, i) => (
              <WuxingTag key={i} wuxing={w} size="sm" />
            ))}
          </div>
          <span className="text-[10px] text-gray-500 scale-90">{item.nayin}</span>
        </div>
      ))}
    </div>
  );
};
