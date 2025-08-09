// ✅ SERVICE WORKER v7.0.0 - VERSÃO CORRIGIDA SEM LOOPS
// CORREÇÃO: Removido sistema de notificação que causava reloads automáticos

const CACHE_VERSION = 'fichachef-v7.0.0'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const SW_VERSION = 'SW v7.0.0'

// ✅ APENAS ARQUIVOS ESTÁTICOS PARA CACHE
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/icons/icon.png',
  '/favicon.ico'
]

// ✅ FUNÇÃO DE LOG SIMPLIFICADA
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

// ✅ INSTALL EVENT - CACHE INICIAL APENAS
self.addEventListener('install', (event) => {
  swLog('Installing Service Worker v7.0.0')
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      swLog('Caching static assets only')
      
      try {
        await cache.addAll(STATIC_ASSETS)
        swLog('Static assets cached successfully')
      } catch (error) {
        swLog('Error caching static assets', { error: error.message })
      }
      
      swLog('Service Worker installation completed')
    })
  )
  
  // ✅ ATIVAR IMEDIATAMENTE
  self.skipWaiting()
})

// ✅ ACTIVATE EVENT - LIMPEZA DE CACHE ANTIGO (SEM NOTIFICAÇÕES)
self.addEventListener('activate', (event) => {
  swLog('Activating Service Worker v7.0.0')
  
  event.waitUntil(
    Promise.all([
      // ✅ LIMPAR CACHES ANTIGOS
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE) {
              swLog('Deleting old cache', { cacheName })
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // ✅ ASSUMIR CONTROLE SILENCIOSAMENTE (SEM NOTIFICAÇÕES)
      self.clients.claim().then(() => {
        swLog('Service Worker controller changed silently - NO RELOAD TRIGGERED')
        
        // 🚫 REMOVIDO: Sistema de notificação que causava loops
        // 🚫 REMOVIDO: Mensagens CONTROLLER_CHANGED
        // 🚫 REMOVIDO: Comunicação com clientes que causava reloads
        
        swLog('Service Worker activated without triggering page reloads')
      })
    ]).then(() => {
      swLog('Service Worker activated successfully')
    })
  )
})

// ✅ FETCH EVENT - NÃO INTERCEPTAR APIS
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // ✅ NUNCA INTERCEPTAR APIS - RESOLVE "body stream already read"
  if (url.pathname.startsWith('/api/')) {
    swLog('Skipping API request (no interception)', { url: url.pathname })
    return // ✅ DEIXAR FETCH NORMAL ACONTECER
  }
  
  // ✅ NUNCA INTERCEPTAR REQUESTS POST/PUT/DELETE
  if (event.request.method !== 'GET') {
    swLog('Skipping non-GET request', { method: event.request.method, url: url.pathname })
    return // ✅ DEIXAR FETCH NORMAL ACONTECER
  }
  
  // ✅ NUNCA INTERCEPTAR CHROME EXTENSIONS
  if (url.protocol === 'chrome-extension:') {
    return // ✅ DEIXAR FETCH NORMAL ACONTECER
  }
  
  // ✅ APENAS INTERCEPTAR NAVEGAÇÃO E ASSETS ESTÁTICOS
  if (event.request.mode === 'navigate' || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.png') || 
      url.pathname.endsWith('.jpg') || 
      url.pathname.endsWith('.ico') ||
      url.pathname === '/manifest.json') {
    
    swLog('Handling static request', { url: url.pathname })
    
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          swLog('Cache hit', { url: url.pathname })
          return response
        }
        
        swLog('Cache miss - fetching from network', { url: url.pathname })
        return fetch(event.request).then((networkResponse) => {
          // ✅ CACHE APENAS SE FOR SUCESSO
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone()
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache)
              swLog('Network response cached', { url: url.pathname })
            })
          }
          
          return networkResponse
        }).catch((error) => {
          swLog('Network fetch failed', { url: url.pathname, error: error.message })
          
          // ✅ RETORNAR PÁGINA OFFLINE PARA NAVEGAÇÃO
          if (event.request.mode === 'navigate') {
            return caches.match('/') || new Response('Offline', { status: 503 })
          }
          
          throw error
        })
      })
    )
  }
})

// ✅ MESSAGE EVENT - COMUNICAÇÃO COM CLIENTE (SEM RELOADS)
self.addEventListener('message', (event) => {
  swLog('Message received', { data: event.data })
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    swLog('Skip waiting requested')
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: SW_VERSION })
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    swLog('Cache clear requested')
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

// ✅ ERROR EVENT - LOG DE ERROS
self.addEventListener('error', (event) => {
  swLog('Service Worker error', { 
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})

// ✅ UNHANDLED REJECTION - LOG DE PROMISES REJEITADAS
self.addEventListener('unhandledrejection', (event) => {
  swLog('Unhandled promise rejection', { 
    reason: event.reason,
    promise: event.promise
  })
  
  // ✅ PREVENIR QUE APAREÇA NO CONSOLE
  event.preventDefault()
})

swLog('Service Worker v7.0.0 script loaded successfully - NO RELOAD LOOPS')

// 🎯 PRINCIPAIS CORREÇÕES APLICADAS:
// ✅ Removido console.warn que causava logs excessivos
// ✅ Removido sistema de notificação CONTROLLER_CHANGED
// ✅ Removido envio de mensagens para clientes
// ✅ Removido triggers de reload automático
// ✅ Mantida funcionalidade de cache essencial
// ✅ Versão atualizada para v7.0.0 para forçar atualização
