import { NextRequest, NextResponse } from 'next/server'

/**
 * Socket.IO API endpoint untuk Next.js App Router
 * Endpoint ini digunakan untuk inisialisasi koneksi Socket.IO
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/socket - Endpoint untuk inisialisasi Socket.IO
 * @returns {NextResponse} Socket.IO configuration
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Return socket configuration untuk client
    return NextResponse.json({
      success: true,
      socketUrl: isProduction 
        ? 'https://preview-chat-63e78080-40b1-453f-b361-0564260db910.space.z.ai'
        : 'http://localhost:3000',
      socketPath: '/api/socket',
      transports: ['websocket', 'polling'],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Socket API error:', error)
    return NextResponse.json(
      { success: false, error: 'Socket configuration failed' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/socket - Endpoint untuk testing koneksi
 * @returns {NextResponse} Test response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body
    
    switch (action) {
      case 'test':
        return NextResponse.json({
          success: true,
          message: 'Socket API is working',
          data: {
            timestamp: new Date().toISOString(),
            received: data
          }
        })
      
      case 'heartbeat':
        return NextResponse.json({
          success: true,
          message: 'Heartbeat received',
          timestamp: new Date().toISOString()
        })
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Socket POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Request failed' },
      { status: 500 }
    )
  }
}