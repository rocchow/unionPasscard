const CACHE_VERSION = 'v3';
const CACHE_NAME = `union-passcard-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/auth/login',
  '/myPasses',
  '/qr-code', 
  '/scanToBuy',
  '/transactions',
  '/discover',
  '/reports',
  '/manifest.json'
];

// Install event - cache resources and skip waiting
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Installing new service worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('🔧 SW: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('🔧 SW: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('🔧 SW: Activating new service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🔧 SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🔧 SW: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first for API calls, cache first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Network first for API calls and auth
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache GET requests for API calls
          if (request.method === 'GET' && response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              })
              .catch((err) => {
                console.log('Cache put failed:', err);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails (only for GET requests)
          if (request.method === 'GET') {
            return caches.match(request);
          }
          // For non-GET requests, return a network error
          return new Response('Network error', { status: 503 });
        })
    );
    return;
  }

  // Cache first for everything else
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          // Serve from cache but update cache in background
          fetch(request)
            .then((fetchResponse) => {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, fetchResponse.clone());
                });
            })
            .catch(() => {}); // Ignore network errors
          return response;
        }
        
        // Not in cache, fetch from network
        return fetch(request)
          .then((fetchResponse) => {
            // Cache the response for next time
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            return fetchResponse;
          });
      })
  );
});

// Listen for messages from the app to force update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔧 SW: Received SKIP_WAITING message');
    self.skipWaiting();
  }
});
