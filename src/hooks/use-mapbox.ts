"use client"

import { useCallback, useState } from 'react'
import mapboxgl from 'mapbox-gl'

interface UseMapboxReturn {
  map: mapboxgl.Map | null
  isMapLoaded: boolean
  error: string | null
  setMap: (map: mapboxgl.Map | null) => void
  addMarker: (coordinates: [number, number], options?: MarkerOptions) => mapboxgl.Marker | null
  removeMarker: (marker: mapboxgl.Marker) => void
  flyTo: (coordinates: [number, number], zoom?: number) => void
  fitBounds: (bounds: [number, number][], padding?: number) => void
  getCenter: () => [number, number] | null
  getZoom: () => number | null
}

interface MarkerOptions {
  popup?: string
  color?: string
  element?: HTMLElement
  anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export function useMapbox(): UseMapboxReturn {
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addMarker = useCallback((
    coordinates: [number, number], 
    options: MarkerOptions = {}
  ): mapboxgl.Marker | null => {
    if (!map) {
      setError('Map is not initialized')
      return null
    }

    try {
      let markerElement: HTMLElement | undefined

      if (options.element) {
        markerElement = options.element
      } else {
        // Create default marker element
        markerElement = document.createElement('div')
        markerElement.className = 'w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-transform'
        
        if (options.color) {
          markerElement.style.backgroundColor = options.color
        }
      }

      const popup = options.popup ? new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      }).setHTML(options.popup) : undefined

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: options.anchor || 'center'
      })
        .setLngLat(coordinates)
        .setPopup(popup || undefined)
        .addTo(map)

      return marker
    } catch (err) {
      console.error('Error adding marker:', err)
      setError('Failed to add marker')
      return null
    }
  }, [map])

  const removeMarker = useCallback((marker: mapboxgl.Marker) => {
    try {
      marker.remove()
    } catch (err) {
      console.error('Error removing marker:', err)
      setError('Failed to remove marker')
    }
  }, [])

  const flyTo = useCallback((coordinates: [number, number], zoom = 10) => {
    if (!map) {
      setError('Map is not initialized')
      return
    }

    try {
      map.flyTo({
        center: coordinates,
        zoom: zoom,
        duration: 1000
      })
    } catch (err) {
      console.error('Error flying to location:', err)
      setError('Failed to navigate to location')
    }
  }, [map])

  const fitBounds = useCallback((
    bounds: [number, number][], 
    padding = 50
  ) => {
    if (!map) {
      setError('Map is not initialized')
      return
    }

    try {
      const boundsObj = new mapboxgl.LngLatBounds()
      bounds.forEach(coord => boundsObj.extend(coord))
      
      map.fitBounds(boundsObj, {
        padding: padding,
        duration: 1000
      })
    } catch (err) {
      console.error('Error fitting bounds:', err)
      setError('Failed to fit bounds')
    }
  }, [map])

  const getCenter = useCallback((): [number, number] | null => {
    if (!map) return null
    const center = map.getCenter()
    return [center.lng, center.lat]
  }, [map])

  const getZoom = useCallback((): number | null => {
    if (!map) return null
    return map.getZoom()
  }, [map])

  const setMapWithState = useCallback((newMap: mapboxgl.Map | null) => {
    setMap(newMap)
    if (newMap) {
      setIsMapLoaded(true)
      setError(null)
    } else {
      setIsMapLoaded(false)
    }
  }, [])

  return {
    map,
    isMapLoaded,
    error,
    setMap: setMapWithState,
    addMarker,
    removeMarker,
    flyTo,
    fitBounds,
    getCenter,
    getZoom
  }
}