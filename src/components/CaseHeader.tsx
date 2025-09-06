import { CaseWithDetails } from '@/types/database'
import { 
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'

interface CaseHeaderProps {
  case: CaseWithDetails
}

const statusColors = {
  nouveau: 'bg-blue-100 text-blue-800 border-blue-200',
  en_cours: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  repondu: 'bg-green-100 text-green-800 border-green-200',
  resolu: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  ferme: 'bg-gray-100 text-gray-800 border-gray-200',
}

const statusLabels = {
  nouveau: 'Nouveau',
  en_cours: 'En cours d\'analyse',
  repondu: 'Répondu par un expert',
  resolu: 'Situation résolue',
  ferme: 'Dossier fermé',
}

const categoryLabels = {
  blessure_aile: 'Blessure à l\'aile',
  blessure_patte: 'Blessure à la patte',
  emmele: 'Emmêlé (fils, filets)',
  comportement_anormal: 'Comportement anormal',
  oisillon: 'Oisillon trouvé',
  autre: 'Autre situation',
}

export function CaseHeader({ case: caseItem }: CaseHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {caseItem.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {new Date(caseItem.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            {caseItem.updated_at !== caseItem.created_at && (
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Mis à jour le {new Date(caseItem.updated_at).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[caseItem.status]}`}>
          {statusLabels[caseItem.status]}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Category */}
          {caseItem.category && (
            <div className="flex items-start">
              <TagIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Catégorie</dt>
                <dd className="text-sm text-gray-900">
                  {categoryLabels[caseItem.category]}
                </dd>
              </div>
            </div>
          )}

          {/* Location */}
          {caseItem.address && (
            <div className="flex items-start">
              <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Localisation</dt>
                <dd className="text-sm text-gray-900">
                  {caseItem.address}
                </dd>
              </div>
            </div>
          )}

          {/* Description */}
          {caseItem.description && (
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">Description</dt>
              <dd className="text-sm text-gray-900 whitespace-pre-wrap">
                {caseItem.description}
              </dd>
            </div>
          )}
        </div>

        {/* Photos */}
        {caseItem.photos && caseItem.photos.length > 0 && (
          <div>
            <dt className="text-sm font-medium text-gray-500 mb-3">Photos du signalement</dt>
            <dd className="grid grid-cols-2 gap-3">
              {caseItem.photos.map((photo, index) => (
                <div key={photo.id} className="relative">
                  <img
                    src={photo.photo_url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      // Open in modal or new tab
                      window.open(photo.photo_url, '_blank')
                    }}
                  />
                </div>
              ))}
            </dd>
          </div>
        )}
      </div>

      {/* Status help */}
      {caseItem.status === 'nouveau' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            📋 Votre signalement a été reçu. Un expert va l&apos;examiner et vous répondre rapidement.
          </p>
        </div>
      )}

      {caseItem.status === 'en_cours' && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-800">
            🔍 Un expert examine actuellement votre signalement. Restez attentif aux messages ci-dessous.
          </p>
        </div>
      )}

      {caseItem.status === 'repondu' && (
        <div className="mt-4 p-3 bg-green-50 rounded-md">
          <p className="text-sm text-green-800">
            💬 Un expert a répondu à votre signalement. Consultez les messages ci-dessous pour voir ses conseils.
          </p>
        </div>
      )}
    </div>
  )
}