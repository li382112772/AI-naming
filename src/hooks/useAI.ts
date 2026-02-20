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
  analysis: 'AI 模拟分析结果：此命造身弱，喜火土。日主戊土，生于寅月，木旺克土，火土为喜用，金水为忌。',
  suggestion: '建议起名选用五行属火、土的字，字形宜含日、山、火、土部首。',
  suggestedStyles: [
    {
      id: 'shici_yayun',
      title: '诗词雅韵',
      desc: '取自《诗经》《楚辞》',
      longDesc: '经典诗词意境，文雅含蓄，底蕴深厚',
      colorTheme: 'emerald' as const,
      rationale: '喜用火土，诗词中火意象丰富，契合命格',
    },
    {
      id: 'shanhe_daqi',
      title: '山河大气',
      desc: '如山川壮阔，气宇轩昂',
      longDesc: '取自名山大川，气势磅礴，宏伟壮阔',
      colorTheme: 'blue' as const,
      rationale: '土主厚重，山河之名与土行相合',
    },
    {
      id: 'xiandai_jianyue',
      title: '现代简约',
      desc: '时尚悦耳，朗朗上口',
      longDesc: '符合现代审美，简洁清新，易记好听',
      colorTheme: 'amber' as const,
      rationale: '喜用火，现代用字中光明寓意丰富',
    },
  ],
}

