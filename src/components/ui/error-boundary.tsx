import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AIValidationError } from '@/utils/ai-validation'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallbackTitle?: string
  onRetry?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    this.props.onRetry?.()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const isValidationError =
      this.state.error instanceof AIValidationError

    const title = isValidationError
      ? 'AI 响应格式异常'
      : this.props.fallbackTitle || '加载出错了'

    const description = isValidationError
      ? 'AI 返回的数据不符合预期格式，请重试或稍后再试。'
      : '发生了意外错误，请重试。'

    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
        </div>
        <h3 className="font-semibold text-red-800">{title}</h3>
        <p className="text-sm text-red-600">{description}</p>
        <button
          onClick={this.handleRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-full transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重试
        </button>
      </div>
    )
  }
}
