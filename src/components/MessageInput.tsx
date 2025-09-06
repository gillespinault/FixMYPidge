'use client'

import { useState, useRef } from 'react'
import { PaperAirplaneIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  loading?: boolean
  disabled?: boolean
}

export function MessageInput({ onSendMessage, loading = false, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !loading && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  if (disabled) {
    return (
      <div className="border-t border-gray-200 p-4">
        <div className="text-center text-sm text-gray-500 py-4">
          💚 Ce dossier est fermé. Merci d&apos;avoir utilisé FixMyPidge !
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Posez une question ou donnez plus d'informations..."
            disabled={loading}
            rows={1}
            className="block w-full resize-none border border-gray-300 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Photo button */}
        <button
          type="button"
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <PhotoIcon className="w-5 h-5" />
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || loading}
          className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <PaperAirplaneIcon className="w-5 h-5" />
          )}
        </button>
      </form>
      
      <div className="mt-2 text-xs text-gray-500">
        💡 Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
      </div>
    </div>
  )
}