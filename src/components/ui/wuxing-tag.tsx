import React from 'react';
import { cn } from '@/lib/utils';

type WuxingType = '金' | '木' | '水' | '火' | '土';

interface WuxingTagProps {
  wuxing: string; // Can be single char like '金' or multiple '金水'
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

const wuxingColors: Record<WuxingType, string> = {
  '金': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  '木': 'bg-green-100 text-green-700 border-green-200',
  '水': 'bg-blue-100 text-blue-700 border-blue-200',
  '火': 'bg-red-100 text-red-700 border-red-200',
  '土': 'bg-amber-100 text-amber-800 border-amber-200',
};

export const WuxingTag: React.FC<WuxingTagProps> = ({ wuxing, className, size = 'md' }) => {
  // Take the first character if it's a string like "金" or "金水"
  // If we want to support multiple tags, the parent should map them.
  // This component renders ONE tag based on the first char or the string itself if it's a known wuxing.
  
  const mainWuxing = wuxing.charAt(0) as WuxingType;
  const colorClass = wuxingColors[mainWuxing] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span className={cn(
      "inline-flex items-center justify-center font-serif border rounded-md select-none",
      colorClass,
      size === 'xs' ? "w-4 h-4 text-[10px]" : size === 'sm' ? "w-5 h-5 text-xs" : "w-6 h-6 text-sm",
      className
    )}>
      {mainWuxing}
    </span>
  );
};
