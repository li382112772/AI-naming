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
  { key: 'fire', label: '火', color: '#ef4444', valueKey: 'fireValue' as const },
  { key: 'earth', label: '土', color: '#d97706', valueKey: 'earthValue' as const },
  { key: 'gold', label: '金', color: '#eab308', valueKey: 'goldValue' as const },
  { key: 'water', label: '水', color: '#3b82f6', valueKey: 'waterValue' as const },
  { key: 'wood', label: '木', color: '#22c55e', valueKey: 'woodValue' as const },
]

const SIZE = 200
const CENTER = SIZE / 2
const RADIUS = 70
const LABEL_RADIUS = RADIUS + 24

// Convert polar angle to cartesian coords
// Start from top (-90deg) and go clockwise
function polarToCartesian(
  angleDeg: number,
  radius: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  }
}

// Generate polygon points string for SVG
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

// Grid ring polygon
function gridRingPoints(ratio: number, count: number): string {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i
    const { x, y } = polarToCartesian(angle, RADIUS * ratio)
    return `${x},${y}`
  }).join(' ')
}

export const WuxingChart: React.FC<WuxingChartProps> = ({
  wuxing,
  className,
}) => {
  const values = useMemo(
    () => ELEMENTS.map((e) => wuxing[e.valueKey] || 0),
    [wuxing]
  )

  const maxValue = useMemo(() => {
    const max = Math.max(...values)
    // Use a nice round max: at least 50, round up to nearest 25
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

          {/* Axis lines from center to each vertex */}
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

          {/* Data points (dots) */}
          {values.map((v, i) => {
            const angle = (360 / 5) * i
            const ratio = Math.max(v, 0) / maxValue
            const { x, y } = polarToCartesian(angle, RADIUS * ratio)
            return (
              <motion.circle
                key={ELEMENTS[i].key}
                cx={x}
                cy={y}
                r={3.5}
                fill={ELEMENTS[i].color}
                stroke="white"
                strokeWidth={1.5}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
              />
            )
          })}

          {/* Labels: element name + value */}
          {ELEMENTS.map((el, i) => {
            const angle = (360 / 5) * i
            const { x, y } = polarToCartesian(angle, LABEL_RADIUS)
            const value = values[i]
            return (
              <g key={el.key}>
                <text
                  x={x}
                  y={y - 5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-bold"
                  fill={el.color}
                >
                  {el.label}
                </text>
                <text
                  x={x}
                  y={y + 9}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px]"
                  fill="#6b7280"
                >
                  {value}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
