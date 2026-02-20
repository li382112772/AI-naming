import React from 'react'
import { NameDetail } from '@/types'
import { motion } from 'framer-motion'
import { Sparkles, RefreshCw, List, Heart, BookOpen, Wind, ChevronRight, Check } from 'lucide-react'
import { WuxingTag } from '@/components/ui/wuxing-tag'
import { cn } from '@/lib/utils'

interface InlineNamePreviewProps {
  name: NameDetail
  onRefresh: () => void
  onViewDetail: () => void
  onViewList: () => void
  onFavorite: () => void
  onSelect: () => void
  isFavorite?: boolean
}

export const InlineNamePreview: React.FC<InlineNamePreviewProps> = ({
  name,
  onRefresh,
  onViewDetail,
  onViewList,
  onFavorite,
  onSelect,
  isFavorite,
}) => {
  const chars = name.name.split('')
  const pinyins = name.pinyin.split(' ')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="bg-white rounded-3xl shadow-lg border border-orange-100/60 overflow-hidden max-w-sm mx-auto my-4"
    >
      {/* ── Hero ── */}
      <div className="bg-gradient-to-b from-orange-50 to-white pt-7 pb-3 px-6">
        {/* Characters */}
        <div className="flex justify-center gap-5 mb-4">
          {chars.map((char, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-xs text-gray-400 font-medium tracking-widest">
                {pinyins[i] ?? ''}
              </span>
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-orange-100 flex items-center justify-center">
                <span className="text-3xl font-serif font-bold text-gray-800">{char}</span>
              </div>
              {/* Per-character wuxing from characters array */}
              {name.characters[i]?.wuxing && (
                <WuxingTag wuxing={name.characters[i].wuxing} size="xs" />
              )}
            </div>
          ))}
        </div>

        {/* Name + rating badge */}
        <div className="flex items-center justify-center gap-2.5 mb-1">
          <span className="text-base font-bold text-gray-600 font-serif tracking-[0.25em]">{name.name}</span>
          <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
            <Sparkles className="w-2.5 h-2.5" />
            <span>大吉</span>
          </div>
        </div>

        {/* Score pill */}
        <div className="flex justify-center">
          <span className="text-[11px] text-gray-400">
            综合评分 <span className="font-bold text-amber-600">{name.score}</span>
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 py-3 space-y-3 border-t border-gray-50">
        {/* Meaning */}
        <div className="flex gap-3 items-start">
          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-orange-900 mb-0.5">寓意</h4>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{name.meaning}</p>
            {name.source && (
              <p className="text-[10px] text-orange-500 mt-0.5 font-medium">{name.source}</p>
            )}
          </div>
        </div>

        {/* Wuxing */}
        <div className="flex gap-3 items-start">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
            <Wind className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-blue-900 mb-0.5">五行分析</h4>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{name.baziMatch}</p>
          </div>
        </div>

        {/* View full link */}
        <button
          onClick={onViewDetail}
          className="w-full flex items-center justify-center gap-1 text-[11px] text-amber-600 hover:text-amber-700 font-medium py-1.5 transition-colors"
        >
          <span>查看完整解析</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* ── Actions ── */}
      <div className="px-4 pb-4 pt-0 space-y-2.5 border-t border-gray-50">
        <div className="flex gap-2 pt-3">
          {/* Favorite */}
          <button
            onClick={onFavorite}
            className={cn(
              'flex-1 h-10 rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95 text-sm font-medium',
              isFavorite
                ? 'bg-red-50 border-red-200 text-red-500'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
            )}
          >
            <Heart className={cn('w-3.5 h-3.5', isFavorite && 'fill-current')} />
            收藏
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="flex-1 h-10 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-all active:scale-95 text-sm font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            换一个
          </button>

          {/* Select */}
          <button
            onClick={onSelect}
            className="flex-[1.4] h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200 flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-95 text-sm font-bold"
          >
            <Check className="w-3.5 h-3.5" />
            就选这个
          </button>
        </div>

        {/* View list link */}
        <button
          onClick={onViewList}
          className="w-full flex items-center justify-center gap-1 text-[11px] text-gray-400 hover:text-orange-500 transition-colors py-0.5"
        >
          <List className="w-3 h-3" />
          <span>查看该系列全部名字</span>
        </button>
      </div>
    </motion.div>
  )
}
