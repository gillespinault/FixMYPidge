'use client'

import { useRef } from 'react'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface PhotoUploadProps {
  photos: File[]
  onPhotosChange: (photos: File[]) => void
  maxPhotos?: number
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 5 }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newPhotos = [...photos, ...files].slice(0, maxPhotos)
    onPhotosChange(newPhotos)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
  }

  const getPreviewUrl = (file: File) => {
    return URL.createObjectURL(file)
  }

  return (
    <div className="space-y-4">
      {/* Upload button */}
      {photos.length < maxPhotos && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PhotoIcon className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">
              Ajouter des photos
            </span>
            <span className="text-xs text-gray-400">
              {photos.length}/{maxPhotos} photos
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={getPreviewUrl(photo)}
                alt={`Photo ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
              <div className="absolute bottom-1 left-1 right-1">
                <div className="text-xs text-white bg-black bg-opacity-50 px-1 py-0.5 rounded truncate">
                  {photo.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="text-xs text-gray-500">
        <p>💡 Conseils pour de bonnes photos :</p>
        <ul className="mt-1 space-y-1 ml-4">
          <li>• Montrez clairement l&apos;état de l&apos;oiseau</li>
          <li>• Photographiez l&apos;environnement proche</li>
          <li>• Évitez les photos floues</li>
        </ul>
      </div>
    </div>
  )
}