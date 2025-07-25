'use client'

import React from 'react'
import { usePWA } from '@/components/providers/PWAProvider'
import { WifiOff } from 'lucide-react'

export default function OfflineIndicator() {
  const { isOnline } = usePWA()

  if (isOnline) return null

  return (
    <div className="fixed top-16 left-4 right-4 z-40 lg:left-auto lg:right-4 lg:w-80">
      <div className="bg-red-500 text-white rounded-lg shadow-lg p-3 border border-red-400/20">
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Modo Offline</p>
            <p className="text-xs text-red-100">
              Algumas funcionalidades podem estar limitadas
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
