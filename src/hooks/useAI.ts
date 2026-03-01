import { create } from 'zustand'
import { BaziAnalysis, NameDetail } from '@/types'
import {
  BaziAnalysisSchema,
  NameListResponseSchema,
  NameDetailSchema,
} from '@/lib/schemas'
import { validateAIResponse } from '@/utils/ai-validation'
import { useSessions } from './useSessions'
import * as aiService from '@/services/ai'

// --- Helper: build bazi summary string from session ---

function buildBaziSummary(session: { baziAnalysis?: BaziAnalysis | null }) {
  const ba = session.baziAnalysis
  if (!ba) return ''
  return `喜用神：${ba.wuxing.xiyong.join('，')}；忌用神：${ba.wuxing.jiyong.join('，')}；日主：${ba.wuxing.rizhu}（${ba.wuxing.rizhuWuxing}）；${ba.wuxing.wangshuai}`
}

// --- Zustand Store ---

interface AIState {
  isGeneratingBazi: boolean
  isGeneratingNames: boolean
  isGeneratingDetail: boolean
  error: string | null
  retryAction: (() => Promise<void>) | null
  retryCount: number

  generateBazi: () => Promise<BaziAnalysis>
  generateNames: (style: string) => Promise<NameDetail[]>
  generateNameDetail: (nameId: string) => Promise<NameDetail>
  retry: () => Promise<void>
  clearError: () => void
}

