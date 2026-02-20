import { Solar } from 'lunar-typescript'

export interface LunarDate {
  lunarYear: string     // e.g. "甲辰年"
  lunarMonth: string    // e.g. "二月"
  lunarDay: string      // e.g. "初三"
  isLeapMonth: boolean
  fullText: string      // e.g. "甲辰年二月初三"
}

/**
 * Convert a solar date string (YYYY-MM-DD) to Chinese lunar date info.
 */
export function solarToLunar(dateStr: string): LunarDate | null {
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    if (!y || !m || !d) return null

    const solar = Solar.fromYmd(y, m, d)
    const lunar = solar.getLunar()

    const lunarYear = lunar.getYearInGanZhi() + '年'
    const isLeapMonth = lunar.getMonth() < 0
    const lunarMonth = (isLeapMonth ? '闰' : '') + lunar.getMonthInChinese() + '月'
    const lunarDay = lunar.getDayInChinese()
    const fullText = `${lunarYear}${lunarMonth}${lunarDay}`

    return { lunarYear, lunarMonth, lunarDay, isLeapMonth, fullText }
  } catch {
    return null
  }
}

/**
 * Format a solar date string (YYYY-MM-DD) to a readable Chinese format.
 * e.g. "2024年3月15日"
 */
export function formatSolarDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return dateStr
  return `${y}年${m}月${d}日`
}

/**
 * Map birth time (HH:mm) to the Chinese 时辰 (2-hour period).
 */
export function getShichen(timeStr: string): string {
  if (!timeStr) return ''
  const [h] = timeStr.split(':').map(Number)
  const shichenMap: [number, number, string][] = [
    [23, 1, '子时 (23:00-01:00)'],
    [1, 3, '丑时 (01:00-03:00)'],
    [3, 5, '寅时 (03:00-05:00)'],
    [5, 7, '卯时 (05:00-07:00)'],
    [7, 9, '辰时 (07:00-09:00)'],
    [9, 11, '巳时 (09:00-11:00)'],
    [11, 13, '午时 (11:00-13:00)'],
    [13, 15, '未时 (13:00-15:00)'],
    [15, 17, '申时 (15:00-17:00)'],
    [17, 19, '酉时 (17:00-19:00)'],
    [19, 21, '戌时 (19:00-21:00)'],
    [21, 23, '亥时 (21:00-23:00)'],
  ]

  for (const [start, end, label] of shichenMap) {
    if (start === 23) {
      if (h >= 23 || h < 1) return label
    } else if (h >= start && h < end) {
      return label
    }
  }
  return timeStr
}
