import mapboxgl from 'mapbox-gl'

// Configure Mapbox access token
if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
}

export interface MapboxConfig {
  accessToken: string
  defaultStyle: string
  defaultCenter: [number, number]
  defaultZoom: number
}

export const mapboxConfig: MapboxConfig = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
  defaultStyle: 'mapbox://styles/mapbox/streets-v12',
  defaultCenter: [0, 0],
  defaultZoom: 2
}

// Available map styles
export const mapStyles = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v12'
}

// Geocoding functions
export async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxConfig.accessToken}`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }
    
    const data = await response.json()
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center
      return [lng, lat]
    }
    
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

export async function reverseGeocode(coordinates: [number, number]): Promise<string | null> {
  try {
    const [lng, lat] = coordinates
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxConfig.accessToken}`
    )
    
    if (!response.ok) {
      throw new Error('Reverse geocoding request failed')
    }
    
    const data = await response.json()
    
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name
    }
    
    return null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

// Directions API
export async function getDirections(
  origin: [number, number],
  destination: [number, number],
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<any> {
  try {
    const [originLng, originLat] = origin
    const [destLng, destLat] = destination
    
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/${profile}/${originLng},${originLat};${destLng},${destLat}?access_token=${mapboxConfig.accessToken}&geometries=geojson&overview=full`
    )
    
    if (!response.ok) {
      throw new Error('Directions request failed')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Directions error:', error)
    return null
  }
}

// Static map image generation
export function getStaticMapUrl(options: {
  coordinates: [number, number]
  zoom?: number
  width?: number
  height?: number
  style?: string
  markers?: Array<{
    coordinates: [number, number]
    color?: string
    size?: 'small' | 'medium' | 'large'
  }>
}): string {
  const {
    coordinates,
    zoom = 15,
    width = 600,
    height = 400,
    style = mapStyles.streets,
    markers = []
  } = options
  
  const [lng, lat] = coordinates
  let url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lng},${lat},${zoom}/${width}x${height}?access_token=${mapboxConfig.accessToken}`
  
  if (markers.length > 0) {
    const markerParams = markers.map(marker => {
      const [markerLng, markerLat] = marker.coordinates
      const color = marker.color || 'ff0000'
      const size = marker.size || 'medium'
      return `pin-${size}-${color}+${markerLng},${markerLat}`
    }).join(',')
    
    url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${markerParams}/${lng},${lat},${zoom}/${width}x${height}?access_token=${mapboxConfig.accessToken}`
  }
  
  return url
}

// Map utilities
export function calculateDistance(
  point1: [number, number],
  point2: [number, number]
): number {
  // Using Haversine formula
  const [lng1, lat1] = point1
  const [lng2, lat2] = point2
  
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export function boundsFromCoordinates(coordinates: [number, number][]): {
  northeast: [number, number]
  southwest: [number, number]
} | null {
  if (coordinates.length === 0) return null
  
  let minLng = coordinates[0][0]
  let maxLng = coordinates[0][0]
  let minLat = coordinates[0][1]
  let maxLat = coordinates[0][1]
  
  coordinates.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  })
  
  return {
    northeast: [maxLng, maxLat],
    southwest: [minLng, minLat]
  }
}