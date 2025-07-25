'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAContextType {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  installPrompt: BeforeInstallPromptEvent | null
  installApp: () => Promise<void>
  showInstallPrompt: boolean
  dismissInstallPrompt: () => void
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = 'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true
      setIsInstalled(isStandalone || isIOSStandalone)
    }

    const checkDismissedStatus = () => {
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (dismissed) {
        const dismissedTime = parseInt(dismissed)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
        return dismissedTime > sevenDaysAgo
      }
      return false
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired')
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setInstallPrompt(promptEvent)
      setIsInstallable(true)
      console.log('PWA: Install prompt stored, isInstallable set to true')
      
      if (!isInstalled && !checkDismissedStatus()) {
        console.log('PWA: Scheduling install prompt to show in 10 seconds')
        setTimeout(() => {
          if (!isInstalled) {
            console.log('PWA: Showing install prompt')
            setShowInstallPrompt(true)
          }
        }, 10000)
      } else {
        console.log('PWA: Not showing prompt - installed:', isInstalled, 'dismissed:', checkDismissedStatus())
      }
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setShowInstallPrompt(false)
      setInstallPrompt(null)
      localStorage.removeItem('pwa-install-dismissed')
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    checkInstalled()
    setIsOnline(navigator.onLine)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isInstalled])

  const installApp = async () => {
    if (!installPrompt) {
      console.error('No install prompt available')
      return
    }

    try {
      console.log('Attempting to show install prompt')
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice
      console.log('User choice:', choiceResult.outcome)
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setShowInstallPrompt(false)
      }
      setInstallPrompt(null)
    } catch (error) {
      console.error('Error installing app:', error)
    }
  }

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  const value: PWAContextType = {
    isInstallable,
    isInstalled,
    isOnline,
    installPrompt,
    installApp,
    showInstallPrompt,
    dismissInstallPrompt
  }

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  )
}

export function usePWA() {
  const context = useContext(PWAContext)
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}
