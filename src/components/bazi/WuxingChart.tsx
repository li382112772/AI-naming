import React, { useMemo } from 'react'
import { BaziAnalysis } from '@/types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface WuxingChartProps {
  wuxing: BaziAnalysis['wuxing']
  className?: string
}

// Five elements in clockwise order starting from top
const ELEMENTS = [
  { key: 'fire', label: '火', color: '#ef4444', dimColor: '#fecaca', valueKey: 'fireValue' as const, countKey: 'fire' as const },
  { key: 'earth', label: '土', color: '#d97706', dimColor: '#fde68a', valueKey: 'earthValue' as const, countKey: 'earth' as const },
  { key: 'gold', label: '金', color: '#ca8a04', dimColor: '#fef08a', valueKey: 'goldValue' as const, countKey: 'gold' as const },
  { key: 'water', label: '水', color: '#3b82f6', dimColor: '#bfdbfe', valueKey: 'waterValue' as const, countKey: 'water' as const },
  { key: 'wood', label: '木', color: '#22c55e', dimColor: '#bbf7d0', valueKey: 'woodValue' as const, countKey: 'wood' as const },
]

const SIZE = 220
const CENTER = SIZE / 2
const RADIUS = 72
const LABEL_RADIUS = RADIUS + 30

function polarToCartesian(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  }
}

function polygonPoints(values: number[], maxValue: number): string {
  return values
    .map((v, i) => {
      const angle = (360 / values.length) * i
      const ratio = Math.max(v, 0) / maxValue
      const { x, y } = polarToCartesian(angle, RADIUS * ratio)
      return `${x},${y}`
    })
    .join(' ')
}

function gridRingPoints(ratio: number, count: number): string {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i
    const { x, y } = polarToCartesian(angle, RADIUS * ratio)
    return `${x},${y}`
  }).join(' ')
}

export const WuxingChart: React.FC<WuxingChartProps> = ({ wuxing, className }) => {
  const values = useMemo(() => ELEMENTS.map((e) => wuxing[e.valueKey] || 0), [wuxing])
  const counts = useMemo(() => ELEMENTS.map((e) => wuxing[e.countKey] || 0), [wuxing])

  const maxValue = useMemo(() => {
    const max = Math.max(...values)
    return max <= 50 ? 50 : Math.ceil(max / 25) * 25
  }, [values])

  const dataPoints = polygonPoints(values, maxValue)
  const gridLevels = [0.25, 0.5, 0.75, 1.0]

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-semibold text-gray-600">五行力量图</h4>

      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          className="overflow-visible"
        >
          {/* Grid rings */}
          {gridLevels.map((ratio) => (
            <polygon
              key={ratio}
              points={gridRingPoints(ratio, 5)}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={ratio === 1 ? 1 : 0.5}
            />
          ))}

          {/* Axis lines */}
          {ELEMENTS.map((_, i) => {
            const angle = (360 / 5) * i
            const { x, y } = polarToCartesian(angle, RADIUS)
            return (
              <line
                key={i}
                x1={CENTER}
                y1={CENTER}
                x2={x}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
            )
          })}

          {/* Data polygon — animated */}
          <motion.polygon
            points={dataPoints}
            fill="rgba(245, 158, 11, 0.15)"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
          />

          {/* Data points (dots) with xiyong/jiyong coloring */}
          {values.map((v, i) => {
            const angle = (360 / 5) * i
            const ratio = Math.max(v, 0) / maxValue
            const { x, y } = polarToCartesian(angle, RADIUS * ratio)
            const el = ELEMENTS[i]
            const isXiyong = wuxing.xiyong.includes(el.label)
            const isJiyong = wuxing.jiyong.includes(el.label)
            const dotColor = isXiyong ? '#f59e0b' : isJiyong ? '#ef4444' : el.color
            return (
              <motion.circle
                key={el.key}
                cx={x}
                cy={y}
                r={isXiyong || isJiyong ? 5 : 3.5}
                fill={dotColor}
                stroke="white"
                strokeWidth={1.5}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
              />
            )
          })}

          {/* Labels: element name + count + value */}
          {ELEMENTS.map((el, i) => {
            const angle = (360 / 5) * i
            const { x, y } = polarToCartesian(angle, LABEL_RADIUS)
            const value = values[i]
            const count = counts[i]
            const isXiyong = wuxing.xiyong.includes(el.label)
            const isJiyong = wuxing.jiyong.includes(el.label)
            const labelColor = isXiyong ? '#d97706' : isJiyong ? '#dc2626' : el.color

            return (
              <g key={el.key}>
                {/* Element name */}
                <text
                  x={x}
                  y={y - 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="bold"
                  fill={labelColor}
                >
                  {el.label}
                  {isXiyong && ' ✦'}
                  {isJiyong && ' ✗'}
                </text>
                {/* Count */}
                <text
                  x={x}
                  y={y + 6}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {count}个·{value}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          喜用神 ✦
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          忌用神 ✗
        </span>
      </div>
    </div>
  )
}
