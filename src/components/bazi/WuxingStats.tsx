import React from 'react';
import { BaziAnalysis } from '@/types';
import { cn } from '@/lib/utils';

interface WuxingStatsProps {
  wuxing: BaziAnalysis['wuxing'];
  className?: string;
}

export const WuxingStats: React.FC<WuxingStatsProps> = ({ wuxing, className }) => {
  const stats = [
    { label: '金', count: wuxing.gold, color: 'bg-yellow-400' },
    { label: '木', count: wuxing.wood, color: 'bg-green-500' },
    { label: '水', count: wuxing.water, color: 'bg-blue-500' },
    { label: '火', count: wuxing.fire, color: 'bg-red-500' },
    { label: '土', count: wuxing.earth, color: 'bg-amber-600' },
  ];

  const total = stats.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-semibold text-gray-600">五行分布</h4>
      
      {/* Visual Bar */}
      <div className="flex h-4 rounded-full overflow-hidden w-full shadow-inner bg-gray-100">
        {stats.map((item) => (
          item.count > 0 && (
            <div 
              key={item.label}
              style={{ width: `${(item.count / total) * 100}%` }}
              className={item.color}
              title={`${item.label}: ${item.count}`}
            />
          )
        ))}
      </div>

      {/* Counts */}
      <div className="flex justify-between text-xs text-gray-500">
        {stats.map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <span className="font-medium">{item.label}</span>
            <span className={cn(
              "mt-0.5 font-bold px-1.5 rounded-full",
              item.count === 0 ? "text-gray-300" : "text-gray-700 bg-gray-100"
            )}>
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
