import { create } from 'zustand'
import { BaziAnalysis, NameDetail } from '@/types'
import { BaziAnalysisSchema, NameListSchema } from '@/lib/schemas'
import { validateAIResponse } from '@/utils/ai-validation'
import { useSessions } from './useSessions'
import * as aiService from '@/services/ai'

// Mock delay for fallback simulation
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// --- Mock Data (fallback when API key is not configured or API fails) ---

const MOCK_BAZI: BaziAnalysis = {
  bazi: {
    yearPillar: '甲辰',
    monthPillar: '丙寅',
    dayPillar: '戊午',
    hourPillar: '壬子',
    yearWuxing: '木土',
    monthWuxing: '火木',
    dayWuxing: '土火',
    hourWuxing: '水水',
    yearCanggan: '乙戊癸',
    monthCanggan: '甲丙戊',
    dayCanggan: '丁己',
    hourCanggan: '癸',
    yearNayin: '覆灯火',
    monthNayin: '炉中火',
    dayNayin: '天上火',
    hourNayin: '桑松木',
    benming: '龙',
  },
  wuxing: {
    gold: 1,
    wood: 3,
    water: 2,
    fire: 2,
    earth: 1,
    goldValue: 10,
    woodValue: 35,
    waterValue: 25,
    fireValue: 20,
    earthValue: 10,
    xiyong: ['火', '土'],
    jiyong: ['金', '水'],
    rizhu: '戊',
    rizhuWuxing: '土',
    tonglei: ['土', '火'],
    yilei: ['金', '水', '木'],
    tongleiScore: 40,
    yileiScore: 60,
    wangshuai: '身弱',
  },
  analysis: 'AI 模拟分析结果：此命造身弱，喜火土。',
  suggestion: '建议起名选用五行属火、土的字。',
}

const createMockNames = (): NameDetail[] =>
  Array(6)
    .fill(null)
    .map((_, i) => ({
      id: `mock-name-${Date.now()}-${i}`,
      name: ['沐泽', '煜宸', '晨曦', '瑾瑜', '梓轩', '逸飞'][i],
      pinyin: ['mù zé', 'yù chén', 'chén xī', 'jǐn yú', 'zǐ xuān', 'yì fēi'][i],
      characters: [
        {
          char: ['沐泽', '煜宸', '晨曦', '瑾瑜', '梓轩', '逸飞'][i][0],
          pinyin: ['mù', 'yù', 'chén', 'jǐn', 'zǐ', 'yì'][i],
          wuxing: ['水', '火', '火', '火', '木', '土'][i],
          meaning: '模拟字义解释',
          explanation: '模拟详细解释',
          source: '《说文解字》',
          kangxi: { strokes: 8, page: '第523页', original: '模拟原文' },
        },
        {
          char: ['沐泽', '煜宸', '晨曦', '瑾瑜', '梓轩', '逸飞'][i][1],
          pinyin: ['zé', 'chén', 'xī', 'yú', 'xuān', 'fēi'][i],
          wuxing: ['水', '土', '火', '火', '土', '水'][i],
          meaning: '模拟字义解释',
          explanation: '模拟详细解释',
          source: '《康熙字典》',
          kangxi: { strokes: 10, page: '第891页', original: '模拟原文' },
        },
      ],
      meaning: '模拟AI生成的寓意解读...',
      source: '《诗经·大雅》',
      wuxing: ['水水', '火土', '火火', '火火', '木土', '土水'][i],
      baziMatch: '与八字喜用神高度契合，补益火土之力。',
      score: 95 - i * 2,
      uniqueness: ['低', '较低', '中', '中', '较低', '低'][i],
      uniquenessCount: `${(i + 1) * 500}+`,
      yinyun: {
        tone: '仄仄',
        initials: 'mz',
        score: 90 - i,
        analysis: '声调搭配和谐，朗朗上口。',
      },
      personalizedMeaning: '模拟专属寓意解读...',
      isLocked: i > 0,
    }))

// --- Zustand Store ---