export const useAI = create<AIState>((set, get) => ({
  isGeneratingBazi: false,
  isGeneratingNames: false,
  isGeneratingDetail: false,
  error: null,
  retryAction: null,
  retryCount: 0,

  clearError: () => set({ error: null, retryAction: null, retryCount: 0 }),

  retry: async () => {
    const { retryAction, retryCount } = get()
    if (!retryAction) return
    if (retryCount >= 1) {
      // Already retried once — show terminal message
      set({
        retryAction: null,
        error: '多次尝试均失败，请检查网络连接后稍后再试。',
      })
      return
    }
    set({ error: null, retryCount: retryCount + 1 })
    try {
      await retryAction()
    } catch {
      // Error is already set by the retried action
    }
  },

  generateBazi: async () => {
    set({
      isGeneratingBazi: true,
      error: null,
      retryAction: null,
      retryCount: 0,
    })
    const { sessions, currentSessionId, updateSession } =
      useSessions.getState()
    const session = sessions.find((s) => s.id === currentSessionId)

    if (!session) {
      set({ isGeneratingBazi: false, error: '没有活动会话' })
      throw new Error('No active session')
    }

    // Cache hit: return existing analysis without re-calling API
    if (session.baziAnalysis) {
      set({ isGeneratingBazi: false })
      return session.baziAnalysis
    }

    // Pre-check API key
    if (!aiService.isConfigured()) {
      const errMsg = 'AI 服务未配置，请在 .env 文件中设置 VITE_DEEPSEEK_API_KEY'
      set({
        isGeneratingBazi: false,
        error: errMsg,
        retryAction: async () => {
          await useAI.getState().generateBazi()
        },
      })
      throw new Error(errMsg)
    }

    try {
      const responseString = await aiService.analyzeBazi(session.babyInfo)
      const data = validateAIResponse(responseString, BaziAnalysisSchema)
      await updateSession(session.id, { baziAnalysis: data })
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : '八字分析失败'
      set({
        error: `八字分析失败：${message}`,
        retryAction: async () => {
          await useAI.getState().generateBazi()
        },
      })
      throw err
    } finally {
      set({ isGeneratingBazi: false })
    }
  },

  generateNames: async (style: string) => {
    set({
      isGeneratingNames: true,
      error: null,
      retryAction: null,
      retryCount: 0,
    })
    const { sessions, currentSessionId, updateSession } =
      useSessions.getState()
    const session = sessions.find((s) => s.id === currentSessionId)

    if (!session || !session.baziAnalysis) {
      set({
        isGeneratingNames: false,
        error: '缺少会话或八字分析数据',
      })
      throw new Error('Missing session or Bazi analysis')
    }

    // Pre-check API key
    if (!aiService.isConfigured()) {
      const errMsg = 'AI 服务未配置，请在 .env 文件中设置 VITE_DEEPSEEK_API_KEY'
      set({
        isGeneratingNames: false,
        error: errMsg,
        retryAction: async () => {
          await useAI.getState().generateNames(style)
        },
      })
      throw new Error(errMsg)
    }

    try {
      const baziSummary = buildBaziSummary(session)

      const responseString = await aiService.generateNameList(
        session.babyInfo,
        baziSummary,
        style,
      )

      const data = validateAIResponse(responseString, NameListResponseSchema)

      // Check if this style (or all) is already unlocked
      const isUnlocked =
        session.unlockedSeries?.includes('all') ||
        session.unlockedSeries?.includes(style)

      const lastName = session.babyInfo.lastName

      // Build featured name (full detail)
      const featuredName: NameDetail = {
        ...data.featured,
        id: `name-${Date.now()}-0`,
        lastName,
        hasFullDetail: true,
        isLocked: false, // First name is always free
        style,
      }

      // Build summary names (no character details)
      const summaryNames: NameDetail[] = data.others.map((summary, i) => ({
        ...summary,
        id: `name-${Date.now()}-${i + 1}`,
        lastName,
        characters: [], // Empty — detail not yet loaded
        hasFullDetail: false,
        isLocked: isUnlocked ? false : true,
        style,
      }))

      const allNames = [featuredName, ...summaryNames]

      // Replace names for this style (keep other styles intact)
      const existingNames = session.names || []
      const otherStyleNames = existingNames.filter((n) => n.style !== style)

      await updateSession(session.id, {
        names: [...otherStyleNames, ...allNames],
      })

      return allNames
    } catch (err) {
      const message = err instanceof Error ? err.message : '名字生成失败'
      set({
        error: `名字生成失败：${message}`,
        retryAction: async () => {
          await useAI.getState().generateNames(style)
        },
      })
      throw err
    } finally {
      set({ isGeneratingNames: false })
    }
  },

  generateNameDetail: async (nameId: string) => {
    set({ isGeneratingDetail: true, error: null })
    const { sessions, currentSessionId, updateSession } =
      useSessions.getState()
    const session = sessions.find((s) => s.id === currentSessionId)

    if (!session || !session.baziAnalysis) {
      set({ isGeneratingDetail: false, error: '缺少会话数据' })
      throw new Error('Missing session data')
    }

    const existingName = session.names?.find((n) => n.id === nameId)
    if (!existingName) {
      set({ isGeneratingDetail: false, error: '未找到该名字' })
      throw new Error('Name not found')
    }

    // Already has full detail — return immediately
    if (existingName.hasFullDetail && existingName.characters.length > 0) {
      set({ isGeneratingDetail: false })
      return existingName
    }

    // Pre-check API key
    if (!aiService.isConfigured()) {
      const errMsg = 'AI 服务未配置，请在 .env 文件中设置 VITE_DEEPSEEK_API_KEY'
      set({
        isGeneratingDetail: false,
        error: errMsg,
        retryAction: async () => {
          await useAI.getState().generateNameDetail(nameId)
        },
      })
      throw new Error(errMsg)
    }

    try {
      const baziSummary = buildBaziSummary(session)

      const responseString = await aiService.generateNameDetail(
        existingName.name,
        session.babyInfo,
        baziSummary,
      )

      const detailData = validateAIResponse(responseString, NameDetailSchema)

      // Merge detail into existing name, preserving client-side fields
      const updatedName: NameDetail = {
        ...existingName,
        characters: detailData.characters,
        hasFullDetail: true,
        // Optionally enrich with potentially richer AI-generated fields
        meaning: detailData.meaning || existingName.meaning,
        baziMatch: detailData.baziMatch || existingName.baziMatch,
        personalizedMeaning:
          detailData.personalizedMeaning || existingName.personalizedMeaning,
      }

      // Update in session
      const updatedNames = (session.names || []).map((n) =>
        n.id === nameId ? updatedName : n,
      )
      await updateSession(session.id, { names: updatedNames })

      return updatedName
    } catch (err) {
      const message = err instanceof Error ? err.message : '名字详情加载失败'
      set({
        error: `名字详情加载失败：${message}`,
        retryAction: async () => {
          await useAI.getState().generateNameDetail(nameId)
        },
      })
      throw err
    } finally {
      set({ isGeneratingDetail: false })
    }
  },
}))
