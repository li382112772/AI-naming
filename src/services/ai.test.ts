import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MOCK_BABY_INFO, MOCK_BAZI, MOCK_NAME_LIST } from '@/test/fixtures'

// Mock import.meta.env
vi.stubEnv('VITE_DEEPSEEK_API_KEY', 'sk-test-key-12345')

// Mock the OpenAI client
const mockCreate = vi.fn()

vi.mock('openai', () => {
  class MockAPIError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
      this.name = 'APIError'
    }
  }
  return {
    default: class {
      chat = { completions: { create: mockCreate } }
      constructor() {}
      static APIError = MockAPIError
    },
  }
})

// Must import AFTER mocks are set up
const { analyzeBazi, generateNames, analyzeName, isConfigured } = await import(
  './ai'
)

describe('AI Service', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  describe('isConfigured', () => {
    it('should return true when API key is set', () => {
      expect(isConfigured()).toBe(true)
    })
  })

  describe('analyzeBazi', () => {
    it('should call OpenAI and return raw JSON string', async () => {
      const mockResponse = JSON.stringify(MOCK_BAZI)
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: mockResponse } }],
      })

      const result = await analyzeBazi(MOCK_BABY_INFO)
      expect(result).toBe(mockResponse)
      expect(mockCreate).toHaveBeenCalledOnce()

      // Verify the call shape
      const callArgs = mockCreate.mock.calls[0][0]
      expect(callArgs.model).toBe('deepseek-chat')
      expect(callArgs.response_format).toEqual({ type: 'json_object' })
      expect(callArgs.messages).toHaveLength(2)
      expect(callArgs.messages[0].role).toBe('system')
      expect(callArgs.messages[1].role).toBe('user')
    })

    it('should throw when AI returns empty content', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      })

      await expect(analyzeBazi(MOCK_BABY_INFO)).rejects.toThrow(
        'AI 返回了空响应'
      )
    })
  })

  describe('generateNames', () => {
    it('should call OpenAI with correct parameters', async () => {
      const mockResponse = JSON.stringify(MOCK_NAME_LIST)
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: mockResponse } }],
      })

      const result = await generateNames(
        MOCK_BABY_INFO,
        '喜火土',
        '诗词雅韵',
        6
      )

      expect(result).toBe(mockResponse)
      expect(mockCreate).toHaveBeenCalledOnce()

      const callArgs = mockCreate.mock.calls[0][0]
      expect(callArgs.temperature).toBe(0.8)
    })
  })

  describe('analyzeName', () => {
    it('should call OpenAI for single name analysis', async () => {
      const mockResponse = JSON.stringify(MOCK_NAME_LIST[0])
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: mockResponse } }],
      })

      const result = await analyzeName('煜宸', MOCK_BABY_INFO)
      expect(result).toBe(mockResponse)
      expect(mockCreate).toHaveBeenCalledOnce()
    })
  })

  describe('withRetry (via analyzeBazi)', () => {
    it('should retry on 5xx errors and succeed', async () => {
      const error5xx = new Error('Server error')
      ;(error5xx as any).status = 500

      mockCreate
        .mockRejectedValueOnce(error5xx)
        .mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(MOCK_BAZI) } }],
        })

      const result = await analyzeBazi(MOCK_BABY_INFO)
      expect(result).toBe(JSON.stringify(MOCK_BAZI))
      expect(mockCreate).toHaveBeenCalledTimes(2)
    })

    it('should NOT retry on 4xx errors (thrown by OpenAI.APIError)', async () => {
      // Import the mocked module to use MockAPIError
      const OpenAI = (await import('openai')).default
      const apiError = new (OpenAI as any).APIError(401, 'Unauthorized')

      mockCreate.mockRejectedValueOnce(apiError)

      await expect(analyzeBazi(MOCK_BABY_INFO)).rejects.toThrow()
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })
  })
})
