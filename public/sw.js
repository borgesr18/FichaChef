// ✅ SERVICE WORKER v4.1.0 - CORRIGIDO
// Versão corrigida que resolve erro 404 do ícone SVG

const CACHE_VERSION = 'fichachef-v4.1.0'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const OFFLINE_CACHE = `${CACHE_VERSION}-offline`

// ✅ CORRIGIDO: Lista de arquivos estáticos sem icon.svg
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/icon.png',           // ✅ Usar PNG em vez de SVG
  '/favicon.ico',
  '/_next/static/css/',
  '/_next/static/js/',
]

// ✅ CORRIGIDO: Páginas offline sem referências SVG
const OFFLINE_PAGES = [
  '/dashboard',
  '/login',
  '/offline'
]

// ✅ Estratégias de cache por tipo de recurso
const CACHE_STRATEGIES = {
  images: { strategy: 'cache-first', maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 dias
  styles: { strategy: 'stale-while-revalidate', maxAge: 24 * 60 * 60 * 1000 }, // 1 dia
  scripts: { strategy: 'stale-while-revalidate', maxAge: 24 * 60 * 60 * 1000 }, // 1 dia
  documents: { strategy: 'network-first', maxAge: 60 * 60 * 1000 }, // 1 hora
  api: { strategy: 'network-only', maxAge: 0 } // Nunca cache
}

// ✅ Função de log melhorada
function swLog(message, data = null) {
  const timestamp = new Date().toISOString()
  const logData = {
    timestamp,
    version: 'SW v4.1.0',
    message,
    ...(data && { data })
  }
  console.log(`[SW v4.1.0] ${message}`, logData)
}

// ✅ Install Event - Cache inicial
self.addEventListener('install', (event) => {
  swLog('Installing Service Worker v4.1.0')
  
  event.waitUntil(
    Promise.all([
      // Cache de arquivos estáticos
      caches.open(STATIC_CACHE).then((cache) => {
        swLog('Caching static assets')
        // ✅ CORRIGIDO: Filtrar apenas arquivos que existem
        const validAssets = STATIC_ASSETS.filter(asset => {
          // Não tentar cachear arquivos SVG inexistentes
          return !asset.includes('.svg')
        })
        return cache.addAll(validAssets).catch((error) => {
          swLog('Failed to cache static assets', { error: error.message })
          // ✅ Continuar mesmo se alguns arquivos falharem
          return Promise.resolve()
        })
      }),
      
      // Cache de páginas offline
      caches.open(OFFLINE_CACHE).then((cache) => {
        swLog('Caching offline pages')
        return cache.addAll(OFFLINE_PAGES).catch((error) => {
          swLog('Failed to cache offline pages', { error: error.message })
          return Promise.resolve()
        })
      })
    ]).then(() => {
      swLog('Service Worker installed successfully')
      // ✅ Ativar imediatamente
      return self.skipWaiting()
    }).catch((error) => {
      swLog('Failed to populate caches', { error: error.message })
    })
  )
})

// ✅ Activate Event - Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  swLog('Activating Service Worker v4.1.0')
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.startsWith(CACHE_VERSION)) {
              swLog('Deleting old cache', { cacheName })
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Tomar controle imediatamente
      self.clients.claim()
    ]).then(() => {
      swLog('Service Worker activated successfully')
    })
  )
})

// ✅ Fetch Event - Estratégias de cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // ✅ CORRIGIDO: Ignorar requisições para arquivos SVG inexistentes
  if (url.pathname.includes('.svg')) {
    swLog('Ignoring SVG request (file may not exist)', { url: url.pathname })
    return // Deixar o navegador lidar com o erro 404
  }
  
  // ✅ Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return
  }
  
  // ✅ Ignorar requisições de extensões do navegador
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return
  }
  
  event.respondWith(
    handleRequest(request).catch((error) => {
      swLog('Fetch error', { url: request.url, error: error.message })
      return handleOffline(request)
    })
  )
})

// ✅ Função principal de tratamento de requisições
async function handleRequest(request) {
  const url = new URL(request.url)
  const strategy = getStrategy(request)
  
  swLog('Handling request', { 
    url: url.pathname, 
    strategy: strategy.strategy,
    method: request.method 
  })
  
  switch (strategy.strategy) {
    case 'cache-first':
      return handleCacheFirst(request, strategy)
    case 'network-first':
      return handleNetworkFirst(request, strategy)
    case 'stale-while-revalidate':
      return handleStaleWhileRevalidate(request, strategy)
    case 'network-only':
      return fetch(request)
    default:
      return handleNetworkFirst(request, strategy)
  }
}

