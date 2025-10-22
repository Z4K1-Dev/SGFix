// Enhanced API dengan caching dan performance optimization
import { epasarCache } from './epasar-cache';

// API wrapper dengan cache dan error handling
class EPasarAPI {
  private baseURL = '/api/epasar';
  private defaultTimeout = 10000; // 10 seconds

  // Generic fetch dengan timeout dan retry
  private async fetchWithTimeout(
    url: string, 
    options: RequestInit = {},
    timeout = this.defaultTimeout,
    retries = 2
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (retries > 0 && error instanceof Error && error.name !== 'AbortError') {
        console.log(`Retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.fetchWithTimeout(url, options, timeout, retries - 1);
      }

      throw error;
    }
  }

  // Get produk dengan cache
  async getProduk(params: {
    page?: number;
    limit?: number;
    search?: string;
    kategoriId?: string;
    sort?: string;
  } = {}) {
    const cacheKey = `produk:${JSON.stringify(params)}`;
    
    // Try cache first
    const cached = epasarCache.get(cacheKey);
    if (cached) {
      // Fetch in background for fresh data
      this.fetchProdukFromAPI(params).then(freshData => {
        epasarCache.set(cacheKey, freshData, 5 * 60 * 1000); // 5 minutes
      });
      return cached;
    }

    // Fetch from API
    const data = await this.fetchProdukFromAPI(params);
    epasarCache.set(cacheKey, data, 5 * 60 * 1000);
    return data;
  }

  private async fetchProdukFromAPI(params: any) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const response = await this.fetchWithTimeout(
      `${this.baseURL}/produk?${searchParams}`
    );
    return response.json();
  }

  // Get single produk dengan cache
  async getProdukById(id: string) {
    const cacheKey = `produk:${id}`;
    
    const cached = epasarCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.fetchWithTimeout(`${this.baseURL}/produk/${id}`);
    const data = await response.json();
    epasarCache.set(cacheKey, data, 10 * 60 * 1000); // 10 minutes
    return data;
  }

  // Get kategori dengan cache
  async getKategori() {
    const cacheKey = 'kategori';
    
    const cached = epasarCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.fetchWithTimeout(`${this.baseURL}/kategori`);
    const data = await response.json();
    epasarCache.set(cacheKey, data, 30 * 60 * 1000); // 30 minutes
    return data;
  }

  // Create produk (no cache)
  async createProduk(produkData: any) {
    const response = await this.fetchWithTimeout(`${this.baseURL}/produk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(produkData)
    });

    // Invalidate cache
    epasarCache.delete('products:all');
    
    const data = await response.json();
    return data;
  }

  // Update produk (no cache)
  async updateProduk(id: string, produkData: any) {
    const response = await this.fetchWithTimeout(`${this.baseURL}/produk/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(produkData)
    });

    // Invalidate relevant caches
    epasarCache.invalidateProductCache(id);
    
    const data = await response.json();
    return data;
  }

  // Delete produk (no cache)
  async deleteProduk(id: string) {
    const response = await this.fetchWithTimeout(`${this.baseURL}/produk/${id}`, {
      method: 'DELETE'
    });

    // Invalidate relevant caches
    epasarCache.invalidateProductCache(id);
    
    return response.ok;
  }

  // Batch operations untuk performance
  async batchGetProduk(ids: string[]) {
    const promises = ids.map(id => this.getProdukById(id));
    return Promise.allSettled(promises);
  }

  // Prefetch multiple products
  async prefetchProduk(ids: string[]) {
    const promises = ids.map(id => 
      this.getProdukById(id).catch(error => {
        console.warn(`Failed to prefetch product ${id}:`, error);
        return null;
      })
    );
    
    // Fire and forget
    Promise.all(promises);
  }

  // Search dengan debouncing
  async searchProduk(query: string, options: any = {}) {
    return this.getProduk({
      search: query,
      ...options
    });
  }

  // Get featured products
  async getFeaturedProduk() {
    const cacheKey = 'produk:featured';
    
    const cached = epasarCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.getProduk({ 
      limit: 6, 
      sort: 'populer' 
    });
    epasarCache.set(cacheKey, data, 15 * 60 * 1000); // 15 minutes
    return data;
  }

  // Get produk by kategori
  async getProdukByKategori(kategoriId: string, options: any = {}) {
    return this.getProduk({
      kategoriId,
      ...options
    });
  }

  // Analytics tracking
  async trackView(produkId: string) {
    try {
      await this.fetchWithTimeout(`${this.baseURL}/produk/${produkId}/view`, {
        method: 'POST'
      });
    } catch (error) {
      console.warn('Failed to track view:', error);
    }
  }

  async trackLike(produkId: string) {
    try {
      await this.fetchWithTimeout(`${this.baseURL}/produk/${produkId}/like`, {
        method: 'POST'
      });
    } catch (error) {
      console.warn('Failed to track like:', error);
    }
  }
}

export const epasarAPI = new EPasarAPI();