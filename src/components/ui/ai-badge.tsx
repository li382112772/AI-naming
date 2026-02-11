import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIBadgeProps {
  className?: string;
}

export const AIBadge: React.FC<AIBadgeProps> = ({ className }) => {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm",
      className
    )}>
      <Sparkles className="w-3 h-3" />
      <span>AI 生成</span>
    </div>
  );
};
