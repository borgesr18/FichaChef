/**
 * Utilitários para gerenciamento do Service Worker
 */

import { logger } from './logger'

export interface ServiceWorkerStatus {
  isSupported: boolean
  isRegistered: boolean
  isActive: boolean
  version?: string
  cacheStatus?: Record<string, number>
}

export interface ServiceWorkerManager {
  register: () => Promise<ServiceWorkerRegistration | null>
  unregister: () => Promise<boolean>
  update: () => Promise<void>
  getStatus: () => Promise<ServiceWorkerStatus>
  clearCache: () => Promise<void>
  getCacheStatus: () => Promise<Record<string, number> | null>
  onUpdate: (callback: (registration: ServiceWorkerRegistration) => void) => void
  onControllerChange: (callback: () => void) => void
}

class ServiceWorkerManagerImpl implements ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null
  private updateCallbacks: ((registration: ServiceWorkerRegistration) => void)[] = []
  private controllerChangeCallbacks: (() => void)[] = []

  constructor() {
    this.setupEventListeners()
  }

  /**
   * Configura listeners para eventos do Service Worker
   */
  private setupEventListeners(): void {
    if (!this.isSupported()) return

    // Listener para mudanças no controller
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      logger.info('Service Worker controller changed')
      this.controllerChangeCallbacks.forEach(callback => callback())
    })

    // Listener para mensagens do Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      logger.debug('Message from Service Worker', { data: event.data })
    })
  }

  /**
   * Verifica se Service Workers são suportados
   */
  private isSupported(): boolean {
    return 'serviceWorker' in navigator
  }

  /**
   * Registra o Service Worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      logger.warn('Service Workers not supported')
      return null
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      logger.info('Service Worker registered successfully', {
        scope: this.registration.scope,
        state: this.registration.active?.state
      })

      // Configurar listeners para atualizações
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing
        if (newWorker) {
          logger.info('New Service Worker found, installing...')
          
          newWorker.addEventListener('statechange', () => {
            logger.info('Service Worker state changed', { state: newWorker.state })
            
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível
              logger.info('New Service Worker installed, update available')
              this.updateCallbacks.forEach(callback => callback(this.registration!))
            }
          })
        }
      })

      return this.registration
    } catch (error) {
      logger.error('Service Worker registration failed', error as Error)
      return null
    }
  }

  /**
   * Remove o registro do Service Worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      logger.warn('No Service Worker registration to unregister')
      return false
    }

    try {
      const result = await this.registration.unregister()
      if (result) {
        logger.info('Service Worker unregistered successfully')
        this.registration = null
      }
      return result
    } catch (error) {
      logger.error('Service Worker unregistration failed', error as Error)
      return false
    }
  }

  /**
   * Força atualização do Service Worker
   */
  async update(): Promise<void> {
    if (!this.registration) {
      logger.warn('No Service Worker registration to update')
      return
    }

    try {
      await this.registration.update()
      logger.info('Service Worker update check completed')
    } catch (error) {
      logger.error('Service Worker update failed', error as Error)
    }
  }

  /**
   * Obtém status atual do Service Worker
   */
  async getStatus(): Promise<ServiceWorkerStatus> {
    const isSupported = this.isSupported()
    const isRegistered = !!this.registration
    const isActive = !!this.registration?.active

    let cacheStatus: Record<string, number> | undefined
    try {
      cacheStatus = await this.getCacheStatus() || undefined
    } catch (error) {
      logger.warn('Failed to get cache status', error as Record<string, unknown>)
    }

    return {
      isSupported,
      isRegistered,
      isActive,
      cacheStatus
    }
  }

  /**
   * Limpa todos os caches do Service Worker
   */
  async clearCache(): Promise<void> {
    if (!this.registration?.active) {
      logger.warn('No active Service Worker to clear cache')
      return
    }

    try {
      // Enviar mensagem para o Service Worker limpar cache
      this.registration.active.postMessage({ type: 'CLEAR_CACHE' })
      logger.info('Cache clear request sent to Service Worker')
    } catch (error) {
      logger.error('Failed to clear Service Worker cache', error as Error)
    }
  }

  /**
   * Obtém status dos caches
   */
  async getCacheStatus(): Promise<Record<string, number> | null> {
    if (!this.registration?.active) {
      return null
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.caches || null)
      }

      this.registration!.active!.postMessage(
        { type: 'GET_CACHE_STATUS' },
        [messageChannel.port2]
      )

      // Timeout após 5 segundos
      setTimeout(() => resolve(null), 5000)
    })
  }

  /**
   * Registra callback para atualizações
   */
  onUpdate(callback: (registration: ServiceWorkerRegistration) => void): void {
    this.updateCallbacks.push(callback)
  }

  /**
   * Registra callback para mudanças no controller
   */
  onControllerChange(callback: () => void): void {
    this.controllerChangeCallbacks.push(callback)
  }

  /**
   * Força skip waiting do Service Worker
   */
  async skipWaiting(): Promise<void> {
    if (!this.registration?.waiting) {
      logger.warn('No waiting Service Worker to skip')
      return
    }

    try {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      logger.info('Skip waiting message sent to Service Worker')
    } catch (error) {
      logger.error('Failed to send skip waiting message', error as Error)
    }
  }
}

