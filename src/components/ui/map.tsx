"use client"

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Set the Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_ACCESS_TOKEN || ''

interface MapProps {
  initialCoordinates?: [number, number]
  initialZoom?: number
  style?: string
  onMapLoad?: (map: mapboxgl.Map) => void
  onMapClick?: (event: mapboxgl.MapMouseEvent) => void
  markers?: Array<{
    coordinates: [number, number]
    popup?: string
    color?: string
  }>
  className?: string
}

export function Map({
  initialCoordinates = [0, 0],
  initialZoom = 2,
  style = 'mapbox://styles/mapbox/streets-v12',
  onMapLoad,
  onMapClick,
  markers = [],
  className = 'w-full h-full'
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Check if access token is available
    if (!mapboxgl.accessToken) {
      setError('Mapbox access token is not configured')
      setIsLoading(false)
      return
    }

    try {
      // Initialize the map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: style,
        center: initialCoordinates,
        zoom: initialZoom,
        attributionControl: false
      })

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Add attribution control
      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true
      }), 'bottom-left')

      // Handle map load
      map.current.on('load', () => {
        setIsLoading(false)
        onMapLoad?.(map.current!)
      })

      // Handle map click
      if (onMapClick) {
        map.current.on('click', onMapClick)
      }

      // Handle errors
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e)
        setError('Failed to load map. Please check your internet connection.')
        setIsLoading(false)
      })

    } catch (err) {
      console.error('Error initializing map:', err)
      setError('Failed to initialize map. Please check your Mapbox configuration.')
      setIsLoading(false)
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Update markers when they change
  useEffect(() => {
    if (!map.current) return

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker')
    existingMarkers.forEach(marker => marker.remove())

    // Add new markers
    markers.forEach(marker => {
      const markerElement = document.createElement('div')
      markerElement.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C10.477 0 6 4.477 6 10C6 17 16 32 16 32S26 17 26 10C26 4.477 21.523 0 16 0Z" fill="${marker.color || '#ef4444'}"/>
          <circle cx="16" cy="10" r="4" fill="white"/>
        </svg>
      `
      markerElement.style.width = '32px'
      markerElement.style.height = '32px'
      markerElement.style.cursor = 'pointer'
      markerElement.style.transform = 'translate(-50%, -100%)'
      markerElement.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'

      const popup = marker.popup ? new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      }).setHTML(marker.popup) : undefined

      new mapboxgl.Marker({
        element: markerElement,
        anchor: 'bottom'
      })
        .setLngLat(marker.coordinates)
        .setPopup(popup || undefined)
        .addTo(map.current!)
    })
  }, [markers])

  // Update map center and zoom
  useEffect(() => {
    if (!map.current) return
    
    map.current.flyTo({
      center: initialCoordinates,
      zoom: initialZoom,
      duration: 1000
    })
  }, [initialCoordinates, initialZoom])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-4 max-w-sm">
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-red-500 font-medium mb-2">Map Error</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <div className="text-xs text-gray-500">
            <p>Try refreshing the page or check your internet connection.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  )
}