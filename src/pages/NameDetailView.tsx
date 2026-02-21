import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSessions } from '@/hooks/useSessions'
import { useAI } from '@/hooks/useAI'
import { NameDetailPage as NameDetailComponent } from '@/components/naming/NameDetailPage'
import { AIGenerating } from '@/components/ui/ai-generating'
import { ErrorModal } from '@/components/ui/error-modal'

export const NameDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions } = useSessions()
  const { isGeneratingDetail } = useAI()
  const [error, setError] = useState<string | null>(null)
  const [retried, setRetried] = useState(false)

  // Find name across all sessions (reactive — updates when session updates)
  let foundName = null
  for (const session of sessions) {
    if (session.names) {
      const name = session.names.find((n) => n.id === id)
      if (name) {
        foundName = name
        break
      }
    }
  }

  // Trigger detail loading if needed
  useEffect(() => {
    if (
      foundName &&
      !foundName.hasFullDetail &&
      !isGeneratingDetail &&
      !error
    ) {
      const { generateNameDetail } = useAI.getState()
      generateNameDetail(foundName.id!).catch((err) => {
        setError(err instanceof Error ? err.message : '加载失败')
      })
    }
  }, [foundName?.id, foundName?.hasFullDetail, isGeneratingDetail, error])

  if (!foundName) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        未找到该名字
      </div>
    )
  }

  // Show loading while fetching detail
  if (!foundName.hasFullDetail) {
    if (isGeneratingDetail) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <AIGenerating
            message="正在加载详细解析..."
            className="bg-white rounded-2xl"
          />
        </div>
      )
    }
    if (error) {
      return (
        <ErrorModal
          isOpen
          message={error}
          onRetry={
            retried
              ? undefined
              : () => {
                  setRetried(true)
                  setError(null)
                  const { generateNameDetail } = useAI.getState()
                  generateNameDetail(foundName!.id!).catch((err) =>
                    setError(
                      err instanceof Error ? err.message : '加载失败',
                    ),
                  )
                }
          }
          onClose={() => navigate(-1)}
        />
      )
    }
    // Detail is being triggered by the useEffect; show loading
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <AIGenerating
          message="正在加载详细解析..."
          className="bg-white rounded-2xl"
        />
      </div>
    )
  }

  return (
    <NameDetailComponent name={foundName} onBack={() => navigate(-1)} />
  )
}
