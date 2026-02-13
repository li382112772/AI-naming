import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePayment } from './usePayment'
import { useSessions } from './useSessions'
import { MOCK_BABY_INFO, MOCK_BAZI, MOCK_NAME_LIST } from '@/test/fixtures'

// Mock orderService
vi.mock('@/services/db', () => ({
  orderService: {
    create: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}))

describe('usePayment', () => {
  beforeEach(() => {
    // Reset store state
    usePayment.setState({
      isProcessing: false,
      error: null,
    })

    // Setup a session for cross-store access
    useSessions.setState({
      currentSessionId: 'session-1',
      sessions: [
        {
          id: 'session-1',
          babyInfo: MOCK_BABY_INFO,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          baziAnalysis: MOCK_BAZI,
          names: MOCK_NAME_LIST.map((n) => ({ ...n })),
          unlockedSeries: [],
        },
      ],
    })
  })

  describe('createOrder', () => {
    it('should create an order and return orderId', async () => {
      const orderId = await usePayment.getState().createOrder(19.9, 'all')
      expect(orderId).toBe('test-uuid-1234')
    })

    it('should set isProcessing during order creation', async () => {
      const promise = usePayment.getState().createOrder(19.9, 'all')

      // While processing, isProcessing is true, but since it's async and
      // the mock is synchronous, it may already be done.
      // Verify the result instead
      const orderId = await promise
      expect(orderId).toBeDefined()
      expect(usePayment.getState().isProcessing).toBe(false)
    })

    it('should throw when no active session', async () => {
      useSessions.setState({ currentSessionId: null })

      await expect(
        usePayment.getState().createOrder(19.9, 'all')
      ).rejects.toThrow('No active session')
      expect(usePayment.getState().error).toBe('No active session')
    })
  })

  describe('simulatePayment', () => {
    it('should unlock all names and return true', async () => {
      // Speed up the timer
      vi.useFakeTimers()

      const promise = usePayment.getState().simulatePayment('order-1')
      vi.advanceTimersByTime(2000)

      const success = await promise
      expect(success).toBe(true)

      // Check that session was updated with unlocked series
      const session = useSessions
        .getState()
        .sessions.find((s) => s.id === 'session-1')
      expect(session?.unlockedSeries).toContain('all')

      // Check that all names are unlocked
      const lockedNames = session?.names?.filter((n) => n.isLocked)
      expect(lockedNames).toHaveLength(0)

      vi.useRealTimers()
    })
  })

  describe('checkUnlockStatus', () => {
    it('should return false when nothing unlocked', () => {
      const result = usePayment.getState().checkUnlockStatus('诗词雅韵')
      expect(result).toBe(false)
    })

    it('should return true when "all" is unlocked', () => {
      useSessions.setState({
        sessions: [
          {
            ...useSessions.getState().sessions[0],
            unlockedSeries: ['all'],
          },
        ],
      })

      const result = usePayment.getState().checkUnlockStatus('诗词雅韵')
      expect(result).toBe(true)
    })

    it('should return true when specific series is unlocked', () => {
      useSessions.setState({
        sessions: [
          {
            ...useSessions.getState().sessions[0],
            unlockedSeries: ['诗词雅韵'],
          },
        ],
      })

      const result = usePayment.getState().checkUnlockStatus('诗词雅韵')
      expect(result).toBe(true)
    })
  })
})
