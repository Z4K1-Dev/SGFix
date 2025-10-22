// Cache utilities untuk e-Pasar
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

class EPasarCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if cache is expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Preload data yang mungkin akan dibutuhkan user
  async prefetchRelatedData(currentProductId: string): Promise<void> {
    try {
      // Prefetch produk dalam kategori yang sama
      const currentProduct = this.get<Produk>(`product:${currentProductId}`);
      if (currentProduct) {
        // Prefetch produk terkait
        this.prefetchCategoryProducts(currentProduct.kategoriId, currentProductId);
      }
    } catch (error) {
      console.error('Error prefetching data:', error);
    }
  }

  private async prefetchCategoryProducts(kategoriId: string, excludeId: string): Promise<void> {
    const cacheKey = `category:${kategoriId}:products`;
    if (!this.get(cacheKey)) {
      try {
        const response = await fetch(`/api/epasar/produk?kategori=${kategoriId}&limit=6`);
        const products = await response.json();
        const filteredProducts = products.filter((p: Produk) => p.id !== excludeId);
        this.set(cacheKey, filteredProducts, 10 * 60 * 1000); // 10 minutes
      } catch (error) {
        console.error('Error prefetching category products:', error);
      }
    }
  }

  // Cache management untuk admin
  invalidateProductCache(productId: string): void {
    this.delete(`product:${productId}`);
    this.delete('products:all');
    this.delete('products:featured');
    // Invalidate category cache
    this.cache.forEach((value, key) => {
      if (key.startsWith('category:')) {
        this.delete(key);
      }
    });
  }

  // Get cache stats
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const epasarCache = new EPasarCache();

// React hook untuk cache dengan stale-while-revalidate
import { useState, useEffect, useCallback } from 'react';

export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
) {
  const [data, setData] = useState<T | null>(() => epasarCache.get<T>(key));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const freshData = await fetcher();
      epasarCache.set(key, freshData, ttl);
      setData(freshData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  useEffect(() => {
    // If no cached data, fetch immediately
    if (!data) {
      fetchData();
    } else {
      // If cached data exists, fetch in background (stale-while-revalidate)
      fetchData();
    }
  }, [fetchData, data]);

  const refetch = useCallback(() => {
    epasarCache.delete(key);
    fetchData();
  }, [key, fetchData]);

  return { data, loading, error, refetch };
}

// Prefetch hook untuk data yang mungkin dibutuhkan
export function usePrefetch() {
  const prefetchProduct = useCallback(async (productId: string) => {
    const cacheKey = `product:${productId}`;
    if (!epasarCache.get(cacheKey)) {
      try {
        const response = await fetch(`/api/epasar/produk/${productId}`);
        const product = await response.json();
        epasarCache.set(cacheKey, product);
        
        // Prefetch related data
        await epasarCache.prefetchRelatedData(productId);
      } catch (error) {
        console.error('Error prefetching product:', error);
      }
    }
  }, []);

  const prefetchCategory = useCallback(async (kategoriId: string) => {
    const cacheKey = `category:${kategoriId}:products`;
    if (!epasarCache.get(cacheKey)) {
      try {
        const response = await fetch(`/api/epasar/produk?kategori=${kategoriId}`);
        const products = await response.json();
        epasarCache.set(cacheKey, products);
      } catch (error) {
        console.error('Error prefetching category:', error);
      }
    }
  }, []);

  return { prefetchProduct, prefetchCategory };
}

// Intersection Observer untuk lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, callback, options]);
}

// Image optimization dan caching
export function getOptimizedImageUrl(url: string, width: number = 400, quality: number = 80): string {
  if (!url) return '';
  
  // Jika menggunakan layanan image optimization seperti Next.js Image
  if (url.startsWith('/')) {
    return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
  }
  
  // Untuk external images, bisa menggunakan service seperti Cloudinary, Imgix, dll
  return url;
}

// Debounce utility untuk search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility untuk scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Types
interface Produk {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  stok: number;
  kategoriId: string;
  gambar: string[];
  status: string;
  penjualId: string;
  createdAt: string;
  updatedAt: string;
  kategori?: {
    id: string;
    nama: string;
    deskripsi: string;
  };
}