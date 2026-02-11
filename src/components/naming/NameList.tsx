import React from 'react';
import { NameDetail } from '@/types';
import { NameCard } from './NameCard';
import { cn } from '@/lib/utils';

interface NameListProps {
  names: NameDetail[];
  onNameClick?: (name: NameDetail) => void;
  onUnlock?: () => void;
  className?: string;
}

export const NameList: React.FC<NameListProps> = ({ 
  names, 
  onNameClick, 
  onUnlock,
  className 
}) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
      {names.map((name, index) => (
        <div key={index} className="relative">
          <NameCard 
            name={name} 
            onClick={() => onNameClick?.(name)}
          />
          {name.isLocked && onUnlock && (
            <div 
              className="absolute inset-0 z-10 cursor-pointer" 
              onClick={onUnlock}
            />
          )}
        </div>
      ))}
      
      {/* Unlock All Card (Optional placeholder) */}
      {names.some(n => n.isLocked) && (
        <div 
          onClick={onUnlock}
          className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-50 transition-colors min-h-[160px]"
        >
          <span className="text-2xl mb-2">🔓</span>
          <p className="text-amber-800 font-bold">解锁全部名字</p>
          <p className="text-xs text-amber-600 mt-1">查看所有 AI 推荐及详细解析</p>
        </div>
      )}
    </div>
  );
};
