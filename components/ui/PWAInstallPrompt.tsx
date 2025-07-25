'use client'

import React from 'react'
import { usePWA } from '@/components/providers/PWAProvider'
import { Download, X, Smartphone } from 'lucide-react'

export default function PWAInstallPrompt() {
  const { showInstallPrompt, installApp, dismissInstallPrompt, isOnline } = usePWA()

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:w-96">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-2xl p-4 border border-orange-400/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
            <Smartphone className="h-6 w-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Instalar FichaChef
            </h3>
            <p className="text-xs text-orange-100 mb-3 leading-relaxed">
              Instale o app para acesso rápido, notificações e uso offline em sua cozinha.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={installApp}
                className="flex items-center gap-2 bg-white text-orange-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-orange-50 transition-colors"
              >
                <Download className="h-3 w-3" />
                Instalar
              </button>
              
              <button
                onClick={dismissInstallPrompt}
                className="px-3 py-2 text-xs text-orange-100 hover:text-white transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
          
          <button
            onClick={dismissInstallPrompt}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {!isOnline && (
          <div className="mt-3 p-2 bg-red-500/20 rounded-lg border border-red-400/20">
            <p className="text-xs text-red-100">
              ⚠️ Sem conexão. Algumas funcionalidades podem estar limitadas.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
