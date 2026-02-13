import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAI } from './useAI'
import { useSessions } from './useSessions'
import { MOCK_BABY_INFO, MOCK_BAZI, MOCK_NAME_LIST } from '@/test/fixtures'

// Mock the AI service module
vi.mock('@/services/ai', () => ({
  isConfigured: vi.fn(() => true),
  analyzeBazi: vi.fn(),
  generateNames: vi.fn(),
}))

const aiService = await import('@/services/ai')

describe('useAI', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset AI store
    useAI.setState({
      isGeneratingBazi: false,
      isGeneratingNames: false,
      error: null,
    })

    // Setup a session
    useSessions.setState({
      currentSessionId: 'session-1',
      sessions: [
        {
          id: 'session-1',
          babyInfo: MOCK_BABY_INFO,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      updateSession: vi.fn().mockResolvedValue(undefined),
    })
  })

  describe('generateBazi', () => {
    it('should call AI service and return bazi analysis', async () => {
      vi.mocked(aiService.analyzeBazi).mockResolvedValueOnce(
        JSON.stringify(MOCK_BAZI)
      )

      const result = await useAI.getState().generateBazi()

      expect(aiService.analyzeBazi).toHaveBeenCalledWith(MOCK_BABY_INFO)
      expect(result.bazi.yearPillar).toBe('甲辰')
      expect(result.wuxing.xiyong).toEqual(['火', '土'])
    })

    it('should return cached analysis if already exists (6.8)', async () => {
      // Set session to already have bazi analysis
      useSessions.setState({
        sessions: [
          {
            id: 'session-1',
            babyInfo: MOCK_BABY_INFO,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            baziAnalysis: MOCK_BAZI,
          },
        ],
      })

      const result = await useAI.getState().generateBazi()

      // Should NOT call AI service
      expect(aiService.analyzeBazi).not.toHaveBeenCalled()
      expect(result).toEqual(MOCK_BAZI)
    })

    it('should fallback to mock when API is not configured', async () => {
      vi.mocked(aiService.isConfigured).mockReturnValueOnce(false)

      const result = await useAI.getState().generateBazi()

      expect(aiService.analyzeBazi).not.toHaveBeenCalled()
      // Should still return valid bazi data (from MOCK_BAZI fallback)
      expect(result.bazi).toBeDefined()
      expect(result.wuxing).toBeDefined()
    })

    it('should fallback to mock when API call fails', async () => {
      vi.mocked(aiService.isConfigured).mockReturnValueOnce(true)
      vi.mocked(aiService.analyzeBazi).mockRejectedValueOnce(
        new Error('Network error')
      )

      const result = await useAI.getState().generateBazi()

      // Should fallback gracefully
      expect(result.bazi).toBeDefined()
      expect(result.wuxing).toBeDefined()
    })

    it('should set error state when no session exists', async () => {
      useSessions.setState({
        currentSessionId: null,
        sessions: [],
      })

      await expect(useAI.getState().generateBazi()).rejects.toThrow(
        'No active session'
      )
      expect(useAI.getState().error).toBe('No active session')
    })
  })

  describe('generateNames', () => {
    it('should call AI service and return processed names', async () => {
      // Need baziAnalysis for the summary
      useSessions.setState({
        sessions: [
          {
            id: 'session-1',
            babyInfo: MOCK_BABY_INFO,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            baziAnalysis: MOCK_BAZI,
          },
        ],
      })

      vi.mocked(aiService.generateNames).mockResolvedValueOnce(
        JSON.stringify(MOCK_NAME_LIST)
      )

      const result = await useAI.getState().generateNames('诗词雅韵')

      expect(aiService.generateNames).toHaveBeenCalledOnce()
      expect(result).toHaveLength(MOCK_NAME_LIST.length)
      // First name should be unlocked, rest locked
      expect(result[0].isLocked).toBe(false)
      if (result.length > 1) {
        expect(result[1].isLocked).toBe(true)
      }
    })

    it('should throw when baziAnalysis is missing', async () => {
      await expect(
        useAI.getState().generateNames('诗词雅韵')
      ).rejects.toThrow('Missing session or Bazi analysis')
    })
  })
})
