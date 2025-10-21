import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress, reverseGeocode } from '@/lib/mapbox'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const coordinates = searchParams.get('coordinates')

  try {
    if (address) {
      // Forward geocoding
      const result = await geocodeAddress(address)
      
      if (result) {
        return NextResponse.json({
          success: true,
          coordinates: result
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Address not found'
        }, { status: 404 })
      }
    } else if (coordinates) {
      // Reverse geocoding
      const coords = coordinates.split(',').map(Number) as [number, number]
      
      if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
        return NextResponse.json({
          success: false,
          error: 'Invalid coordinates format. Use: lng,lat'
        }, { status: 400 })
      }
      
      const result = await reverseGeocode(coords)
      
      if (result) {
        return NextResponse.json({
          success: true,
          address: result
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Address not found for given coordinates'
        }, { status: 404 })
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either "address" or "coordinates" parameter is required'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Geocoding API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}