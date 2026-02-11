import React from 'react';
import { cn } from '@/lib/utils';

interface PriceTagProps {
  price: number;
  originalPrice?: number;
  className?: string;
}

export const PriceTag: React.FC<PriceTagProps> = ({ price, originalPrice, className }) => {
  return (
    <div className={cn("flex items-baseline gap-1.5", className)}>
      <span className="text-xs font-bold text-red-500">¥</span>
      <span className="text-xl font-bold text-red-600 font-mono">{price}</span>
      {originalPrice && (
        <span className="text-xs text-gray-400 line-through decoration-gray-400 decoration-1">
          ¥{originalPrice}
        </span>
      )}
    </div>
  );
};
