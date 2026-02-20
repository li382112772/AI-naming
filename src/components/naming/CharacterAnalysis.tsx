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

// ── Ancient Script Card ──────────────────────────────────────────────────────
// Each script era gets a genuinely distinct visual treatment via SVG backgrounds
// and CSS filter stacks — not just italic vs. bold.

type ScriptEra = 'oracle' | 'bronze' | 'seal'

interface ScriptConfig {
  key: ScriptEra
  label: string
  period: string
  // SVG background rendered as data-URI inline
  bgSvg: string
  // CSS filter applied to the character glyph
  glyphFilter: string
  // Font-size scale relative to container
  fontSize: string
  // Character color
  charColor: string
  // Border + background CSS for card wrapper
  wrapperClass: string
  labelClass: string
}

// Oracle bone: yellowish bone/tortoise-shell texture, deep scratched-in marks
const ORACLE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23fef3c7'/%3E%3Cline x1='0' y1='16' x2='64' y2='20' stroke='%23d97706' stroke-width='0.3' opacity='0.4'/%3E%3Cline x1='0' y1='35' x2='64' y2='32' stroke='%23d97706' stroke-width='0.2' opacity='0.3'/%3E%3Cline x1='0' y1='50' x2='64' y2='53' stroke='%23d97706' stroke-width='0.3' opacity='0.25'/%3E%3Cellipse cx='52' cy='8' rx='5' ry='3' fill='%23d97706' opacity='0.08'/%3E%3Cellipse cx='10' cy='55' rx='4' ry='2' fill='%23d97706' opacity='0.07'/%3E%3C/svg%3E")`

// Bronze: deep greenish-bronze patina texture, cast metal look
const BRONZE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23134e4a'/%3E%3Crect width='64' height='64' fill='%23065f46' opacity='0.5'/%3E%3Ccircle cx='20' cy='15' r='18' fill='%23047857' opacity='0.25'/%3E%3Ccircle cx='50' cy='50' r='20' fill='%23064e3b' opacity='0.4'/%3E%3Cline x1='0' y1='0' x2='64' y2='64' stroke='%2310b981' stroke-width='0.4' opacity='0.15'/%3E%3Cline x1='64' y1='0' x2='0' y2='64' stroke='%2310b981' stroke-width='0.3' opacity='0.1'/%3E%3C/svg%3E")`

// Seal: clean parchment / red ink on white — elegant, uniform
const SEAL_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23fff7ed'/%3E%3Crect x='3' y='3' width='58' height='58' rx='3' fill='none' stroke='%23dc2626' stroke-width='1' opacity='0.3'/%3E%3Crect x='7' y='7' width='50' height='50' rx='2' fill='none' stroke='%23dc2626' stroke-width='0.4' opacity='0.2'/%3E%3C/svg%3E")`

const SCRIPT_CONFIGS: ScriptConfig[] = [
  {
    key: 'oracle',
    label: '甲骨文',
    period: '商·约公元前14世纪',
    bgSvg: ORACLE_BG,
    // Scratched, thin, angular — simulate by: high contrast, slight roughness
    glyphFilter: 'contrast(2.5) brightness(0.3) sepia(0.8)',
    fontSize: 'text-3xl',
    charColor: '#92400e',
    wrapperClass: 'border-amber-300 bg-amber-50',
    labelClass: 'text-amber-700',
  },
  {
    key: 'bronze',
    label: '金文',
    period: '西周·约公元前10世纪',
    bgSvg: BRONZE_BG,
    // Cast bronze — luminous on dark patina background
    glyphFilter: 'drop-shadow(0 0 3px #6ee7b7) brightness(1.8)',
    fontSize: 'text-3xl',
    charColor: '#d1fae5',
    wrapperClass: 'border-emerald-800 bg-emerald-950',
    labelClass: 'text-emerald-300',
  },
  {
    key: 'seal',
    label: '小篆',
    period: '秦·约公元前221年',
    bgSvg: SEAL_BG,
    // Red seal ink — vibrant crimson on warm paper
    glyphFilter: 'contrast(1.3) saturate(2) hue-rotate(330deg) brightness(0.85)',
    fontSize: 'text-3xl',
    charColor: '#dc2626',
    wrapperClass: 'border-red-200 bg-orange-50',
    labelClass: 'text-red-700',
  },
]

