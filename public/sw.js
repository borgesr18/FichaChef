const CACHE_NAME = 'fichachef-v1'
const STATIC_CACHE = 'fichachef-static-v1'
const DYNAMIC_CACHE = 'fichachef-dynamic-v1'

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/dashboard/fichas-tecnicas',
  '/dashboard/producao',
  '/dashboard/estoque',
  '/manifest.json',
  '/icons/icon.svg'
]

self.addEventListener('install', event => {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error)
      })
  )
})

self.addEventListener('activate', event => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(event.request, responseClone))
          }
          return response
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse
              }
              return new Response(
                JSON.stringify({ error: 'Offline - dados não disponíveis' }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              )
            })
        })
    )
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response
          }
          return fetch(event.request)
            .then(response => {
              if (response.ok && event.request.method === 'GET') {
                const responseClone = response.clone()
                caches.open(STATIC_CACHE)
                  .then(cache => cache.put(event.request, responseClone))
              }
              return response
            })
        })
    )
  }
})

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
