import Link from 'next/link'
import { CaseWithDetails } from '@/types/database'
import { 
  ClockIcon, 
  MapPinIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline'

interface CaseCardProps {
  case: CaseWithDetails
}

const statusColors = {
  nouveau: 'bg-blue-100 text-blue-800',
  en_cours: 'bg-yellow-100 text-yellow-800',
  repondu: 'bg-green-100 text-green-800',
  resolu: 'bg-emerald-100 text-emerald-800',
  ferme: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  repondu: 'Répondu',
  resolu: 'Résolu',
  ferme: 'Fermé',
}

export function CaseCard({ case: caseItem }: CaseCardProps) {
  const messageCount = caseItem.messages?.length || 0
  const hasUnread = (caseItem.unread_count || 0) > 0
  
  return (
    <Link href={`/case/${caseItem.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {caseItem.title}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[caseItem.status]}`}>
              {statusLabels[caseItem.status]}
            </span>
          </div>

          {/* Description */}
          {caseItem.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {caseItem.description}
            </p>
          )}

          {/* Location */}
          {caseItem.address && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span className="truncate">{caseItem.address}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>
                {new Date(caseItem.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {messageCount > 0 && (
              <div className="flex items-center text-sm text-gray-500">
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                <span>{messageCount}</span>
                {hasUnread && (
                  <span className="ml-1 h-2 w-2 bg-emerald-500 rounded-full"></span>
                )}
              </div>
            )}
          </div>

          {/* Photo preview */}
          {caseItem.photos && caseItem.photos.length > 0 && (
            <div className="mt-4">
              <img
                src={caseItem.photos[0].photo_url}
                alt="Aperçu du signalement"
                className="w-full h-32 object-cover rounded-md"
              />
              {caseItem.photos.length > 1 && (
                <div className="mt-2 text-xs text-gray-500">
                  +{caseItem.photos.length - 1} autre{caseItem.photos.length > 2 ? 's' : ''} photo{caseItem.photos.length > 2 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}