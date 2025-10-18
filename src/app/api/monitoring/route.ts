import { NextResponse } from 'next/server'
import { dbMonitor } from '@/lib/db-monitoring'
import { cache } from '@/lib/cache'

/**
 * API endpoint untuk monitoring performa aplikasi
 */
export async function GET() {
  try {
    const dbReport = dbMonitor.getReport();
    const cacheStats = cache.getStats();
    
    const report = {
      timestamp: new Date().toISOString(),
      database: dbReport,
      cache: {
        size: cacheStats.size,
        keys: cacheStats.keys,
        efficiency: cacheStats.size > 0 ? 'good' : 'no-cache'
      },
      performance: {
        overall: dbReport.performance.excellent ? 'excellent' : 
                dbReport.performance.good ? 'good' : 
                dbReport.performance.fair ? 'fair' : 'poor',
        recommendations: [
          ...dbReport.recommendations,
          cacheStats.size === 0 ? 'Pertimbangkan untuk mengaktifkan caching' : null
        ].filter(Boolean)
      }
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating monitoring report:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil pengaduan monitoring' },
      { status: 500 }
    );
  }
}

/**
 * Clear monitoring stats
 */
export async function DELETE() {
  try {
    dbMonitor.clearStats();
    cache.clear();
    
    return NextResponse.json({ 
      message: 'Monitoring stats cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing monitoring stats:', error);
    return NextResponse.json(
      { error: 'Gagal membersihkan monitoring stats' },
      { status: 500 }
    );
  }
}