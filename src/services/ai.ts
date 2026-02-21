import OpenAI from 'openai'
import { BabyInfo } from '@/types'
import {
  getBaziAnalysisPrompt,
  getNameGenerationPrompt,
  getNameListPrompt,
  getNameDetailPrompt,
  getNameAnalysisPrompt,
} from '@/lib/prompts'

// --- Client initialization ---

const client = new OpenAI({
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com',
  dangerouslyAllowBrowser: true, // 前端直连（仅演示，生产建议走代理）
})

const MODEL = 'deepseek-chat'
const MAX_RETRIES = 2
const BASE_DELAY = 1000

// --- Retry helper (exponential backoff) ---

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry on 4xx client errors (auth, bad request, rate limit)
      if (
        error instanceof OpenAI.APIError &&
        error.status !== undefined &&
        error.status >= 400 &&
        error.status < 500
      ) {
        throw error
      }

      // Wait before retrying (exponential backoff)
      if (attempt < retries - 1) {
        const delayMs = BASE_DELAY * Math.pow(2, attempt)
        console.warn(
          `AI request failed (attempt ${attempt + 1}/${retries}), retrying in ${delayMs}ms...`,
          (error as Error).message
        )
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }

  throw lastError!
}

// --- Core API call helper ---

async function chatCompletion(
  system: string,
  user: string,
  temperature = 0.7,
  timeoutMs = 30000,
): Promise<string> {
  const response = await client.chat.completions.create(
    {
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature,
      response_format: { type: 'json_object' },
    },
    {
      timeout: timeoutMs,
    },
  )

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('AI 返回了空响应')
  }

  return content
}

// --- Public API ---

/**
 * 调用 AI 分析八字命理
 * 返回原始 JSON 字符串，由调用方做 Zod 校验
 */
export async function analyzeBazi(info: BabyInfo): Promise<string> {
  const { system, user } = getBaziAnalysisPrompt(info)
  return withRetry(() => chatCompletion(system, user, 0.7, 30000))
}

/**
 * 调用 AI 生成名字列表（1 个完整 + 5 个摘要）
 * 返回原始 JSON 字符串 { featured: NameDetail, others: NameSummary[] }
 */
export async function generateNameList(
  info: BabyInfo,
  baziSummary: string,
  style: string,
): Promise<string> {
  const { system, user } = getNameListPrompt(info, baziSummary, style)
  return withRetry(() => chatCompletion(system, user, 0.8, 45000))
}

/**
 * 调用 AI 生成单个名字的完整详情（按需加载）
 * 返回原始 JSON 字符串（NameDetail 对象）
 */
export async function generateNameDetail(
  name: string,
  info: BabyInfo,
  baziSummary: string,
): Promise<string> {
  const { system, user } = getNameDetailPrompt(name, info, baziSummary)
  return withRetry(() => chatCompletion(system, user, 0.7, 30000))
}

/**
 * 调用 AI 生成名字列表（旧版，6 个完整详情）
 * @deprecated 使用 generateNameList() 代替
 */
export async function generateNames(
  info: BabyInfo,
  baziSummary: string,
  style: string,
  count: number = 6,
): Promise<string> {
  const { system, user } = getNameGenerationPrompt(
    info,
    baziSummary,
    style,
    count,
  )
  return withRetry(() => chatCompletion(system, user, 0.8, 45000))
}

/**
 * 调用 AI 深度解析单个名字
 * 返回原始 JSON 字符串（NameDetail 对象）
 */
export async function analyzeName(
  name: string,
  info: BabyInfo,
): Promise<string> {
  const { system, user } = getNameAnalysisPrompt(name, info)
  return withRetry(() => chatCompletion(system, user, 0.7, 30000))
}

// --- Utility ---

/**
 * 检查 DeepSeek API key 是否已配置
 */
export function isConfigured(): boolean {
  const key = import.meta.env.VITE_DEEPSEEK_API_KEY
  return !!key && key !== 'sk-your-deepseek-api-key-here'
}
