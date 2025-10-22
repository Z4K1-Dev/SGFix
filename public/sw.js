// Service Worker untuk e-Pasar dengan caching strategi
const CACHE_NAME = 'epasar-cache-v1';
const STATIC_CACHE = 'epasar-static-v1';
const API_CACHE = 'epasar-api-v1';

// Files yang akan di-cache
const STATIC_FILES = [
  '/',
  '/epasar',
  '/epasar/produk',
  '/_next/static/css/',
  '/_next/static/js/',
  '/api/epasar/kategori'
];

// API endpoints yang akan di-cache
const CACHEABLE_APIS = [
  '/api/epasar/kategori',
  '/api/epasar/produk?limit=12',
  '/api/epasar/produk/featured'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Strategy 1: Cache First for static assets
  if (url.pathname.startsWith('/_next/static/') || 
      url.pathname.includes('.css') || 
      url.pathname.includes('.js') ||
      url.pathname.includes('.png') ||
      url.pathname.includes('.jpg') ||
      url.pathname.includes('.jpeg') ||
      url.pathname.includes('.svg')) {
    
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request);
        })
    );
    return;
  }

  // Strategy 2: Network First for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok && CACHEABLE_APIS.some(api => url.pathname.includes(api))) {
            const responseClone = response.clone();
            caches.open(API_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Strategy 3: Stale While Revalidate for pages
  if (url.pathname.startsWith('/epasar')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              // Update cache with fresh response
              if (response.ok) {
                caches.open(STATIC_CACHE)
                  .then((cache) => {
                    cache.put(request, response.clone());
                  });
              }
              return response;
            });
          
          // Return cached version immediately, update in background
          return cachedResponse || fetchPromise;
        })
    );
    return;
  }

  // Default: Network First
  event.respondWith(
    fetch(request)
      .catch(() => {
        // Fallback to cache for any request
        return caches.match(request);
      })
  );
});

// Background sync untuk offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-pesanan') {
    event.waitUntil(syncPesanan());
  }
});

// Sync pending orders when online
async function syncPesanan() {
  try {
    const pendingOrders = await getPendingOrders();
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/epasar/pesanan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(order.data)
        });

        if (response.ok) {
          // Remove from pending orders
          await removePendingOrder(order.id);
          
          // Notify user
          self.registration.showNotification('Pesanan Tersinkron', {
            body: `Pesanan ${order.data.namaPelanggan} berhasil dikirim`,
            icon: '/icons/success.png'
          });
        }
      } catch (error) {
        console.error('Failed to sync order:', error);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// IndexedDB helpers untuk pending orders
async function getPendingOrders() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EPasarDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingOrders'], 'readonly');
      const store = transaction.objectStore('pendingOrders');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pendingOrders')) {
        db.createObjectStore('pendingOrders', { keyPath: 'id' });
      }
    };
  });
}

async function removePendingOrder(orderId: string) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EPasarDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingOrders'], 'readwrite');
      const store = transaction.objectStore('pendingOrders');
      const deleteRequest = store.delete(orderId);
      
      deleteRequest.onsuccess = () => resolve(deleteRequest.result);
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Notifikasi baru dari e-Pasar',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Lihat Detail',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('e-Pasar', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/epasar')
    );
  }
});

console.log('Service Worker loaded');