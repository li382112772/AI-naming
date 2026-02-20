import React from 'react'
import { cn } from '@/lib/utils'

interface NameScoreProps {
  score: number
  uniqueness: string
  uniquenessCount: string
  className?: string
}

export const NameScore: React.FC<NameScoreProps> = ({ score, uniqueness, uniquenessCount, className }) => {
  // Score color band
  const scoreColor =
    score >= 90 ? 'text-emerald-600' : score >= 75 ? 'text-amber-600' : 'text-gray-500'

  return (
    <div className={cn('grid grid-cols-3 gap-0 divide-x divide-gray-100', className)}>
      {/* Score */}
      <div className="flex flex-col items-center py-1 px-2">
        <span className="text-[11px] text-gray-400 mb-0.5">综合评分</span>
        <span className={cn('text-3xl font-bold tabular-nums leading-none', scoreColor)}>{score}</span>
        <span className="text-[10px] text-gray-300 mt-0.5">/ 100</span>
      </div>

      {/* Uniqueness level */}
      <div className="flex flex-col items-center py-1 px-2">
        <span className="text-[11px] text-gray-400 mb-0.5">重名度</span>
        <span className="text-base font-bold text-gray-700 leading-none mt-1">{uniqueness}</span>
        <span className="text-[10px] text-gray-400 mt-1">重名程度</span>
      </div>

      {/* Same-name count */}
      <div className="flex flex-col items-center py-1 px-2">
        <span className="text-[11px] text-gray-400 mb-0.5">全网同名</span>
        <span className="text-base font-bold text-gray-700 leading-none mt-1">≈ {uniquenessCount}</span>
        <span className="text-[10px] text-gray-400 mt-1">人</span>
      </div>
    </div>
  )
}
