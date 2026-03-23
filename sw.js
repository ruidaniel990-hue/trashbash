// Trash bash Service Worker - Offline Support & Caching
const CACHE_NAME = 'trashbash-v1.0.0';
const RUNTIME_CACHE = 'trashbash-runtime-v1.0.0';
const API_CACHE = 'trashbash-api-v1.0.0';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.html',
  '/dashboard.html',
  '/api.js',
  '/manifest.json',
];

// Install Event - Cache wichtige Assets
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Cleanup alte Caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== API_CACHE) {
            console.log(`🗑️ Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First für API, Cache First für Assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API Requests - Network First with Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            // Cache erfolgreiche API Responses
            const clonedResponse = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback zu gepufferten API Responses
          return caches.match(request)
            .then((response) => {
              if (response) {
                console.log(`🔄 Serving cached API response for: ${url.pathname}`);
                return response;
              }
              // Offline Fallback
              return new Response(
                JSON.stringify({
                  error: 'Offline - Cached data not available',
                  offline: true
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
  } 
  // HTML Pages - Cache First
  else if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((response) => response || fetch(request))
        .catch(() => {
          // Fallback zur Index Seite bei Offline
          return caches.match('/index.html');
        })
    );
  }
  // Static Assets - Cache First
  else if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type === 'error') {
                return response;
              }
              const clonedResponse = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, clonedResponse);
              });
              return response;
            });
        })
        .catch(() => {
          // Offline image placeholder
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-size="12">Offline</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          return new Response('Offline - Resource not available', { status: 503 });
        })
    );
  }
});

// Background Sync - Sync pending requests when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-api') {
    event.waitUntil(syncPendingRequests());
  }
});

async function syncPendingRequests() {
  const cache = await caches.open(API_CACHE);
  const requests = await cache.keys();
  
  const syncRequests = requests.filter(req => {
    return req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT';
  });

  return Promise.all(
    syncRequests.map(async (request) => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.log('Sync failed, will retry:', error);
      }
    })
  );
}

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Neue Benachrichtigung von Trash bash!',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23667eea" width="192" height="192"/><text x="50%" y="50%" font-size="100" fill="white" text-anchor="middle" dominant-baseline="central">🗑️</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><text x="96" y="96" font-size="100" fill="white" text-anchor="middle" dominant-baseline="central">🗑️</text></svg>',
    tag: 'trashbash-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Öffnen'
      },
      {
        action: 'close',
        title: 'Schließen'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Trash bash', options)
  );
});

// Notification Actions
self.addEventListener('notificationclick', (event) => {
  const { notification, action } = event;

  if (action === 'open' || !action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if not open
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }

  notification.close();
});

// Log Service Worker Status
console.log('✅ Trash bash Service Worker loaded');
console.log('📦 Cache:', CACHE_NAME);
console.log('⚡ Runtime Cache:', RUNTIME_CACHE);
console.log('🔗 API Cache:', API_CACHE);
