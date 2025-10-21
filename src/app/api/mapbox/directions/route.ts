import { NextRequest, NextResponse } from 'next/server'
import { getDirections } from '@/lib/mapbox'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const origin = searchParams.get('origin')
  const destination = searchParams.get('destination')
  const profile = searchParams.get('profile') as 'driving' | 'walking' | 'cycling' || 'driving'

  try {
    if (!origin || !destination) {
      return NextResponse.json({
        success: false,
        error: 'Both "origin" and "destination" parameters are required'
      }, { status: 400 })
    }

    // Parse coordinates (expecting format: lng,lat)
    const originCoords = origin.split(',').map(Number) as [number, number]
    const destCoords = destination.split(',').map(Number) as [number, number]

    if (originCoords.length !== 2 || destCoords.length !== 2 || 
        isNaN(originCoords[0]) || isNaN(originCoords[1]) ||
        isNaN(destCoords[0]) || isNaN(destCoords[1])) {
      return NextResponse.json({
        success: false,
        error: 'Invalid coordinates format. Use: lng,lat'
      }, { status: 400 })
    }

    const result = await getDirections(originCoords, destCoords, profile)
    
    if (result) {
      return NextResponse.json({
        success: true,
        data: result
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to get directions'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Directions API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}