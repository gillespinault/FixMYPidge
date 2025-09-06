import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper pour les uploads d'images
export const uploadImage = async (file: File, bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

// Helper pour la géolocalisation
export const reverseGeocode = async (lat: number, lng: number) => {
  // Utilise l'API de géocodage inversé de Supabase ou externe
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}`
    )
    const data = await response.json()
    return data.features[0]?.place_name || `${lat}, ${lng}`
  } catch (error) {
    console.error('Geocoding error:', error)
    return `${lat}, ${lng}`
  }
}