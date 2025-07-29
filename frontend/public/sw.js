/**
 * LexiLoop Service Worker
 * Provides offline functionality and caching for PWA experience
 */

const CACHE_NAME = 'lexiloop-v1.0.0';
const OFFLINE_URL = '/offline';

// Core files to cache immediately
const CORE_CACHE_FILES = [
  '/',
  '/offline',
  '/learn',
  '/library',
  '/progress',
  '/test',
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Files to cache on first visit
const RUNTIME_CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /\/_next\/static\//,
  /\/_next\/image/,
  /\/api\/health/
];

/**
 * Install Event - Cache core files
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching core files');
        return cache.addAll(CORE_CACHE_FILES);
      })
      .then(() => {
        console.log('[SW] Core files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache core files:', error);
      })
  );
});

/**
 * Activate Event - Clean old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker activated');
      return self.clients.claim();
    })
  );
});

/**
 * Fetch Event - Handle requests with caching strategies
 */
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);
  
  // Skip unsupported schemes (chrome-extension, moz-extension, etc.)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(handleStaticAssets(request));
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequests(request));
    return;
  }

  // Handle external resources (fonts, images, etc.)
  if (RUNTIME_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(handleExternalResources(request));
    return;
  }

  // Default: network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses only for http/https schemes
        if (response.ok && (url.protocol === 'http:' || url.protocol === 'https:')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone).catch((error) => {
              console.warn('[SW] Failed to cache request:', request.url, error);
            });
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

/**
 * Handle navigation requests (pages)
 * Strategy: Network first, cache fallback, offline page if all fail
 */
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Network failed for navigation:', error);
  }

  // Try cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fallback to offline page
  return caches.match(OFFLINE_URL);
}

/**
 * Handle static assets
 * Strategy: Cache first, network fallback
 */
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', error);
    throw error;
  }
}

/**
 * Handle API requests
 * Strategy: Network first, with offline indicators
 */
async function handleAPIRequests(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests only
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] API request failed:', error);
    
    // Try to return cached response for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Return offline indicator for failed API requests
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This request requires an internet connection',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Handle external resources (fonts, CDN assets)
 * Strategy: Cache first, network fallback
 */
async function handleExternalResources(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch external resource:', error);
    throw error;
  }
}

/**
 * Background Sync for offline actions
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-learning-progress') {
    event.waitUntil(syncLearningProgress());
  }
  
  if (event.tag === 'sync-test-results') {
    event.waitUntil(syncTestResults());
  }
});

/**
 * Sync learning progress when back online
 */
async function syncLearningProgress() {
  try {
    console.log('[SW] Syncing learning progress...');
    
    // Get pending progress from IndexedDB or localStorage
    const pendingProgress = await getPendingProgress();
    
    if (pendingProgress.length > 0) {
      for (const progress of pendingProgress) {
        await fetch('/api/progress/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progress)
        });
      }
      
      // Clear pending progress
      await clearPendingProgress();
      console.log('[SW] Learning progress synced successfully');
    }
  } catch (error) {
    console.error('[SW] Failed to sync learning progress:', error);
  }
}

/**
 * Sync test results when back online
 */
async function syncTestResults() {
  try {
    console.log('[SW] Syncing test results...');
    
    const pendingTests = await getPendingTests();
    
    if (pendingTests.length > 0) {
      for (const test of pendingTests) {
        await fetch('/api/tests/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(test)
        });
      }
      
      await clearPendingTests();
      console.log('[SW] Test results synced successfully');
    }
  } catch (error) {
    console.error('[SW] Failed to sync test results:', error);
  }
}

/**
 * Helper functions for data persistence
 */
async function getPendingProgress() {
  // Implement IndexedDB or localStorage retrieval
  return [];
}

async function clearPendingProgress() {
  // Implement clearing of pending progress
}

async function getPendingTests() {
  // Implement IndexedDB or localStorage retrieval
  return [];
}

async function clearPendingTests() {
  // Implement clearing of pending tests
}

/**
 * Push notification handling
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New learning content available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: data.url ? { url: data.url } : undefined,
    actions: [
      {
        action: 'open',
        title: 'Open LexiLoop'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'LexiLoop', options)
  );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(self.location.origin)) {
              return client.focus();
            }
          }
          
          // Open new window
          return clients.openWindow(urlToOpen);
        })
    );
  }
});

console.log('[SW] Service Worker loaded successfully');