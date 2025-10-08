/**
 * Database performance monitoring utilities
 */

import { db } from './db';

interface QueryStats {
  query: string;
  duration: number;
  timestamp: Date;
}

class DatabaseMonitor {
  private queryStats: QueryStats[] = [];
  private enabled: boolean;
  
  constructor() {
    this.enabled = process.env.NODE_ENV === 'development';
  }
  
  logQuery(query: string, duration: number) {
    if (!this.enabled) return;
    
    this.queryStats.push({
      query,
      duration,
      timestamp: new Date()
    });
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`🐌 Slow query (${duration}ms): ${query}`);
    }
    
    // Keep only last 100 queries
    if (this.queryStats.length > 100) {
      this.queryStats = this.queryStats.slice(-100);
    }
  }
  
  getStats() {
    if (this.queryStats.length === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        slowQueries: 0,
        recentQueries: []
      };
    }
    
    const avgDuration = this.queryStats.reduce((sum, stat) => sum + stat.duration, 0) / this.queryStats.length;
    const slowQueries = this.queryStats.filter(stat => stat.duration > 1000);
    
    return {
      totalQueries: this.queryStats.length,
      averageDuration: Math.round(avgDuration),
      slowQueries: slowQueries.length,
      recentQueries: this.queryStats.slice(-10)
    };
  }
  
  clearStats() {
    this.queryStats = [];
  }
  
  getSlowQueries() {
    return this.queryStats.filter(stat => stat.duration > 1000);
  }
  
  getReport() {
    const stats = this.getStats();
    return {
      ...stats,
      performance: {
        excellent: stats.averageDuration < 100,
        good: stats.averageDuration < 500,
        fair: stats.averageDuration < 1000,
        poor: stats.averageDuration >= 1000
      },
      recommendations: this.getRecommendations(stats)
    };
  }
  
  private getRecommendations(stats: any): string[] {
    const recommendations: string[] = [];
    
    if (stats.averageDuration > 500) {
      recommendations.push('Pertimbangkan untuk menambah index pada query yang sering digunakan');
    }
    
    if (stats.slowQueries > 5) {
      recommendations.push('Terdapat banyak slow queries, optimalkan query yang lambat');
    }
    
    if (stats.totalQueries > 50) {
      recommendations.push('Pertimbangkan untuk implementasi caching yang lebih agresif');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performa database baik, lanjutkan monitoring');
    }
    
    return recommendations;
  }
}

export const dbMonitor = new DatabaseMonitor();

// Wrapper untuk query dengan monitoring
export async function monitoredQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await queryFn();
    const duration = Date.now() - start;
    dbMonitor.logQuery(queryName, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    dbMonitor.logQuery(`${queryName} (ERROR)`, duration);
    throw error;
  }
}
