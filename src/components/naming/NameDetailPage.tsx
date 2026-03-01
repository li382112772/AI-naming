import React from 'react'
import { NameDetail } from '@/types'
import { cn, fullName } from '@/lib/utils'
import { NameScore } from './NameScore'
import { CharacterAnalysis } from './CharacterAnalysis'
import { YinyunAnalysis } from './YinyunAnalysis'
import { AIBadge } from '@/components/ui/ai-badge'
import { WuxingTag } from '@/components/ui/wuxing-tag'
import { ChevronLeft, Share2, Heart, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFavorites } from '@/hooks/useFavorites'
import { AIGenerating } from '@/components/ui/ai-generating'

interface NameDetailPageProps {
  name: NameDetail
  onBack: () => void
  className?: string
}

export const NameDetailPage: React.FC<NameDetailPageProps> = ({ name, onBack, className }) => {
  const navigate = useNavigate()
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const favorited = isFavorite(name.id || '')

  // Guard: if name only has summary data, show loading placeholder
  if (!name.hasFullDetail || name.characters.length === 0) {
    return (
      <div className={cn('bg-gray-50 min-h-screen flex items-center justify-center', className)}>
        <AIGenerating message="正在加载详细数据..." className="bg-white rounded-2xl" />
      </div>
    )
  }

  return (
    <div className={cn('bg-gray-50 min-h-screen pb-24', className)}>
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-4 py-3 border-b border-gray-100 flex justify-between items-center shadow-sm">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 font-serif tracking-widest">{fullName(name)}</h1>
        <div className="flex gap-1">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="回到首页"
          >
            <Home className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => (favorited ? removeFavorite(name.id!) : addFavorite(name))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Heart
              className={cn('w-4 h-4 transition-colors', favorited ? 'text-red-500 fill-current' : 'text-gray-500')}
            />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Share2 className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* ── 1. Hero: Characters + Score ── */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          {/* Gradient hero area */}
          <div className="bg-gradient-to-b from-amber-50 to-white pt-7 pb-5 px-6">
            <div className="flex justify-center gap-6 mb-4">
              {name.lastName && (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="text-6xl font-serif font-bold text-gray-800 leading-none">{name.lastName}</div>
                  <div className="text-xs text-gray-400 tracking-widest">&nbsp;</div>
                  <div className="h-5" /> {/* spacer to align with wuxing tags */}
                </div>
              )}
              {name.characters.map((char, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="text-6xl font-serif font-bold text-gray-800 leading-none">{char.char}</div>
                  <div className="text-xs text-gray-400 tracking-widest">{char.pinyin}</div>
                  <WuxingTag wuxing={char.wuxing} size="sm" className="mx-auto" />
                </div>
              ))}
            </div>

            {/* Full name + overall rating */}
            <div className="flex items-center justify-center gap-3">
              <span className="text-base font-semibold text-gray-500 font-serif tracking-[0.2em]">{fullName(name)}</span>
              <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-1 rounded-full font-semibold shadow-sm">
                ✨ 大吉
              </span>
            </div>
          </div>

          {/* Score strip */}
          <div className="border-t border-gray-100 px-6 py-4">
            <NameScore score={name.score} uniqueness={name.uniqueness} uniquenessCount={name.uniquenessCount} />
          </div>
        </div>

        {/* ── 2. Name Meaning ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <SectionTitle color="amber">名字寓意</SectionTitle>
          </div>
          <div className="px-5 py-4">
            <div className="relative bg-amber-50 rounded-xl p-4 overflow-hidden">
              <div className="absolute top-1 right-2 text-5xl font-serif opacity-[0.06] text-amber-900 select-none">❝</div>
              <p className="font-medium text-amber-900 leading-relaxed mb-2">{name.meaning}</p>
              <p className="text-xs text-amber-700 opacity-80">—— {name.source}</p>
            </div>
          </div>
        </div>

        {/* ── 3. AI Personalized Meaning ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <AIBadge />
              <span className="text-sm font-bold text-blue-900">专属寓意解读</span>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-gray-700 leading-relaxed">{name.personalizedMeaning}</p>
          </div>
        </div>

        {/* ── 4. Character Analysis ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <SectionTitle color="amber">汉字深度解析</SectionTitle>
          </div>
          <div className="px-4 py-4">
            <CharacterAnalysis characters={name.characters} />
          </div>
        </div>

        {/* ── 5. Yinyun Analysis ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <SectionTitle color="indigo">音韵美学分析</SectionTitle>
          </div>
          <div className="px-5 py-4">
            <YinyunAnalysis yinyun={name.yinyun} />
          </div>
        </div>

        {/* ── 6. Bazi Match ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <SectionTitle color="emerald">五行八字契合度</SectionTitle>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-gray-700 leading-relaxed">{name.baziMatch}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helper: consistent section title with colored accent bar ──────────────────
function SectionTitle({ children, color }: { children: React.ReactNode; color: 'amber' | 'indigo' | 'emerald' }) {
  const barColor = color === 'amber' ? 'bg-amber-500' : color === 'indigo' ? 'bg-indigo-500' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn('w-1 h-4 rounded-full', barColor)} />
      <h3 className="text-sm font-bold text-gray-800">{children}</h3>
    </div>
  )
}
