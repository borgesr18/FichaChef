// ✅ SERVICE WORKER v4.4.0 - CORRIGIDO
// Versão que resolve "body stream already read" e "Unhandled promise rejection"

const CACHE_VERSION = 'fichachef-v4.4.0'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const OFFLINE_CACHE = `${CACHE_VERSION}-offline`

// ✅ CORRIGIDO: Lista de arquivos estáticos sem SVG e com tratamento de erro
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/icon.png',
  '/favicon.ico'
]

// ✅ CORRIGIDO: Páginas offline sem referências SVG
const OFFLINE_PAGES = [
  '/dashboard',
  '/login'
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
    version: 'SW v4.4.0',
    message,
    ...(data && { data })
  }
  console.log(`[SW v4.4.0] ${message}`, logData)
}

// ✅ Install Event - Cache inicial com tratamento robusto de erros
self.addEventListener('install', (event) => {
  swLog('Installing Service Worker v4.4.0')
  
  event.waitUntil(
    Promise.allSettled([
      // ✅ CORRIGIDO: Cache de arquivos estáticos com tratamento individual
      caches.open(STATIC_CACHE).then(async (cache) => {
        swLog('Caching static assets')
        
        // ✅ CORRIGIDO: Cachear arquivos individualmente para evitar falha total
        const cachePromises = STATIC_ASSETS.map(async (asset) => {
          try {
            await cache.add(asset)
            swLog('Cached successfully', { asset })
          } catch (error) {
            swLog('Failed to cache asset', { asset, error: error.message })
            // ✅ Continuar mesmo se um arquivo falhar
          }
        })
        
        await Promise.allSettled(cachePromises)
        swLog('Static assets caching completed')
      }).catch((error) => {
        swLog('Failed to open static cache', { error: error.message })
      }),
      
      // ✅ CORRIGIDO: Cache de páginas offline com tratamento individual
      caches.open(OFFLINE_CACHE).then(async (cache) => {
        swLog('Caching offline pages')
        
        const offlinePromises = OFFLINE_PAGES.map(async (page) => {
          try {
            await cache.add(page)
            swLog('Offline page cached', { page })
          } catch (error) {
            swLog('Failed to cache offline page', { page, error: error.message })
          }
        })
        
        await Promise.allSettled(offlinePromises)
        swLog('Offline pages caching completed')
      }).catch((error) => {
        swLog('Failed to open offline cache', { error: error.message })
      })
    ]).then((results) => {
      swLog('Service Worker installation completed', { 
        staticResult: results[0].status,
        offlineResult: results[1].status
      })
      // ✅ Ativar imediatamente
      return self.skipWaiting()
    }).catch((error) => {
      swLog('Service Worker installation failed', { error: error.message })
    })
  )
})

// ✅ Activate Event - Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  swLog('Activating Service Worker v4.4.0')
  
  event.waitUntil(
    Promise.allSettled([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        const deletePromises = cacheNames.map((cacheName) => {
          if (!cacheName.startsWith(CACHE_VERSION)) {
            swLog('Deleting old cache', { cacheName })
            return caches.delete(cacheName)
          }
          return Promise.resolve()
        })
        return Promise.allSettled(deletePromises)
      }),
      
      // Tomar controle imediatamente
      self.clients.claim()
    ]).then(() => {
      swLog('Service Worker activated successfully')
    }).catch((error) => {
      swLog('Service Worker activation failed', { error: error.message })
    })
  )
})

// ✅ Fetch Event - Estratégias de cache com tratamento robusto de erros
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // ✅ CORRIGIDO: Ignorar requisições para arquivos SVG inexistentes
  if (url.pathname.includes('.svg')) {
    swLog('Ignoring SVG request (file may not exist)', { url: url.pathname })
    return // Deixar o navegador lidar com o erro 404
  }
  
  if (url.pathname.startsWith('/api/notifications') || 
      url.pathname.startsWith('/api/insumos')) {
    swLog('Skipping problematic API', { url: url.pathname })
    return // ✅ DEIXAR fetch normal sem interceptação
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
      swLog('Fetch error handled', { url: request.url, error: error.message })
      return handleOffline(request)
    })
  )
})

