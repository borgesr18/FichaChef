'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from './providers/SupabaseProvider'

export default function DebugPanel() {
  const { user, userRole, loading, refreshUserRole, clearCache } = useSupabase()
  const [isOpen, setIsOpen] = useState(false)
  const [cacheRole, setCacheRole] = useState<string>('')
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  // ✅ TIMEOUT DE LOADING: Evitar loading infinito
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true)
        console.warn('⚠️ Debug Panel: Loading timeout atingido')
      }, 10000) // 10 segundos

      return () => {
        clearTimeout(timer)
        setLoadingTimeout(false)
      }
    } else {
      setLoadingTimeout(false)
    }
  }, [loading])

  // ✅ MONITORAR CACHE
  useEffect(() => {
    const cached = localStorage.getItem('fichachef-user-role') || 'Vazio'
    setCacheRole(cached)
  }, [userRole])

  // ✅ FUNÇÃO DE REFRESH COM PROTEÇÃO
  const handleRefreshRole = async () => {
    console.log('🔄 Debug Panel: Solicitando refresh do role...')
    try {
      await refreshUserRole()
    } catch (error) {
      console.error('💥 Erro ao atualizar role:', error)
    }
  }

  // ✅ FUNÇÃO DE LIMPEZA COMPLETA
  const handleClearCache = () => {
    console.log('🧹 Debug Panel: Limpando cache completo...')
    clearCache()
    setCacheRole('Vazio')
  }

  if (!user) return null

  return (
    <>
      {/* ✅ BOTÃO FLUTUANTE */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-200"
        title="Debug Panel"
      >
        🐛
      </button>

      {/* ✅ PAINEL DE DEBUG */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              🐛 Debug Panel
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-sm">
            {/* ✅ INFORMAÇÕES DO USUÁRIO */}
            <div>
              <strong>Email:</strong> {user.email}
            </div>

            <div>
              <strong>User ID:</strong> {user.id}
            </div>

            {/* ✅ ROLE COM STATUS VISUAL */}
            <div>
              <strong>Role:</strong>{' '}
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  userRole === 'chef' ? 'bg-orange-100 text-orange-800' :
                  userRole === 'gerente' ? 'bg-blue-100 text-blue-800' :
                  userRole === 'cozinheiro' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {userRole || 'null'}
                {userRole === 'chef' && ' 👨‍🍳 (Admin Completo)'}
                {userRole === 'gerente' && ' 👔 (Gerencial)'}
                {userRole === 'cozinheiro' && ' 🍳 (Básico)'}
                {!userRole && ' ❓ (Indefinido)'}
              </span>
            </div>

            {/* ✅ STATUS DE LOADING COM TIMEOUT */}
            <div>
              <strong>Loading:</strong>{' '}
              <span className={loading ? 'text-orange-600' : 'text-green-600'}>
                {loading ? (loadingTimeout ? 'Timeout!' : 'Sim') : 'Não'}
              </span>
              {loadingTimeout && (
                <span className="text-red-600 text-xs ml-2">
                  (Possível loop detectado)
                </span>
              )}
            </div>

            {/* ✅ CACHE ROLE */}
            <div>
              <strong>Cache Role:</strong> {cacheRole}
            </div>

            {/* ✅ BOTÕES DE AÇÃO */}
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={handleRefreshRole}
                disabled={loading && !loadingTimeout}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                🔄 Atualizar Role
              </button>

              <button
                onClick={handleClearCache}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                🗑️ Limpar Cache
              </button>
            </div>

            {/* ✅ DICAS DE USO */}
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-3">
              <div className="text-xs text-yellow-800">
                <strong>💡 Dica:</strong> Se o role não estiver correto:
              </div>
              <div className="text-xs text-yellow-700 mt-1">
                1. Clique em &quot;Atualizar Role&quot;<br />
                2. Se não funcionar, clique em &quot;Limpar Cache&quot;<br />
                3. Faça logout e login novamente
              </div>
            </div>

            {/* ✅ ALERTA DE TIMEOUT */}
            {loadingTimeout && (
              <div className="bg-red-50 border border-red-200 rounded p-2 mt-3">
                <div className="text-xs text-red-800">
                  <strong>⚠️ Timeout:</strong> Loading muito longo detectado.
                </div>
                <div className="text-xs text-red-700 mt-1">
                  Possível loop infinito. Tente limpar o cache.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

