import React from 'react';
import { NameDetail } from '@/types';
import { cn, fullName } from '@/lib/utils';
import { WuxingTag } from '@/components/ui/wuxing-tag';
import { Lock } from 'lucide-react';

interface NameCardProps {
  name: NameDetail;
  onClick?: () => void;
  className?: string;
}

export const NameCard: React.FC<NameCardProps> = ({ name, onClick, className }) => {
  const isLocked = name.isLocked;

  return (
    <div 
      onClick={isLocked ? undefined : onClick}
      className={cn(
        "relative rounded-xl border p-4 transition-all duration-200",
        isLocked 
          ? "bg-gray-50 border-gray-200 cursor-not-allowed" 
          : "bg-white border-amber-100 shadow-sm hover:shadow-md hover:border-amber-200 cursor-pointer",
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className={cn(
            "text-2xl font-bold font-serif tracking-wide",
            isLocked ? "text-gray-400" : "text-gray-900"
          )}>
            {fullName(name)}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{name.pinyin}</p>
        </div>
        
        {isLocked ? (
          <Lock className="w-5 h-5 text-gray-300" />
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-amber-500">{name.score}</span>
            <span className="text-[10px] text-gray-400">AI评分</span>
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-3">
        {name.wuxing.split('').map((w, i) => (
           <WuxingTag key={i} wuxing={w} size="sm" className={isLocked ? "opacity-50 grayscale" : ""} />
        ))}
      </div>

      <p className={cn(
        "text-sm line-clamp-2 leading-relaxed",
        isLocked ? "text-gray-400 blur-[2px] select-none" : "text-gray-600"
      )}>
        {isLocked ? "此名字的寓意解析需要解锁后查看，包含详细的字义、出处及五行分析..." : name.meaning}
      </p>

      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 shadow-sm flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">待解锁</span>
          </div>
        </div>
      )}
    </div>
  );
};