const createMockNames = (nameLength: number = 2): NameDetail[] => {
  const twoCharNames = [
    { name: '沐泽', pinyin: 'mù zé', chars: ['沐', '泽'], charPinyins: ['mù', 'zé'], charWuxing: ['水', '水'], charStrokes: [8, 17], charPages: ['第523页', '第891页'], charOriginals: ['【沐】《说文》濯发也。从水木声。', '【泽】《说文》光润也。从水睪声。'], sources: ['《诗经·卫风》', '《楚辞·离骚》'], wuxing: '水水', score: 95 },
    { name: '煜宸', pinyin: 'yù chén', chars: ['煜', '宸'], charPinyins: ['yù', 'chén'], charWuxing: ['火', '土'], charStrokes: [13, 10], charPages: ['第669页', '第298页'], charOriginals: ['【煜】《玉篇》盛明貌。从火昱声，光耀也。', '【宸】《说文》屋宇也。引申为帝王所居。'], sources: ['《文选》', '《诗经·大雅》'], wuxing: '火土', score: 93 },
    { name: '晨曦', pinyin: 'chén xī', chars: ['晨', '曦'], charPinyins: ['chén', 'xī'], charWuxing: ['火', '火'], charStrokes: [11, 20], charPages: ['第498页', '第512页'], charOriginals: ['【晨】《说文》早昧爽也。从臼辰声。', '【曦】《广韵》日光也。从日羲声，晨光初现。'], sources: ['《诗经·齐风》', '《文选·曹植》'], wuxing: '火火', score: 91 },
    { name: '瑾瑜', pinyin: 'jǐn yú', chars: ['瑾', '瑜'], charPinyins: ['jǐn', 'yú'], charWuxing: ['土', '土'], charStrokes: [15, 13], charPages: ['第741页', '第738页'], charOriginals: ['【瑾】《说文》美玉也。从玉堇声，质地温润。', '【瑜】《说文》瑾瑜，美玉也。从玉俞声。'], sources: ['《离骚》', '《礼记》'], wuxing: '火火', score: 89 },
    { name: '梓轩', pinyin: 'zǐ xuān', chars: ['梓', '轩'], charPinyins: ['zǐ', 'xuān'], charWuxing: ['木', '土'], charStrokes: [11, 10], charPages: ['第526页', '第1241页'], charOriginals: ['【梓】《说文》楸也。从木宰声。梓为百木之王。', '【轩】《说文》曲輈藩车也。引申为高扬气宇。'], sources: ['《诗经·小雅》', '《楚辞》'], wuxing: '木土', score: 87 },
    { name: '逸飞', pinyin: 'yì fēi', chars: ['逸', '飞'], charPinyins: ['yì', 'fēi'], charWuxing: ['土', '水'], charStrokes: [11, 9], charPages: ['第1257页', '第1578页'], charOriginals: ['【逸】《说文》失也。从辵兔声。引申为超逸洒脱。', '【飞】《说文》鸟翥也。象形，取翱翔高远之意。'], sources: ['《庄子》', '《诗经》'], wuxing: '土水', score: 85 },
  ]
  const threeCharNames = [
    { name: '沐晨曦', pinyin: 'mù chén xī', chars: ['沐', '晨', '曦'], charPinyins: ['mù', 'chén', 'xī'], charWuxing: ['水', '火', '火'], charStrokes: [8, 11, 20], charPages: ['第523页', '第498页', '第512页'], charOriginals: ['【沐】《说文》濯发也。从水木声。', '【晨】《说文》早昧爽也。从臼辰声。', '【曦】《广韵》日光也。从日羲声。'], sources: ['《诗经》', '《诗经·齐风》', '《文选》'], wuxing: '水火火', score: 95 },
    { name: '煜承宸', pinyin: 'yù chéng chén', chars: ['煜', '承', '宸'], charPinyins: ['yù', 'chéng', 'chén'], charWuxing: ['火', '火', '土'], charStrokes: [13, 8, 10], charPages: ['第669页', '第266页', '第298页'], charOriginals: ['【煜】《玉篇》盛明貌。从火昱声。', '【承】《说文》奉也。从手从卩从廾。', '【宸】《说文》屋宇也。引申为帝王所居。'], sources: ['《文选》', '《诗经》', '《诗经·大雅》'], wuxing: '火火土', score: 93 },
    { name: '晨瑾曦', pinyin: 'chén jǐn xī', chars: ['晨', '瑾', '曦'], charPinyins: ['chén', 'jǐn', 'xī'], charWuxing: ['火', '土', '火'], charStrokes: [11, 15, 20], charPages: ['第498页', '第741页', '第512页'], charOriginals: ['【晨】《说文》早昧爽也。', '【瑾】《说文》美玉也。从玉堇声。', '【曦】《广韵》日光也。'], sources: ['《诗经》', '《离骚》', '《文选》'], wuxing: '火土火', score: 91 },
    { name: '瑾瑜辉', pinyin: 'jǐn yú huī', chars: ['瑾', '瑜', '辉'], charPinyins: ['jǐn', 'yú', 'huī'], charWuxing: ['土', '土', '火'], charStrokes: [15, 13, 13], charPages: ['第741页', '第738页', '第672页'], charOriginals: ['【瑾】《说文》美玉也。', '【瑜】《说文》瑾瑜，美玉也。', '【辉】《说文》光也。从光军声。'], sources: ['《离骚》', '《礼记》', '《诗经》'], wuxing: '土土火', score: 89 },
    { name: '梓轩朗', pinyin: 'zǐ xuān lǎng', chars: ['梓', '轩', '朗'], charPinyins: ['zǐ', 'xuān', 'lǎng'], charWuxing: ['木', '土', '火'], charStrokes: [11, 10, 10], charPages: ['第526页', '第1241页', '第501页'], charOriginals: ['【梓】《说文》楸也。梓为百木之王。', '【轩】《说文》曲輈藩车也。', '【朗】《说文》明也。从月良声。'], sources: ['《诗经·小雅》', '《楚辞》', '《文选》'], wuxing: '木土火', score: 87 },
    { name: '逸云飞', pinyin: 'yì yún fēi', chars: ['逸', '云', '飞'], charPinyins: ['yì', 'yún', 'fēi'], charWuxing: ['土', '水', '水'], charStrokes: [11, 4, 9], charPages: ['第1257页', '第171页', '第1578页'], charOriginals: ['【逸】《说文》失也。引申为超逸洒脱。', '【云】《说文》山川气也。象形。', '【飞】《说文》鸟翥也。象形。'], sources: ['《庄子》', '《诗经》', '《诗经》'], wuxing: '土水水', score: 85 },
  ]

  const names = nameLength === 3 ? threeCharNames : twoCharNames
  return names.map((n, i) => ({
    id: `mock-name-${Date.now()}-${i}`,
    name: n.name,
    pinyin: n.pinyin,
    characters: n.chars.map((char, ci) => ({
      char,
      pinyin: n.charPinyins[ci],
      wuxing: n.charWuxing[ci],
      meaning: `${char}，${n.charWuxing[ci]}行，取高雅之意`,
      explanation: `字形从${char === '沐' ? '水' : char === '煜' ? '火' : '木'}，${n.charOriginals[ci].split('。')[1] || '意蕴深远，寓意美好'}`,
      source: n.sources[ci],
      kangxi: {
        strokes: n.charStrokes[ci],
        page: n.charPages[ci],
        original: n.charOriginals[ci],
      },
    })),
    meaning: `${n.name}，取${n.sources[0]}之意，寓意${i % 2 === 0 ? '光明磊落，前程似锦' : '温润如玉，才华横溢'}`,
    source: n.sources[0],
    wuxing: n.wuxing,
    baziMatch: '与八字喜用神高度契合，补益火土之力，化解水木过旺之弊。',
    score: n.score,
    uniqueness: ['低', '较低', '中', '中', '较低', '低'][i],
    uniquenessCount: `${(i + 1) * 300}+`,
    yinyun: {
      tone: ['仄仄', '仄平', '平仄', '仄仄', '仄平', '仄仄'][i],
      initials: n.pinyin.split(' ').map(p => p[0]).join(''),
      score: 90 - i,
      analysis: '声调搭配和谐，声母富于变化，朗朗上口，悦耳动听。',
    },
    personalizedMeaning: `专属解读：此名与宝宝八字相合，${n.wuxing.includes('火') ? '火行助力，光明前途' : '五行调和，平衡圆满'}，愿${n.chars[0]}${n.chars[nameLength === 3 ? 2 : 1]}伴其一生。`,
    isLocked: i > 0,
  }))
}

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

      if (!aiService.isConfigured()) {
        throw new Error('未配置 VITE_DEEPSEEK_API_KEY，请在 .env 文件中设置')
      }
      responseString = await aiService.analyzeBazi(session.babyInfo)

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

      const nameLength = session.babyInfo.nameLength ?? 2
      let responseString: string

      if (!aiService.isConfigured()) {
        throw new Error('未配置 VITE_DEEPSEEK_API_KEY，请在 .env 文件中设置')
      }
      responseString = await aiService.generateNames(
        session.babyInfo,
        baziSummary,
        style,
        6
      )

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
