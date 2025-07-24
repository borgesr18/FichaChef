/**
 * Service Worker para FichaChef
 * Versão 2.0 - Com tratamento robusto de erros e cache inteligente
 */

const CACHE_VERSION = 'v2.0.0'
const CACHE_NAME = `fichachef-${CACHE_VERSION}`
const STATIC_CACHE = `fichachef-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `fichachef-dynamic-${CACHE_VERSION}`
const API_CACHE = `fichachef-api-${CACHE_VERSION}`

// Assets estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/dashboard/fichas-tecnicas',
  '/dashboard/producao',
  '/dashboard/estoque',
  '/manifest.json',
  '/icons/icon.svg'
]

// URLs que devem ser ignoradas pelo cache (Vercel Live, analytics, etc.)
const IGNORE_CACHE_PATTERNS = [
  /vercel\.live/,
  /vercel-insights/,
  /vercel-analytics/,
  /_next-live/,
  /pusher/,
  /analytics/,
  /feedback/
]

// Configurações de cache
const CACHE_CONFIG = {
  API_TTL: 5 * 60 * 1000, // 5 minutos para APIs
  STATIC_TTL: 24 * 60 * 60 * 1000, // 24 horas para assets estáticos
  MAX_CACHE_SIZE: 50 // Máximo de entradas no cache dinâmico
}

/**
 * Verifica se uma URL deve ser ignorada pelo cache
 */
function shouldIgnoreCache(url) {
  return IGNORE_CACHE_PATTERNS.some(pattern => pattern.test(url))
}

/**
 * Verifica se o cache está expirado
 */
function isCacheExpired(response, ttl) {
  const cacheTimestamp = response.headers.get('sw-cache-timestamp')
  if (!cacheTimestamp) return true
  
  const age = Date.now() - parseInt(cacheTimestamp)
  return age > ttl
}

/**
 * Cria resposta com timestamp de cache
 */
function createCachedResponse(response) {
  const headers = new Headers(response.headers)
  headers.set('sw-cache-timestamp', Date.now().toString())
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  })
}

/**
 * Limita o tamanho do cache
 */
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  
  if (keys.length > maxSize) {
    const keysToDelete = keys.slice(0, keys.length - maxSize)
    await Promise.all(keysToDelete.map(key => cache.delete(key)))
  }
}

/**
 * Log estruturado para o Service Worker
 */
function swLog(level, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    source: 'service-worker',
    ...data
  }
  
  console[level](`[SW] ${message}`, logEntry)
}

// Event Listeners

self.addEventListener('install', event => {
  swLog('info', 'Service Worker installing...', { version: CACHE_VERSION })
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        swLog('info', 'Caching static assets', { count: STATIC_ASSETS.length })
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        swLog('info', 'Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch(error => {
        swLog('error', 'Failed to cache static assets', { error: error.message })
      })
  )
})

self.addEventListener('activate', event => {
  swLog('info', 'Service Worker activating...', { version: CACHE_VERSION })
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        const deletePromises = cacheNames
          .filter(cacheName => !cacheName.includes(CACHE_VERSION))
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

self.addEventListener('fetch', event => {
  const url = event.request.url
  const pathname = new URL(url).pathname

  // Ignorar URLs problemáticas (Vercel Live, etc.)
  if (shouldIgnoreCache(url)) {
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          swLog('warn', 'Failed to fetch ignored resource', { 
            url, 
            error: error.message 
          })
          // Retornar resposta vazia para evitar erros na aplicação
          return new Response('', { 
            status: 204,
            statusText: 'No Content'
          })
        })
    )
    return
  }

  // Estratégia para APIs
  if (pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request))
    return
  }

  // Estratégia para recursos estáticos
  event.respondWith(handleStaticRequest(event.request))
})

/**
 * Manipula requisições de API com cache inteligente
 */
async function handleApiRequest(request) {
  const url = request.url
  
  try {
    // Tentar buscar da rede primeiro
    const networkResponse = await fetch(request)
    
    // Só cachear respostas bem-sucedidas
    if (networkResponse.ok && networkResponse.status === 200) {
      const cache = await caches.open(API_CACHE)
      const cachedResponse = createCachedResponse(networkResponse.clone())
      
      await cache.put(request, cachedResponse)
      await limitCacheSize(API_CACHE, CACHE_CONFIG.MAX_CACHE_SIZE)
      
      swLog('debug', 'API response cached', { url })
    }
    
    return networkResponse
  } catch (error) {
    swLog('warn', 'API network request failed, trying cache', { 
      url, 
      error: error.message 
    })
    
    // Tentar buscar do cache
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_CONFIG.API_TTL)) {
      swLog('info', 'Serving API response from cache', { url })
      return cachedResponse
    }
    
    // Se não há cache válido, retornar erro estruturado
    swLog('error', 'No valid cache for API request', { url })
    return new Response(
      JSON.stringify({ 
        error: 'Offline - dados não disponíveis',
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
        timestamp: new Date().toISOString(),
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    )
  }
}

/**
 * Manipula requisições de recursos estáticos com cache-first
 */
async function handleStaticRequest(request) {
  const url = request.url
  
  try {
    // Tentar buscar do cache primeiro
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_CONFIG.STATIC_TTL)) {
      swLog('debug', 'Serving static resource from cache', { url })
      return cachedResponse
    }
    
    // Se não há cache válido, buscar da rede
    const networkResponse = await fetch(request)
    
    // Cachear apenas recursos bem-sucedidos e métodos GET
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(STATIC_CACHE)
      const cachedResponse = createCachedResponse(networkResponse.clone())
      
      await cache.put(request, cachedResponse)
      swLog('debug', 'Static resource cached', { url })
    }
    
    return networkResponse
  } catch (error) {
    swLog('warn', 'Static resource request failed', { 
      url, 
      error: error.message 
    })
    
    // Para imagens, retornar resposta vazia
    if (request.destination === 'image') {
      return new Response('', { status: 204 })
    }
    
    // Para outros recursos, tentar cache mesmo se expirado
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      swLog('info', 'Serving expired cache due to network failure', { url })
      return cachedResponse
    }
    
    throw error
  }
}

self.addEventListener('message', event => {
  const { type, data } = event.data || {}
  
  switch (type) {
    case 'SKIP_WAITING':
      swLog('info', 'Received SKIP_WAITING message')
      self.skipWaiting()
      break
      
    case 'CLEAR_CACHE':
      swLog('info', 'Received CLEAR_CACHE message')
      event.waitUntil(clearAllCaches())
      break
      
    case 'GET_CACHE_STATUS':
      event.waitUntil(getCacheStatus().then(status => {
        event.ports[0]?.postMessage(status)
      }))
      break
      
    default:
      swLog('warn', 'Unknown message type', { type, data })
  }
})

/**
 * Limpa todos os caches
 */
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
    swLog('info', 'All caches cleared successfully')
  } catch (error) {
    swLog('error', 'Failed to clear caches', { error: error.message })
  }
}

/**
 * Obtém status dos caches
 */
async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys()
    const status = {}
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      status[cacheName] = keys.length
    }
    
    return {
      version: CACHE_VERSION,
      caches: status,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    swLog('error', 'Failed to get cache status', { error: error.message })
    return { error: error.message }
  }
}

// Tratamento de erros globais
self.addEventListener('error', event => {
  swLog('error', 'Service Worker error', { 
    error: event.error?.message || 'Unknown error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})

self.addEventListener('unhandledrejection', event => {
  swLog('error', 'Service Worker unhandled rejection', { 
    reason: event.reason?.message || event.reason || 'Unknown reason'
  })
  event.preventDefault()
})

// Notificar que o Service Worker está pronto
self.addEventListener('activate', () => {
  swLog('info', 'Service Worker ready', { 
    version: CACHE_VERSION,
    timestamp: new Date().toISOString()
  })
})
