'use client'

import React, { useState } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Bug, RefreshCw, Trash2, EyeOff } from 'lucide-react'

// ✅ Painel de debug para verificar role em tempo real
export default function DebugPanel() {
  const { user, userRole, loading, refreshUserRole, clearCache } = useSupabase()
  const [isVisible, setIsVisible] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshRole = async () => {
    setIsRefreshing(true)
    console.log('🔄 Forçando refresh do role...')
    await refreshUserRole()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleClearCache = () => {
    console.log('🧹 Limpando cache...')
    clearCache()
    alert('Cache limpo! Faça logout e login novamente.')
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg z-50"
        title="Abrir Debug Panel"
      >
        <Bug className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-50 w-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 flex items-center">
          <Bug className="h-4 w-4 mr-2" />
          Debug Panel
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <EyeOff className="h-4 w-4" />
        </button>
      </div>

      {/* User Info */}
      <div className="space-y-2 text-sm">
        <div className="bg-gray-50 p-2 rounded">
          <strong>Email:</strong> {user?.email || 'Não logado'}
        </div>
        
        <div className="bg-gray-50 p-2 rounded">
          <strong>User ID:</strong> {user?.id || 'N/A'}
        </div>

        <div className={`p-2 rounded ${
          userRole === 'chef' ? 'bg-green-100 text-green-800' :
          userRole === 'gerente' ? 'bg-blue-100 text-blue-800' :
          userRole === 'cozinheiro' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          <strong>Role:</strong> {userRole || 'Carregando...'}
          {userRole === 'chef' && ' 👨‍🍳 (Admin Completo)'}
          {userRole === 'gerente' && ' 👔 (Limitado)'}
          {userRole === 'cozinheiro' && ' 🍳 (Básico)'}
        </div>

        <div className="bg-gray-50 p-2 rounded">
          <strong>Loading:</strong> {loading ? 'Sim' : 'Não'}
        </div>

        <div className="bg-gray-50 p-2 rounded">
          <strong>Cache Role:</strong> {localStorage.getItem('fichachef-user-role') || 'Vazio'}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-2">
        <button
          onClick={handleRefreshRole}
          disabled={isRefreshing}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-2 rounded text-sm flex items-center justify-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar Role'}
        </button>

        <button
          onClick={handleClearCache}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar Cache
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-3 text-xs text-gray-600 bg-yellow-50 p-2 rounded">
        <strong>💡 Dica:</strong> Se o role não estiver correto:
        <br />1. Clique em &quot;Atualizar Role&quot;
        <br />2. Se não funcionar, clique em &quot;Limpar Cache&quot;
        <br />3. Faça logout e login novamente
      </div>
    </div>
  )
}