interface AIState {
  isGeneratingBazi: boolean
  isGeneratingNames: boolean
  error: string | null

  generateBazi: () => Promise<BaziAnalysis>
  generateNames: (style: string) => Promise<NameDetail[]>
}

export const useAI = create<AIState>((set) => ({
  isGeneratingBazi: false,
  isGeneratingNames: false,
  error: null,

  generateBazi: async () => {
    set({ isGeneratingBazi: true, error: null })
    const { sessions, currentSessionId, updateSession } =
      useSessions.getState()
    const session = sessions.find((s) => s.id === currentSessionId)

    if (!session) {
      set({ isGeneratingBazi: false, error: 'No active session' })
      throw new Error('No active session')
    }

    // Cache hit: return existing analysis without re-calling API (6.8)
    if (session.baziAnalysis) {
      set({ isGeneratingBazi: false })
      return session.baziAnalysis
    }

    try {
      let responseString: string

      if (aiService.isConfigured()) {
        try {
          responseString = await aiService.analyzeBazi(session.babyInfo)
        } catch (err) {
          console.warn(
            'AI API 调用失败，降级使用模拟数据：',
            (err as Error).message
          )
          await delay(1500)
          responseString = JSON.stringify(MOCK_BAZI)
        }
      } else {
        console.warn('未配置 VITE_DEEPSEEK_API_KEY，使用模拟数据')
        await delay(2000)
        responseString = JSON.stringify(MOCK_BAZI)
      }

      // Validate with Zod schema
      const data = validateAIResponse(responseString, BaziAnalysisSchema)

      // Update Session
      await updateSession(session.id, { baziAnalysis: data })

      return data
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI 生成失败'
      set({ error: msg })
      throw err
    } finally {
      set({ isGeneratingBazi: false })
    }
  },

  generateNames: async (style: string) => {
    set({ isGeneratingNames: true, error: null })
    const { sessions, currentSessionId, updateSession } =
      useSessions.getState()
    const session = sessions.find((s) => s.id === currentSessionId)

    if (!session || !session.baziAnalysis) {
      set({
        isGeneratingNames: false,
        error: 'Missing session or Bazi analysis',
      })
      throw new Error('Missing session or Bazi analysis')
    }

    try {
      // Build a richer bazi summary for the AI prompt
      const baziSummary = `喜用神：${session.baziAnalysis.wuxing.xiyong.join('，')}；忌用神：${session.baziAnalysis.wuxing.jiyong.join('，')}；日主：${session.baziAnalysis.wuxing.rizhu}（${session.baziAnalysis.wuxing.rizhuWuxing}）；${session.baziAnalysis.wuxing.wangshuai}`

      let responseString: string

      if (aiService.isConfigured()) {
        try {
          responseString = await aiService.generateNames(
            session.babyInfo,
            baziSummary,
            style,
            6
          )
        } catch (err) {
          console.warn(
            'AI API 调用失败，降级使用模拟数据：',
            (err as Error).message
          )
          await delay(1500)
          responseString = JSON.stringify(createMockNames())
        }
      } else {
        console.warn('未配置 VITE_DEEPSEEK_API_KEY，使用模拟数据')
        await delay(2500)
        responseString = JSON.stringify(createMockNames())
      }

      // Validate with Zod schema
      const data = validateAIResponse(responseString, NameListSchema)

      // Check if this style (or all) is already unlocked
      const isUnlocked =
        session.unlockedSeries?.includes('all') ||
        session.unlockedSeries?.includes(style)

      const processedData = data.map((n, i) => ({
        ...n,
        id: `name-${Date.now()}-${i}`,
        isLocked: isUnlocked ? false : i > 0,
        style,
      }))

      // Replace names for this style (keep other styles intact)
      const existingNames = session.names || []
      const otherStyleNames = existingNames.filter((n) => n.style !== style)

      await updateSession(session.id, {
        names: [...otherStyleNames, ...processedData],
      })

      return processedData
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI 生成失败'
      set({ error: msg })
      throw err
    } finally {
      set({ isGeneratingNames: false })
    }
  },
}))
