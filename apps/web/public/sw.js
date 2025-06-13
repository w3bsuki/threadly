// Service Worker for Threadly - Production-ready offline support
// Version: 1.0.0

const CACHE_NAME = 'threadly-v1';
const DYNAMIC_CACHE = 'threadly-dynamic-v1';
const IMAGE_CACHE = 'threadly-images-v1';
const API_CACHE = 'threadly-api-v1';

// Assets to cache immediately (app shell)
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  // Note: Next.js _next/static assets are automatically cached by Next.js
];

// API endpoints to cache for offline access
const API_ENDPOINTS = [
  '/api/search',
  '/api/categories',
  '/api/products',
];

// Maximum cache sizes to prevent storage overflow
const MAX_CACHE_SIZE = {
  images: 50,
  api: 20,
  dynamic: 30,
};

// Cache strategy helpers
const cacheFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    throw error;
  }
};

const networkFirst = async (request, cacheName, timeout = 3000) => {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), timeout)
      )
    ]);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
};

const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cache
  return fetchPromise;
};

// Clean up old cache entries
const cleanupCache = async (cacheName, maxSize) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(
      keysToDelete.map(key => cache.delete(key))
    );
  }
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Force activation of new service worker
        return self.skipWaiting();
      })
      .catch(error => {
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE && 
                cacheName !== API_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
      .catch(error => {
      })
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - network first with cache fallback
    event.respondWith(
      networkFirst(request, API_CACHE)
        .catch(async () => {
          // Return offline page for failed API requests
          const cache = await caches.open(CACHE_NAME);
          return cache.match('/offline') || new Response(
            JSON.stringify({ 
              error: 'Offline',
              message: 'This content is not available offline'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
        .finally(() => {
          cleanupCache(API_CACHE, MAX_CACHE_SIZE.api);
        })
    );
  } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
    // Images - cache first
    event.respondWith(
      cacheFirst(request, IMAGE_CACHE)
        .catch(async () => {
          // Return placeholder image for failed image requests
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="#f3f4f6"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable offline</text></svg>',
            {
              headers: { 'Content-Type': 'image/svg+xml' }
            }
          );
        })
        .finally(() => {
          cleanupCache(IMAGE_CACHE, MAX_CACHE_SIZE.images);
        })
    );
  } else if (url.pathname.startsWith('/_next/static/')) {
    // Next.js static assets - cache first (long-term cache)
    event.respondWith(
      cacheFirst(request, CACHE_NAME)
    );
  } else {
    // HTML pages and other assets - stale while revalidate
    event.respondWith(
      staleWhileRevalidate(request, DYNAMIC_CACHE)
        .catch(async () => {
          // Return offline page for failed page requests
          const cache = await caches.open(CACHE_NAME);
          const offlinePage = await cache.match('/offline');
          if (offlinePage) {
            return offlinePage;
          }
          
          // Fallback offline page
          return new Response(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Offline - Threadly</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0; padding: 2rem; text-align: center; background: #f9fafb; 
                  }
                  .container { max-width: 400px; margin: 0 auto; }
                  .icon { font-size: 4rem; margin-bottom: 1rem; }
                  h1 { color: #374151; margin-bottom: 0.5rem; }
                  p { color: #6b7280; margin-bottom: 2rem; }
                  button { 
                    background: #000; color: white; border: none; padding: 0.75rem 2rem; 
                    border-radius: 0.5rem; cursor: pointer; font-size: 1rem;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="icon">📱</div>
                  <h1>You're offline</h1>
                  <p>Check your internet connection and try again.</p>
                  <button onclick="window.location.reload()">Try Again</button>
                </div>
              </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        })
        .finally(() => {
          cleanupCache(DYNAMIC_CACHE, MAX_CACHE_SIZE.dynamic);
        })
    );
  }
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Retry failed requests when back online
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SYNC_AVAILABLE' });
        });
      })
    );
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: 'threadly-notification',
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Threadly', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        // Focus existing tab if available
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
        // Open new tab if no existing tab
        return self.clients.openWindow('/');
      })
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

