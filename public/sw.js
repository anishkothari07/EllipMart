const CACHE_NAME = 'smartgo-pwa-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Cache strategy: Network falling back to Cache
self.addEventListener('fetch', (e) => {
  // Only cache GET requests
  if (e.request.method !== 'GET') return;

  // Ignore chrome-extension or non-http(s) requests
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cache successful responses
        if (res.status === 200 && res.type === 'basic') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return res;
      })
      .catch(() => {
        // Try fallback to cache
        return caches.match(e.request).then((cachedRes) => {
          if (cachedRes) return cachedRes;
          // Return basic offline message if HTML requested
          const acceptHeader = e.request.headers.get('accept') || '';
          if (acceptHeader.includes('text/html') || e.request.mode === 'navigate') {
            return new Response(
              `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>SmartGO Offline</title><style>body { font-family: system-ui, sans-serif; text-align: center; padding: 50px 20px; background: #fbfbf9; color: #232320; } .card { max-width: 400px; margin: 0 auto; padding: 30px; background: #fff; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); } button { padding: 12px 24px; font-weight: 600; background: #FF5733; color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 14px; margin-top: 15px; }</style></head><body><div class="card"><h1>SmartGO Offline</h1><p>You are currently offline. Pages you've previously visited remain available from cache.</p><button onclick="window.location.reload()">Retry Connection</button></div></body></html>`,
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
        });
      })
  );
});

// Background sync events for queuing failed orders
self.addEventListener('sync', (e) => {
  if (e.tag === 'retry-checkout-queue') {
    e.waitUntil(retryQueuedOrders());
  }
});

async function retryQueuedOrders() {
  console.log('[SW] Retrying queued background checkout sync requests...');
}