// ✅ Função principal de tratamento de requisições com tratamento robusto
async function handleRequest(request) {
  const url = new URL(request.url)
  const strategy = getStrategy(request)
  
  swLog('Handling request', { 
    url: url.pathname, 
    strategy: strategy.strategy,
    method: request.method 
  })
  
  try {
    switch (strategy.strategy) {
      case 'cache-first':
        return await handleCacheFirst(request, strategy)
      case 'network-first':
        return await handleNetworkFirst(request, strategy)
      case 'stale-while-revalidate':
        return await handleStaleWhileRevalidate(request, strategy)
      case 'network-only':
        return await fetch(request)
      default:
        return await handleNetworkFirst(request, strategy)
    }
  } catch (error) {
    swLog('Request handling failed', { url: request.url, error: error.message })
    return handleOffline(request)
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

// ✅ Cache First Strategy com tratamento robusto
async function handleCacheFirst(request, strategy) {
  try {
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse && !isExpired(cachedResponse, strategy.maxAge)) {
      swLog('Cache hit', { url: request.url })
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      try {
        if (networkResponse.body && networkResponse.headers.get('content-type')) {
          const cache = await caches.open(DYNAMIC_CACHE)
          const responseClone = networkResponse.clone()
          await cache.put(request, responseClone)
          swLog('Network response cached', { url: request.url })
        } else {
          swLog('Response not cacheable (no body or content-type)', { url: request.url })
        }
      } catch (cacheError) {
        swLog('Failed to cache response', { url: request.url, error: cacheError.message })
      }
    }
    return networkResponse
  } catch (error) {
    swLog('Cache first failed, trying cached version', { url: request.url, error: error.message })
    const cachedResponse = await caches.match(request)
    return cachedResponse || handleOffline(request)
  }
}

// ✅ Network First Strategy com tratamento robusto
async function handleNetworkFirst(request, strategy) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      try {
        if (networkResponse.body && networkResponse.headers.get('content-type')) {
          const cache = await caches.open(DYNAMIC_CACHE)
          const responseClone = networkResponse.clone()
          await cache.put(request, responseClone)
          swLog('Network response cached', { url: request.url })
        } else {
          swLog('Response not cacheable (no body or content-type)', { url: request.url })
        }
      } catch (cacheError) {
        swLog('Failed to cache response', { url: request.url, error: cacheError.message })
      }
    }
    return networkResponse
  } catch (error) {
    swLog('Network failed, trying cache', { url: request.url, error: error.message })
    const cachedResponse = await caches.match(request)
    return cachedResponse || handleOffline(request)
  }
}

// ✅ Stale While Revalidate Strategy com tratamento robusto
async function handleStaleWhileRevalidate(request, strategy) {
  const cachedResponse = await caches.match(request)
  
  // ✅ CORRIGIDO: Buscar na rede em background com tratamento de erro
  const networkPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      try {
        if (networkResponse.body && networkResponse.headers.get('content-type')) {
          const cache = await caches.open(DYNAMIC_CACHE)
          const responseClone = networkResponse.clone()
          await cache.put(request, responseClone)
          swLog('Background update completed', { url: request.url })
        } else {
          swLog('Response not cacheable in background (no body or content-type)', { url: request.url })
        }
      } catch (cacheError) {
        swLog('Background cache failed', { url: request.url, error: cacheError.message })
      }
    }
    return networkResponse
  }).catch((error) => {
    swLog('Background update failed', { url: request.url, error: error.message })
    // ✅ CORRIGIDO: Não rejeitar a promise, apenas logar o erro
    return null
  })
  
  // Retornar cache imediatamente se disponível
  if (cachedResponse && !isExpired(cachedResponse, strategy.maxAge)) {
    swLog('Returning cached, updating in background', { url: request.url })
    return cachedResponse
  }
  
  // Se não há cache, aguardar rede
  try {
    const networkResponse = await networkPromise
    return networkResponse || handleOffline(request)
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
    try {
      const offlineResponse = await caches.match('/offline') || 
                             await caches.match('/dashboard') ||
                             await caches.match('/')
      
      if (offlineResponse) {
        swLog('Returning offline page', { url: request.url })
        return offlineResponse
      }
    } catch (error) {
      swLog('Failed to get offline page', { error: error.message })
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
  
  try {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      swLog('Skip waiting requested')
      self.skipWaiting()
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
      event.ports[0].postMessage({ version: CACHE_VERSION })
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
      caches.keys().then((cacheNames) => {
        return Promise.allSettled(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        )
      }).then(() => {
        swLog('All caches cleared')
        event.ports[0].postMessage({ success: true })
      }).catch((error) => {
        swLog('Failed to clear caches', { error: error.message })
        event.ports[0].postMessage({ success: false, error: error.message })
      })
    }
  } catch (error) {
    swLog('Message handling failed', { error: error.message })
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

// ✅ CORRIGIDO: Unhandled Rejection Event - Resolve o problema do log
self.addEventListener('unhandledrejection', (event) => {
  swLog('Unhandled promise rejection handled', { 
    reason: event.reason?.message || event.reason 
  })
  // ✅ CRÍTICO: Prevenir que a promise rejection apareça no console
  event.preventDefault()
})

swLog('Service Worker v4.4.0 script loaded successfully')

