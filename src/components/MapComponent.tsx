'use client'

import { useEffect, useRef, useState } from 'react'
import { reverseGeocode } from '@/lib/supabase'

interface MapComponentProps {
  onLocationSelect: (location: { lat: number; lng: number }, address: string) => void
  selectedLocation?: { lat: number; lng: number } | null
  height?: string
}

export function MapComponent({ 
  onLocationSelect, 
  selectedLocation,
  height = '300px' 
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<unknown>(null)
  const marker = useRef<unknown>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const handleLocationClick = async (location: { lat: number; lng: number }) => {
    try {
      const address = await reverseGeocode(location.lat, location.lng)
      onLocationSelect(location, address)
    } catch (error) {
      console.error('Geocoding error:', error)
      onLocationSelect(location, `${location.lat}, ${location.lng}`)
    }
  }

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          
          // Auto-select user location if no location selected yet
          if (!selectedLocation) {
            handleLocationClick(location)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          // Default to Brussels if geolocation fails
          const defaultLocation = { lat: 50.8476, lng: 4.3572 }
          setUserLocation(defaultLocation)
          if (!selectedLocation) {
            handleLocationClick(defaultLocation)
          }
        }
      )
    }
  }, [selectedLocation, handleLocationClick])

  // Simplified map component - will be replaced with actual Mapbox integration
  return (
    <div className="space-y-4">
      {/* Map placeholder */}
      <div 
        ref={mapContainer} 
        className="w-full bg-gray-200 rounded-lg border flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
        style={{ height }}
        onClick={() => {
          if (userLocation) {
            handleLocationClick(userLocation)
          }
        }}
      >
        {selectedLocation ? (
          <div className="text-center">
            <div className="text-2xl mb-2">📍</div>
            <div className="text-sm text-gray-600">
              Position sélectionnée
            </div>
            <div className="text-xs text-gray-500">
              {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-2">🗺️</div>
            <div className="text-sm">
              Cliquez pour utiliser votre position
            </div>
            <div className="text-xs">
              (Carte interactive bientôt disponible)
            </div>
          </div>
        )}
      </div>

      {/* Current location button */}
      <button
        type="button"
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
              handleLocationClick(location)
            })
          }
        }}
        className="w-full px-4 py-2 text-sm text-emerald-600 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors"
      >
        📍 Utiliser ma position actuelle
      </button>
    </div>
  )
}