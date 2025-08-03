// ✅ SERVICE WORKER v5.0.0 - SOLUÇÃO DEFINITIVA
// Corrige "body stream already read" não interceptando APIs problemáticas

const CACHE_VERSION = 'fichachef-v5.0.0'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const SW_VERSION = 'SW v5.0.0'

// ✅ ARQUIVOS ESTÁTICOS PARA CACHE
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/icon.png',
  '/favicon.ico'
]

// ✅ APIs QUE NUNCA DEVEM SER INTERCEPTADAS (RESOLVE BODY STREAM ALREADY READ)
const NEVER_INTERCEPT_APIS = [
  '/api/notifications',
  '/api/insumos',
  '/api/fichas-tecnicas',
  '/api/produtos',
  '/api/fornecedores',
  '/api/dashboard-stats',
  '/api/auth',
  '/api/user-preferences'
]

// ✅ FUNÇÃO DE LOG PADRONIZADA
function swLog(message, data = null) {
  const timestamp = new Date().toISOString()
  const logData = {
    timestamp,
    version: SW_VERSION,
    message,
    ...(data && { data })
  }
  console.log(`[${SW_VERSION}] ${message}`, logData)
}

// ✅ INSTALL EVENT - CACHE INICIAL
self.addEventListener('install', (event) => {
  swLog('Installing Service Worker v5.0.0')
  
  event.waitUntil(
    Promise.all([
      // Cache de arquivos estáticos
      caches.open(STATIC_CACHE).then(async (cache) => {
        swLog('Caching static assets')
        
        const cachePromises = STATIC_ASSETS.map(async (asset) => {
          try {
            await cache.add(asset)
            swLog('Cached successfully', { asset })
          } catch (error) {
            swLog('Failed to cache asset', { asset, error: error.message })
          }
        })
        
        await Promise.allSettled(cachePromises)
        swLog('Static assets caching completed')
      })
    ]).then(() => {
      swLog('Service Worker installation completed')
      return self.skipWaiting()
    })
  )
})

// ✅ ACTIVATE EVENT - LIMPEZA DE CACHES ANTIGOS
self.addEventListener('activate', (event) => {
  swLog('Activating Service Worker v5.0.0')
  
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
      
      // Tomar controle de todas as abas
      self.clients.claim()
    ]).then(() => {
      swLog('Service Worker activated successfully')
    })
  )
})

// ✅ FETCH EVENT - ESTRATÉGIA CORRIGIDA
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // ✅ IGNORAR REQUESTS NÃO-GET
  if (request.method !== 'GET') {
    return
  }
  
  // ✅ IGNORAR REQUESTS EXTERNOS
  if (url.origin !== self.location.origin) {
    return
  }
  
  // ✅ CRÍTICO: NUNCA INTERCEPTAR APIs PROBLEMÁTICAS
  const isProblematicAPI = NEVER_INTERCEPT_APIS.some(api => 
    url.pathname.startsWith(api)
  )
  
  if (isProblematicAPI) {
    swLog('Skipping problematic API (prevents body stream already read)', { 
      url: url.pathname 
    })
    return // ✅ DEIXAR FETCH NORMAL SEM INTERCEPTAÇÃO
  }
  
  swLog('Handling request', { url: url.pathname })
  
  // ✅ ESTRATÉGIA POR TIPO DE RECURSO
  if (url.pathname.startsWith('/_next/') || url.pathname.includes('.')) {
    // ✅ ASSETS ESTÁTICOS - Cache First
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          swLog('Cache hit', { url: url.pathname })
          
          // ✅ BACKGROUND UPDATE SEGURO
          fetch(request).then((response) => {
            if (response.ok && response.status === 200) {
              try {
                const responseClone = response.clone()
                caches.open(STATIC_CACHE).then((cache) => {
                  cache.put(request, responseClone).catch(() => {
                    // Ignorar erros de cache
                  })
                })
                swLog('Background update completed', { url: url.pathname })
              } catch (error) {
                swLog('Failed to clone response for background update', { 
                  url: url.pathname, 
                  error: error.message 
                })
              }
            }
          }).catch(() => {
            // Ignorar erros de background update
          })
          
          return cachedResponse
        }
        
        // ✅ NETWORK FALLBACK COM TRATAMENTO SEGURO
        return fetch(request).then((response) => {
          if (response.ok && response.status === 200) {
            try {
              const responseClone = response.clone()
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone).catch(() => {
                  // Ignorar erros de cache
                })
              })
              swLog('Network response cached', { url: url.pathname })
            } catch (error) {
              swLog('Failed to clone response for caching', { 
                url: url.pathname, 
                error: error.message 
              })
            }
          }
          return response
        }).catch((error) => {
          swLog('Network request failed', { url: url.pathname, error: error.message })
          return new Response('Offline', { status: 503 })
        })
      })
    )
  } else {
    // ✅ PÁGINAS DINÂMICAS - Network First
    event.respondWith(
      fetch(request).then((response) => {
        swLog('Network response served', { url: url.pathname })
        return response
      }).catch((error) => {
        swLog('Network request failed', { url: url.pathname, error: error.message })
        
        // ✅ FALLBACK PARA CACHE
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            swLog('Serving from cache', { url: url.pathname })
            return cachedResponse
          }
          
          // ✅ FALLBACK PARA PÁGINA OFFLINE
          if (url.pathname.startsWith('/dashboard')) {
            return caches.match('/login')
          }
          
          return new Response('Offline', { status: 503 })
        })
      })
    )
  }
})

// ✅ MESSAGE EVENT - COMUNICAÇÃO COM CLIENTE
self.addEventListener('message', (event) => {
  const { data } = event
  
  if (data.type === 'SKIP_WAITING') {
    swLog('Received skip waiting message')
    self.skipWaiting()
  }
  
  if (data.type === 'CLEAR_CACHE') {
    swLog('Received clear cache message')
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      )
    }).then(() => {
      swLog('All caches cleared')
      event.ports[0]?.postMessage({ success: true })
    })
  }
  
  if (data.type === 'GET_VERSION') {
    swLog('Received version request')
    event.ports[0]?.postMessage({ version: SW_VERSION })
  }
})

// ✅ ERROR EVENT - TRATAMENTO DE ERROS
self.addEventListener('error', (event) => {
  swLog('Service Worker error', { 
    message: event.message,
    filename: event.filename,
    lineno: event.lineno 
  })
})

// ✅ UNHANDLED REJECTION - PREVENIR LOGS DESNECESSÁRIOS
self.addEventListener('unhandledrejection', (event) => {
  swLog('Unhandled promise rejection handled', { 
    reason: event.reason?.message || event.reason 
  })
  // ✅ PREVENIR QUE APAREÇA NO CONSOLE
  event.preventDefault()
})

// ✅ SYNC EVENT - BACKGROUND SYNC (FUTURO)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    swLog('Background sync triggered')
    // Implementar sincronização em background no futuro
  }
})

// ✅ PUSH EVENT - NOTIFICAÇÕES PUSH (FUTURO)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    swLog('Push notification received', data)
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon.png',
        badge: '/icon.png'
      })
    )
  }
})

swLog('Service Worker v5.0.0 script loaded successfully')