// Instância singleton
export const serviceWorkerManager = new ServiceWorkerManagerImpl()

/**
 * Função para inicializar o Service Worker
 */
export async function initializeServiceWorker() {
  // Registrar Service Worker
  await serviceWorkerManager.register()

  // Configurar callbacks
  serviceWorkerManager.onUpdate(() => {
    logger.info('Service Worker update available')
  })

  serviceWorkerManager.onControllerChange(() => {
    // ✅ LOG DETALHADO ANTES DO RELOAD
    console.warn('🔄 SERVICE WORKER CONTROLLER CHANGE DETECTED!')
    console.warn('📍 Origem: service-worker-utils.ts linha 272')
    console.warn('⏰ Timestamp:', new Date().toISOString())
    console.warn('🔍 Stack trace:', new Error().stack)
    
    logger.info('Service Worker controller changed, reloading in 3 seconds...')
    
    // ✅ DELAY PARA PERMITIR ANÁLISE DOS LOGS
    setTimeout(() => {
      console.warn('🚀 EXECUTANDO RELOAD AGORA!')
      window.location.reload()
    }, 3000)
  })

  return serviceWorkerManager
}

/**
 * Utilitário para notificações de atualização
 */
export function createUpdateNotification(onUpdate: () => void) {
  return {
    show: () => {
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('FichaChef - Atualização Disponível', {
          body: 'Uma nova versão está disponível. Clique para atualizar.',
          icon: '/icons/icon.svg',
          badge: '/icons/icon.svg',
          tag: 'app-update',
          requireInteraction: true
        })

        notification.onclick = () => {
          onUpdate()
          notification.close()
        }
      }
    },
    
    requestPermission: async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        logger.info('Notification permission', { permission })
        return permission === 'granted'
      }
      return false
    }
  }
}

/**
 * Função para verificar o status online/offline
 */
export function getOnlineStatus() {
  return navigator.onLine
}

/**
 * Função para adicionar listeners de status online/offline
 */
export function addOnlineStatusListeners(onOnline: () => void, onOffline: () => void) {
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  
  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

/**
 * Utilitário para instalar PWA
 */
export function setupPWAInstall() {
  let installPrompt: Event & { prompt?: () => Promise<void>; userChoice?: Promise<{ outcome: string }> } | null = null
  let isInstallable = false

  const handleBeforeInstallPrompt = (event: Event & { prompt?: () => Promise<void>; userChoice?: Promise<{ outcome: string }> }) => {
    event.preventDefault()
    installPrompt = event
    isInstallable = true
    logger.info('PWA install prompt available')
  }

  const handleAppInstalled = () => {
    installPrompt = null
    isInstallable = false
    logger.info('PWA installed successfully')
  }

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)

  const install = async () => {
    if (!installPrompt || !installPrompt.prompt) return false

    try {
      await installPrompt.prompt()
      const userChoice = await installPrompt.userChoice
      logger.info('PWA install prompt result', { outcome: userChoice?.outcome })
      
      if (userChoice?.outcome === 'accepted') {
        installPrompt = null
        isInstallable = false
        return true
      }
    } catch (error) {
      logger.error('PWA install failed', error as Error)
    }

    return false
  }

  const getInstallableStatus = () => isInstallable

  const cleanup = () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
  }

  return {
    install,
    getInstallableStatus,
    cleanup
  }
}

