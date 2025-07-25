/**
 * Service Worker para FichaChef - VERSÃO CORRIGIDA
 * Não interfere com APIs do Supabase para evitar loops infinitos
 */

const CACHE_VERSION = 'v3.0.0'
const STATIC_CACHE = `fichachef-static-${CACHE_VERSION}`

// ✅ APENAS assets estáticos - SEM APIs
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icons/icon.svg'
]

// ✅ URLs que NUNCA devem ser interceptadas pelo Service Worker
const NEVER_CACHE_PATTERNS = [
  /supabase\.co/,           // ✅ CRÍTICO: Nunca interceptar Supabase
  /\.supabase\.co/,         // ✅ CRÍTICO: Nunca interceptar Supabase
  /api\//,                  // ✅ Nunca interceptar APIs locais
  /auth/,                   // ✅ Nunca interceptar autenticação
  /vercel\.live/,
  /vercel-insights/,
  /vercel-analytics/,
  /_next-live/,
  /pusher/,
  /analytics/,
  /feedback/
]

/**
 * Verifica se uma URL NUNCA deve ser interceptada
 */
function shouldNeverCache(url) {
  return NEVER_CACHE_PATTERNS.some(pattern => pattern.test(url))
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

// ✅ INSTALL: Apenas cache de assets estáticos
self.addEventListener('install', event => {
  swLog('info', 'Service Worker installing (v3.0.0 - Supabase Safe)')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        swLog('info', 'Caching static assets only', { count: STATIC_ASSETS.length })
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

// ✅ ACTIVATE: Limpar caches antigos
self.addEventListener('activate', event => {
  swLog('info', 'Service Worker activating (v3.0.0)')
  
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

// ✅ FETCH: NUNCA interceptar Supabase ou APIs
self.addEventListener('fetch', event => {
  const url = event.request.url
  
  // ✅ CRÍTICO: Se for Supabase ou API, NUNCA interceptar
  if (shouldNeverCache(url)) {
    swLog('debug', 'Bypassing cache for protected URL', { url })
    return // ✅ Deixa a requisição passar direto, sem interceptar
  }
  
  // ✅ Apenas interceptar requisições GET para assets estáticos
  if (event.request.method !== 'GET') {
    swLog('debug', 'Bypassing non-GET request', { method: event.request.method, url })
    return
  }
  
  // ✅ Estratégia simples: Cache First apenas para assets estáticos
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          swLog('debug', 'Serving from cache', { url })
          return response
        }
        
        // ✅ Se não está no cache, buscar da rede (sem tentar fazer cache)
        swLog('debug', 'Fetching from network', { url })
        return fetch(event.request)
      })
      .catch(error => {
        swLog('error', 'Fetch failed', { url, error: error.message })
        
        // ✅ Em caso de erro, tentar servir página offline básica
        if (event.request.destination === 'document') {
          return new Response(
            `<!DOCTYPE html>
            <html>
            <head>
              <title>FichaChef - Offline</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>🔌 Sem conexão</h1>
              <p>Verifique sua conexão com a internet e tente novamente.</p>
              <button onclick="window.location.reload()">Tentar novamente</button>
            </body>
            </html>`,
            {
              status: 200,
              headers: { 'Content-Type': 'text/html' }
            }
          )
        }
        
        throw error
      })
  )
})

// ✅ ERROR: Capturar erros não tratados
self.addEventListener('error', event => {
  swLog('error', 'Service Worker unhandled error', { 
    filename: event.filename,
    lineno: event.lineno,
    message: event.message 
  })
})

// ✅ UNHANDLEDREJECTION: Capturar promises rejeitadas
self.addEventListener('unhandledrejection', event => {
  swLog('error', 'Service Worker unhandled rejection', { reason: event.reason })
  event.preventDefault() // ✅ Previne que o erro apareça no console
})

swLog('info', 'Service Worker script loaded (v3.0.0 - Supabase Safe)')