// ✅ Determinar estratégia baseada no tipo de recurso
function getStrategy(request) {
  const url = new URL(request.url)
  const pathname = url.pathname
  
  // ✅ CORRIGIDO: Não processar SVGs
  if (pathname.includes('.svg')) {
    return { strategy: 'network-only', maxAge: 0 }
  }
  
  // Imagens
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|ico)$/i)) {
    return CACHE_STRATEGIES.images
  }
  
  // CSS
  if (pathname.includes('/_next/static/css/') || pathname.endsWith('.css')) {
    return CACHE_STRATEGIES.styles
  }
  
  // JavaScript
  if (pathname.includes('/_next/static/js/') || pathname.endsWith('.js')) {
    return CACHE_STRATEGIES.scripts
  }
  
  // APIs
  if (pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.api
  }
  
  // Páginas HTML
  return CACHE_STRATEGIES.documents
}

// ✅ Cache First Strategy
async function handleCacheFirst(request, strategy) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse && !isExpired(cachedResponse, strategy.maxAge)) {
    swLog('Cache hit', { url: request.url })
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      swLog('Network response cached', { url: request.url })
    }
    return networkResponse
  } catch (error) {
    swLog('Network failed, returning cached version', { url: request.url })
    return cachedResponse || handleOffline(request)
  }
}

// ✅ Network First Strategy
async function handleNetworkFirst(request, strategy) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      swLog('Network response cached', { url: request.url })
    }
    return networkResponse
  } catch (error) {
    swLog('Network failed, trying cache', { url: request.url })
    const cachedResponse = await caches.match(request)
    return cachedResponse || handleOffline(request)
  }
}

// ✅ Stale While Revalidate Strategy
async function handleStaleWhileRevalidate(request, strategy) {
  const cachedResponse = await caches.match(request)
  
  // Buscar na rede em background
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE)
      cache.then(c => c.put(request, networkResponse.clone()))
      swLog('Background update completed', { url: request.url })
    }
    return networkResponse
  }).catch(() => {
    swLog('Background update failed', { url: request.url })
  })
  
  // Retornar cache imediatamente se disponível
  if (cachedResponse && !isExpired(cachedResponse, strategy.maxAge)) {
    swLog('Returning cached, updating in background', { url: request.url })
    return cachedResponse
  }
  
  // Se não há cache, aguardar rede
  try {
    return await networkPromise
  } catch (error) {
    return handleOffline(request)
  }
}

// ✅ Verificar se cache expirou
function isExpired(response, maxAge) {
  if (!maxAge) return false
  
  const dateHeader = response.headers.get('date')
  if (!dateHeader) return false
  
  const responseDate = new Date(dateHeader)
  const now = new Date()
  
  return (now.getTime() - responseDate.getTime()) > maxAge
}

// ✅ Tratamento offline melhorado
async function handleOffline(request) {
  const url = new URL(request.url)
  
  // ✅ CORRIGIDO: Para SVGs, retornar resposta vazia em vez de página offline
  if (url.pathname.includes('.svg')) {
    swLog('SVG request offline - returning empty response')
    return new Response('', { 
      status: 404, 
      statusText: 'SVG Not Found',
      headers: { 'Content-Type': 'image/svg+xml' }
    })
  }
  
  // Para páginas HTML, tentar cache offline
  if (request.headers.get('accept')?.includes('text/html')) {
    const offlineResponse = await caches.match('/offline') || 
                           await caches.match('/dashboard') ||
                           await caches.match('/')
    
    if (offlineResponse) {
      swLog('Returning offline page', { url: request.url })
      return offlineResponse
    }
  }
  
  // Resposta padrão offline
  swLog('No offline fallback available', { url: request.url })
  return new Response('Offline - No cached version available', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  })
}

// ✅ Message Event - Comunicação com a aplicação
self.addEventListener('message', (event) => {
  swLog('Message received', { data: event.data })
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    swLog('Skip waiting requested')
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION })
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      )
    }).then(() => {
      swLog('All caches cleared')
      event.ports[0].postMessage({ success: true })
    })
  }
})

// ✅ Error Event
self.addEventListener('error', (event) => {
  swLog('Service Worker error', { 
    error: event.error?.message || 'Unknown error',
    filename: event.filename,
    lineno: event.lineno
  })
})

// ✅ Unhandled Rejection Event
self.addEventListener('unhandledrejection', (event) => {
  swLog('Unhandled promise rejection', { 
    reason: event.reason?.message || event.reason 
  })
  event.preventDefault()
})

swLog('Service Worker v4.1.0 script loaded successfully')
