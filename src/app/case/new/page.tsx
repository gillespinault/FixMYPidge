'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useCaseStore } from '@/store/case-store'
import { CaseCategory } from '@/types/database'
import { MapComponent } from '@/components/MapComponent'
import { PhotoUpload } from '@/components/PhotoUpload'
import { 
  ArrowLeftIcon, 
  MapPinIcon,
  PhotoIcon 
} from '@heroicons/react/24/outline'

const categories: { value: CaseCategory; label: string }[] = [
  { value: 'blessure_aile', label: 'Blessure à l\'aile' },
  { value: 'blessure_patte', label: 'Blessure à la patte' },
  { value: 'emmele', label: 'Emmêlé (fils, filets)' },
  { value: 'comportement_anormal', label: 'Comportement anormal' },
  { value: 'oisillon', label: 'Oisillon trouvé' },
  { value: 'autre', label: 'Autre situation' },
]

export default function NewCasePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { createCase, uploadCasePhoto } = useCaseStore()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as CaseCategory | '',
    location: null as { lat: number; lng: number } | null,
    address: '',
  })
  const [photos, setPhotos] = useState<File[]>([])

  const handleLocationSelect = (location: { lat: number; lng: number }, address: string) => {
    setFormData(prev => ({ ...prev, location, address }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.location) return
    
    setLoading(true)
    try {
      const caseData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null,
        location: `POINT(${formData.location.lng} ${formData.location.lat})`,
        address: formData.address || null,
      }

      const caseId = await createCase(caseData)

      // Upload photos if any
      for (const photo of photos) {
        await uploadCasePhoto(caseId, photo)
      }

      router.push(`/case/${caseId}`)
    } catch (error) {
      console.error('Error creating case:', error)
      alert('Erreur lors de la création du signalement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Nouveau signalement
            </h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Informations générales
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titre du signalement *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: Pigeon blessé dans le parc"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Catégorie
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as CaseCategory }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description détaillée
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Décrivez la situation, l'état de l'oiseau, les circonstances..."
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              <MapPinIcon className="inline h-5 w-5 mr-2" />
              Localisation *
            </h2>
            
            <MapComponent
              onLocationSelect={handleLocationSelect}
              selectedLocation={formData.location}
            />
            
            {formData.address && (
              <div className="mt-3 text-sm text-gray-600">
                <MapPinIcon className="inline h-4 w-4 mr-1" />
                {formData.address}
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              <PhotoIcon className="inline h-5 w-5 mr-2" />
              Photos
            </h2>
            
            <PhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={5}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title || !formData.location}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer le signalement'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}