function AncientGlyphCard({
  char,
  config,
  description,
}: {
  char: string
  config: ScriptConfig
  description: string
}) {
  const isBronze = config.key === 'bronze'

  return (
    <div className={cn('rounded-xl border-2 overflow-hidden flex flex-col', config.wrapperClass)}>
      {/* Glyph area with era-specific background texture */}
      <div
        className="relative flex items-center justify-center"
        style={{
          background: config.bgSvg,
          backgroundSize: 'cover',
          height: 72,
        }}
      >
        {/* The character rendered with era-specific CSS filter */}
        <span
          style={{
            color: config.charColor,
            filter: config.glyphFilter,
            fontSize: 36,
            fontFamily: '"Noto Serif SC", "Source Han Serif CN", "SimSun", serif',
            fontWeight: isBronze ? 900 : 700,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            display: 'block',
            userSelect: 'none',
            // Oracle: slight skew to mimic hand-carved marks
            // Bronze: bold and upright
            // Seal: slightly elongated / condensed
            transform:
              config.key === 'oracle'
                ? 'skewX(-4deg) scaleY(0.95)'
                : config.key === 'seal'
                ? 'scaleY(1.15) scaleX(0.9)'
                : 'none',
          }}
        >
          {char}
        </span>

        {/* Decorative era badge */}
        <div
          className={cn(
            'absolute top-1 right-1 text-[8px] font-bold px-1 py-0.5 rounded leading-none',
            isBronze ? 'bg-emerald-700 text-emerald-100' : 'bg-white/70 text-gray-600',
          )}
        >
          {config.period.split('·')[0]}
        </div>
      </div>

      {/* Label + description */}
      <div className="px-2 py-2 flex-1 space-y-1">
        <div className={cn('text-[11px] font-bold leading-none', config.labelClass)}>
          {config.label}
          <span className={cn('ml-1 font-normal opacity-70', config.labelClass, 'text-[9px]')}>
            {config.period.split('·')[1]}
          </span>
        </div>
        <p className={cn('text-[10px] leading-snug', isBronze ? 'text-emerald-200' : 'text-gray-500')}>
          {description}
        </p>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export const CharacterAnalysis: React.FC<CharacterAnalysisProps> = ({ characters, className }) => {
  return (
    <div className={cn('space-y-5', className)}>
      {characters.map((char, index) => {
        const gradient = WUXING_GRADIENTS[char.wuxing] ?? DEFAULT_GRADIENT
        const hasEtymology = char.etymology && (char.etymology.oracle || char.etymology.bronze || char.etymology.seal)

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

            {/* ── 字源字形 ─── */}
            {char.kangxi.original && (
              <>
                <div className="h-px bg-gray-100 mx-5" />
                <div className="px-5 py-4 space-y-4">
                  {/* Kangxi original text */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1 h-3.5 rounded-full bg-stone-400 inline-block" />
                      <h4 className="text-sm font-bold text-gray-800">字源字形</h4>
                      <span className="text-xs text-stone-400 ml-auto">《康熙字典》</span>
                    </div>
                    <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
                      <p className="text-xs text-stone-700 leading-loose font-serif tracking-wide whitespace-pre-wrap">
                        {char.kangxi.original}
                      </p>
                    </div>
                  </div>

                  {/* Ancient script evolution cards */}
                  {hasEtymology && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-600">字形演变</span>
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] text-gray-400">商 → 周 → 秦</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {SCRIPT_CONFIGS.map((config) => {
                          const desc = char.etymology?.[config.key]
                          if (!desc) return null
                          return (
                            <AncientGlyphCard
                              key={config.key}
                              char={char.char}
                              config={config}
                              description={desc}
                            />
                          )
                        })}
                      </div>
                      {char.etymology?.evolution && (
                        <div className="flex gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <span className="text-sm shrink-0">🔄</span>
                          <p className="text-xs text-gray-600 leading-relaxed">{char.etymology.evolution}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
