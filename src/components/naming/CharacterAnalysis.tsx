import React from 'react'
import { CharacterInfo } from '@/types'
import { cn } from '@/lib/utils'
import { WuxingTag } from '@/components/ui/wuxing-tag'

interface CharacterAnalysisProps {
  characters: CharacterInfo[]
  className?: string
}

// Wuxing → background gradient for the character circle
const WUXING_GRADIENTS: Record<string, { bg: string; text: string; ring: string }> = {
  金: { bg: 'from-yellow-300 to-amber-400', text: 'text-amber-900', ring: 'ring-amber-200' },
  木: { bg: 'from-green-300 to-emerald-500', text: 'text-emerald-900', ring: 'ring-emerald-200' },
  水: { bg: 'from-blue-300 to-cyan-500', text: 'text-blue-900', ring: 'ring-blue-200' },
  火: { bg: 'from-red-300 to-orange-500', text: 'text-red-900', ring: 'ring-red-200' },
  土: { bg: 'from-amber-300 to-yellow-600', text: 'text-yellow-900', ring: 'ring-yellow-200' },
}
const DEFAULT_GRADIENT = { bg: 'from-gray-200 to-gray-400', text: 'text-gray-800', ring: 'ring-gray-200' }

export const CharacterAnalysis: React.FC<CharacterAnalysisProps> = ({ characters, className }) => {
  return (
    <div className={cn('space-y-5', className)}>
      {characters.map((char, index) => {
        const gradient = WUXING_GRADIENTS[char.wuxing] ?? DEFAULT_GRADIENT

        return (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* ── Character header ─── */}
            <div className="flex items-center gap-5 p-5 pb-4">
              <div
                className={cn(
                  'w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0 ring-2',
                  gradient.bg,
                  gradient.ring,
                )}
              >
                <span className={cn('text-4xl font-serif font-bold select-none', gradient.text)}>
                  {char.char}
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-lg font-medium text-gray-700 tracking-widest">{char.pinyin}</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <WuxingTag wuxing={char.wuxing} size="sm" />
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    {char.kangxi.strokes} 画
                  </span>
                  {char.kangxi.page && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs font-medium">
                      康熙 {char.kangxi.page}
                    </span>
                  )}
                </div>
                {char.meaning && (
                  <p className="text-xs text-gray-500 leading-snug">{char.meaning}</p>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-100 mx-5" />

            {/* ── 字义详解 ─── */}
            <div className="px-5 py-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1 h-3.5 rounded-full bg-amber-500 inline-block" />
                <h4 className="text-sm font-bold text-gray-800">字义详解</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{char.explanation || char.meaning}</p>
              {char.source && (
                <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1 text-xs text-amber-800 font-medium mt-1">
                  <span>📜</span>
                  <span>{char.source}</span>
                </div>
              )}
            </div>

            {/* ── 字源 (康熙字典) ─── */}
            {char.kangxi.original && (
              <>
                <div className="h-px bg-gray-100 mx-5" />
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1 h-3.5 rounded-full bg-stone-400 inline-block" />
                    <h4 className="text-sm font-bold text-gray-800">字源</h4>
                    <span className="text-xs text-stone-400 ml-auto">《康熙字典》</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
                    <p className="text-xs text-stone-700 leading-loose font-serif tracking-wide whitespace-pre-wrap">
                      {char.kangxi.original}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
