'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useCaseStore } from '@/store/case-store'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { MessageList } from '@/components/MessageList'
import { MessageInput } from '@/components/MessageInput'
import { CaseHeader } from '@/components/CaseHeader'
import { 
  ArrowLeftIcon, 
} from '@heroicons/react/24/outline'

export default function CaseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const caseId = params.id as string
  const { currentCase, loading, fetchCase, sendMessage } = useCaseStore()
  const [messageLoading, setMessageLoading] = useState(false)

  useEffect(() => {
    if (caseId) {
      fetchCase(caseId)
    }
  }, [caseId, fetchCase])

  const handleSendMessage = async (content: string) => {
    if (!caseId) return
    
    setMessageLoading(true)
    try {
      await sendMessage(caseId, content)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Erreur lors de l\'envoi du message')
    } finally {
      setMessageLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!currentCase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Signalement introuvable
          </h2>
          <p className="text-gray-600 mb-4">
            Ce signalement n&apos;existe pas ou vous n&apos;y avez pas accès.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {currentCase.title}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Case details */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <CaseHeader case={currentCase} />
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-medium text-gray-900">Conversation</h2>
            <p className="text-sm text-gray-500">
              Échangez avec nos experts pour obtenir de l&apos;aide
            </p>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <MessageList 
              messages={currentCase.messages || []} 
            />
            
            <MessageInput 
              onSendMessage={handleSendMessage}
              loading={messageLoading}
              disabled={currentCase.status === 'ferme'}
            />
          </div>
        </div>
      </div>

      <div className="h-6"></div> {/* Bottom spacing */}
    </div>
  )
}