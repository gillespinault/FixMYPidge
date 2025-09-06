import { useEffect, useRef } from 'react'
import { MessageWithPhotos } from '@/types/database'
import { UserIcon, AcademicCapIcon } from '@heroicons/react/24/solid'

interface MessageListProps {
  messages: MessageWithPhotos[]
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun message pour le moment
          </h3>
          <p className="text-gray-500">
            Un expert va bientôt examiner votre signalement et vous donner des conseils.
            <br />
            Vous pouvez aussi poser une question ou ajouter des informations.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender_type === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`flex max-w-xs lg:max-w-md ${
              message.sender_type === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 ${
                message.sender_type === 'user' ? 'ml-2' : 'mr-2'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender_type === 'user'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {message.sender_type === 'user' ? (
                  <UserIcon className="w-5 h-5" />
                ) : (
                  <AcademicCapIcon className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* Message bubble */}
            <div
              className={`rounded-lg px-4 py-2 ${
                message.sender_type === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              {/* Sender label */}
              <div
                className={`text-xs mb-1 ${
                  message.sender_type === 'user'
                    ? 'text-emerald-100'
                    : 'text-gray-500'
                }`}
              >
                {message.sender_type === 'user' ? 'Vous' : 'Expert'}
              </div>

              {/* Message content */}
              <div className="text-sm whitespace-pre-wrap">
                {message.content}
              </div>

              {/* Photos if any */}
              {message.photos && message.photos.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.photo_url}
                      alt="Photo du message"
                      className="max-w-48 rounded cursor-pointer hover:opacity-90"
                      onClick={() => window.open(photo.photo_url, '_blank')}
                    />
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`text-xs mt-1 ${
                  message.sender_type === 'user'
                    ? 'text-emerald-100'
                    : 'text-gray-400'
                }`}
              >
                {new Date(message.created_at).toLocaleString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: 'numeric',
                  month: 'short'
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}