import { create } from 'zustand';
import { BaziAnalysis, NameDetail } from '@/types';
import { getBaziAnalysisPrompt, getNameGenerationPrompt, getNameAnalysisPrompt } from '@/lib/prompts';
import { BaziAnalysisSchema, NameListSchema, NameDetailSchema } from '@/lib/schemas';
import { validateAIResponse } from '@/utils/ai-validation';
import { useSessions } from './useSessions';

// Mock delay for simulation (remove in production)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data for MVP (since we don't have real AI API key yet)
const MOCK_BAZI: BaziAnalysis = {
  bazi: {
    yearPillar: '甲辰', monthPillar: '丙寅', dayPillar: '戊午', hourPillar: '壬子',
    yearWuxing: '木土', monthWuxing: '火木', dayWuxing: '土火', hourWuxing: '水水',
    yearCanggan: '乙戊癸', monthCanggan: '甲丙戊', dayCanggan: '丁己', hourCanggan: '癸',
    yearNayin: '覆灯火', monthNayin: '炉中火', dayNayin: '天上火', hourNayin: '桑松木',
    benming: '龙'
  },
  wuxing: {
    gold: 1, wood: 3, water: 2, fire: 2, earth: 1,
    goldValue: 10, woodValue: 35, waterValue: 25, fireValue: 20, earthValue: 10,
    xiyong: ['火', '土'], jiyong: ['金', '水'],
    rizhu: '戊', rizhuWuxing: '土',
    tonglei: ['土', '火'], yilei: ['金', '水', '木'],
    tongleiScore: 40, yileiScore: 60, wangshuai: '身弱'
  },
  analysis: 'AI 模拟分析结果：此命造身弱，喜火土。',
  suggestion: '建议起名选用五行属火、土的字。'
};

interface AIState {
  isGeneratingBazi: boolean;
  isGeneratingNames: boolean;
  error: string | null;

  generateBazi: () => Promise<BaziAnalysis>;
  generateNames: (style: string) => Promise<NameDetail[]>;
}

export const useAI = create<AIState>((set, get) => ({
  isGeneratingBazi: false,
  isGeneratingNames: false,
  error: null,

  generateBazi: async () => {
    set({ isGeneratingBazi: true, error: null });
    const { sessions, currentSessionId, updateSession } = useSessions.getState();
    const session = sessions.find(s => s.id === currentSessionId);

    if (!session) {
      set({ isGeneratingBazi: false, error: 'No active session' });
      throw new Error('No active session');
    }

    try {
      // 1. Prepare Prompt (for real API call later)
      const prompt = getBaziAnalysisPrompt(session.babyInfo);
      console.log('Generating Bazi with prompt:', prompt);

      // 2. Simulate API Call (Replace with real fetch later)
      await delay(2000); 
      const mockResponse = JSON.stringify(MOCK_BAZI);

      // 3. Validate
      const data = validateAIResponse(mockResponse, BaziAnalysisSchema);

      // 4. Update Session
      await updateSession(session.id, { baziAnalysis: data });

      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI generation failed';
      set({ error: msg });
      throw err;
    } finally {
      set({ isGeneratingBazi: false });
    }
  },

  generateNames: async (style: string) => {
    set({ isGeneratingNames: true, error: null });
    const { sessions, currentSessionId, updateSession } = useSessions.getState();
    const session = sessions.find(s => s.id === currentSessionId);

    if (!session || !session.baziAnalysis) {
      set({ isGeneratingNames: false, error: 'Missing session or Bazi analysis' });
      throw new Error('Missing session or Bazi analysis');
    }

    try {
      // 1. Prepare Prompt
      const baziSummary = `喜用神：${session.baziAnalysis.wuxing.xiyong.join(',')}`;
      const prompt = getNameGenerationPrompt(session.babyInfo, baziSummary, style, 6);
      console.log('Generating Names with prompt:', prompt);

      // 2. Simulate API Call
      await delay(2500);
      
      // Mock Names
      const mockNames: NameDetail[] = Array(6).fill(null).map((_, i) => ({
        id: `name-${Date.now()}-${i}`,
        name: i === 0 ? '沐泽' : `备选${i}`,
        pinyin: 'mù zé',
        characters: [],
        meaning: '模拟AI生成的寓意...',
        source: '模拟出处',
        wuxing: '水水',
        baziMatch: '大吉',
        score: 90 + i,
        uniqueness: '中',
        uniquenessCount: '1000+',
        yinyun: { tone: '平仄', initials: 'mz', score: 90, analysis: '好听' },
        personalizedMeaning: '专属解读...',
        isLocked: i > 0 // Lock all except first
      }));

      const mockResponse = JSON.stringify(mockNames);

      // 3. Validate
      const data = validateAIResponse(mockResponse, NameListSchema);

      // 4. Update Session (Replace names for this style instead of append)
      // Check if this style (or all) is already unlocked in session
      const isUnlocked = session.unlockedSeries?.includes('all') || session.unlockedSeries?.includes(style);

      const processedData = data.map((n, i) => ({
        ...n,
        id: `name-${Date.now()}-${i}`,
        isLocked: isUnlocked ? false : i > 0, // Respect unlocked status
        style // Attach the requested style
      }));

      // Filter out existing names of the same style to avoid duplicates/infinite append
      const existingNames = session.names || [];
      const otherStyleNames = existingNames.filter(n => n.style !== style);
      
      await updateSession(session.id, { 
        names: [...otherStyleNames, ...processedData] 
      });

      return processedData;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI generation failed';
      set({ error: msg });
      throw err;
    } finally {
      set({ isGeneratingNames: false });
    }
  }
}));
