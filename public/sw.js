/**
 * Service Worker Otimizado para FichaChef PWA
 * Versão 4.0.0 - Funcionalidades PWA Avançadas
 */

const CACHE_VERSION = 'v4.0.0'
const STATIC_CACHE = `fichachef-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `fichachef-dynamic-${CACHE_VERSION}`
const OFFLINE_CACHE = `fichachef-offline-${CACHE_VERSION}`

// ✅ Assets estáticos essenciais
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/icons/icon.png',
  '/icons/icon.svg',
  '/icons/favicon.ico'
]

// ✅ Páginas para cache offline
const OFFLINE_PAGES = [
  '/dashboard',
  '/dashboard/fichas-tecnicas',
  '/dashboard/estoque',
  '/dashboard/producao',
  '/dashboard/cardapios',
  '/dashboard/relatorios'
]

// ✅ URLs que NUNCA devem ser interceptadas
const NEVER_CACHE_PATTERNS = [
  /supabase\.co/,
  /\.supabase\.co/,
  /api\//,
  /auth/,
  /vercel\.live/,
  /vercel-insights/,
  /vercel-analytics/,
  /_next-live/,
  /pusher/,
  /analytics/,
  /feedback/,
  /hot-reload/,
  /webpack/,
  /_next\/webpack/
]

// ✅ Configurações de cache por tipo de recurso
const CACHE_STRATEGIES = {
  images: { strategy: 'cache-first', maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 dias
  styles: { strategy: 'stale-while-revalidate', maxAge: 24 * 60 * 60 * 1000 }, // 1 dia
  scripts: { strategy: 'stale-while-revalidate', maxAge: 24 * 60 * 60 * 1000 }, // 1 dia
  documents: { strategy: 'network-first', maxAge: 60 * 60 * 1000 }, // 1 hora
  api: { strategy: 'network-only', maxAge: 0 } // Nunca cache
}

/**
 * Verifica se uma URL nunca deve ser interceptada
 */
function shouldNeverCache(url) {
  return NEVER_CACHE_PATTERNS.some(pattern => pattern.test(url))
}

/**
 * Determina o tipo de recurso baseado na URL
 */
function getResourceType(url) {
  if (url.includes('/api/')) return 'api'
  if (url.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) return 'images'
  if (url.match(/\.(css)$/i)) return 'styles'
  if (url.match(/\.(js|mjs)$/i)) return 'scripts'
  return 'documents'
}

/**
 * Log estruturado para o Service Worker
 */
function swLog(level, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    source: 'service-worker-v4',
    version: CACHE_VERSION,
    ...data
  }
  
  console[level](`[SW v4] ${message}`, logEntry)
}

/**
 * Verifica se um item do cache expirou
 */
function isExpired(response, maxAge) {
  if (!response || !maxAge) return false
  
  const cachedTime = response.headers.get('sw-cached-time')
  if (!cachedTime) return true
  
  const age = Date.now() - parseInt(cachedTime)
  return age > maxAge
}

/**
 * Adiciona timestamp ao response para controle de expiração
 */
function addTimestamp(response) {
  const responseClone = response.clone()
  const headers = new Headers(responseClone.headers)
  headers.set('sw-cached-time', Date.now().toString())
  
  return new Response(responseClone.body, {
    status: responseClone.status,
    statusText: responseClone.statusText,
    headers: headers
  })
}

/**
 * Estratégia Cache First
 */
async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
    swLog('debug', 'Cache hit (cache-first)', { url: request.url })
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const responseToCache = addTimestamp(networkResponse)
      cache.put(request, responseToCache.clone())
      swLog('debug', 'Network response cached (cache-first)', { url: request.url })
    }
    return networkResponse
  } catch (error) {
    if (cachedResponse) {
      swLog('warn', 'Network failed, serving stale cache', { url: request.url })
      return cachedResponse
    }
    throw error
  }
}

/**
 * Estratégia Network First
 */
async function networkFirst(request, cacheName, maxAge) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      const responseToCache = addTimestamp(networkResponse)
      cache.put(request, responseToCache.clone())
      swLog('debug', 'Network response cached (network-first)', { url: request.url })
    }
    return networkResponse
  } catch (error) {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      swLog('warn', 'Network failed, serving cache (network-first)', { url: request.url })
      return cachedResponse
    }
    
    throw error
  }
}

/**
 * Estratégia Stale While Revalidate
 */
async function staleWhileRevalidate(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  // Buscar da rede em background
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      const responseToCache = addTimestamp(response)
      cache.put(request, responseToCache.clone())
      swLog('debug', 'Background update completed (stale-while-revalidate)', { url: request.url })
    }
    return response
  }).catch(error => {
    swLog('warn', 'Background update failed (stale-while-revalidate)', { url: request.url, error: error.message })
  })
  
  // Retornar cache imediatamente se disponível
  if (cachedResponse) {
    swLog('debug', 'Serving stale cache (stale-while-revalidate)', { url: request.url })
    return cachedResponse
  }
  
  // Se não há cache, aguardar rede
  return networkPromise
}

// ✅ INSTALL: Cache de assets estáticos e páginas offline
self.addEventListener('install', event => {
  swLog('info', 'Service Worker installing (v4.0.0 - PWA Otimizado)')
  
  event.waitUntil(
    Promise.all([
      // Cache estático
      caches.open(STATIC_CACHE).then(cache => {
        swLog('info', 'Caching static assets', { count: STATIC_ASSETS.length })
        return cache.addAll(STATIC_ASSETS)
      }),
      // Cache offline
      caches.open(OFFLINE_CACHE).then(cache => {
        swLog('info', 'Caching offline pages', { count: OFFLINE_PAGES.length })
        return cache.addAll(OFFLINE_PAGES)
      })
    ])
    .then(() => {
      swLog('info', 'All caches populated successfully')
      return self.skipWaiting()
    })
    .catch(error => {
      swLog('error', 'Failed to populate caches', { error: error.message })
    })
  )
})

// ✅ ACTIVATE: Limpar caches antigos
self.addEventListener('activate', event => {
  swLog('info', 'Service Worker activating (v4.0.0)')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        const deletePromises = cacheNames
          .filter(cacheName => 
            cacheName.includes('fichachef') && 
            !cacheName.includes(CACHE_VERSION)
          )
          .map(cacheName => {
            swLog('info', 'Deleting old cache', { cacheName })
            return caches.delete(cacheName)
          })
        
        return Promise.all(deletePromises)
      })
      .then(() => {
        swLog('info', 'Service Worker activated successfully')
        return self.clients.claim()
      })
      .catch(error => {
        swLog('error', 'Failed to activate service worker', { error: error.message })
      })
  )
})

// ✅ FETCH: Estratégias inteligentes de cache
self.addEventListener('fetch', event => {
  const url = event.request.url
  
  // ✅ CRÍTICO: Nunca interceptar URLs protegidas
  if (shouldNeverCache(url)) {
    return
  }
  
  // ✅ Apenas interceptar requisições GET
  if (event.request.method !== 'GET') {
    return
  }
  
  const resourceType = getResourceType(url)
  const strategy = CACHE_STRATEGIES[resourceType]
  
  if (!strategy || strategy.strategy === 'network-only') {
    return
  }
  
  event.respondWith(
    (async () => {
      try {
        const cacheName = resourceType === 'images' ? STATIC_CACHE : DYNAMIC_CACHE
        
        switch (strategy.strategy) {
          case 'cache-first':
            return await cacheFirst(event.request, cacheName, strategy.maxAge)
          
          case 'network-first':
            return await networkFirst(event.request, cacheName, strategy.maxAge)
          
          case 'stale-while-revalidate':
            return await staleWhileRevalidate(event.request, cacheName, strategy.maxAge)
          
          default:
            return fetch(event.request)
        }
      } catch (error) {
        swLog('error', 'Fetch strategy failed', { url, error: error.message })
        
        // ✅ Página offline para documentos
        if (event.request.destination === 'document') {
          const offlineCache = await caches.open(OFFLINE_CACHE)
          const offlineResponse = await offlineCache.match('/dashboard')
          
          if (offlineResponse) {
            return offlineResponse
          }
          
          return new Response(
            `<!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <title>FichaChef - Offline</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: linear-gradient(135deg, #1B2E4B 0%, #5AC8FA 100%);
                  color: white;
                  text-align: center;
                  padding: 50px 20px;
                  margin: 0;
                  min-height: 100vh;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                }
                .container {
                  background: rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(10px);
                  border-radius: 20px;
                  padding: 40px;
                  max-width: 400px;
                  border: 1px solid rgba(255, 255, 255, 0.2);
                }
                h1 { font-size: 2.5em; margin-bottom: 20px; }
                p { font-size: 1.1em; margin-bottom: 30px; opacity: 0.9; }
                button {
                  background: rgba(255, 255, 255, 0.2);
                  border: 2px solid rgba(255, 255, 255, 0.3);
                  color: white;
                  padding: 12px 24px;
                  border-radius: 10px;
                  font-size: 1em;
                  cursor: pointer;
                  transition: all 0.3s ease;
                }
                button:hover {
                  background: rgba(255, 255, 255, 0.3);
                  transform: translateY(-2px);
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🔌 Sem conexão</h1>
                <p>O FichaChef está funcionando offline. Algumas funcionalidades podem estar limitadas.</p>
                <button onclick="window.location.reload()">Tentar reconectar</button>
              </div>
            </body>
            </html>`,
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
          )
        }
        
        throw error
      }
    })()
  )
})

// ✅ BACKGROUND SYNC: Para operações offline
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    swLog('info', 'Background sync triggered')
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Implementar sincronização de dados offline
    swLog('info', 'Background sync completed')
  } catch (error) {
    swLog('error', 'Background sync failed', { error: error.message })
  }
}

// ✅ PUSH: Notificações push
self.addEventListener('push', event => {
  if (!event.data) return
  
  const data = event.data.json()
  swLog('info', 'Push notification received', data)
  
  const options = {
    body: data.body,
    icon: '/icons/icon.png',
    badge: '/icons/icon.png',
    tag: data.tag || 'fichachef-notification',
    data: data.data,
    actions: [
      {
        action: 'open',
        title: 'Abrir FichaChef'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'FichaChef', options)
  )
})

// ✅ NOTIFICATION CLICK: Ações de notificação
self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/dashboard')
    )
  }
})

// ✅ MESSAGE: Comunicação com a aplicação
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION })
  }
})

swLog('info', 'Service Worker script loaded (v4.0.0 - PWA Otimizado)')
