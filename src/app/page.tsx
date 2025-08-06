'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'

export default function Home() {
  const router = useRouter()
  const { user, loading, isConfigured, isInitialized } = useSupabase()
  const [redirectExecuted, setRedirectExecuted] = useState(false)

  useEffect(() => {
    // 🚫 EVITAR MÚLTIPLOS REDIRECTS
    if (redirectExecuted) {
      console.log('🚫 [ROOT] Redirect já executado, ignorando')
      return
    }

    console.log('🔍 [ROOT] Verificando estado:', { 
      loading, 
      isInitialized,
      hasUser: !!user, 
      userEmail: user?.email, 
      isConfigured,
      redirectExecuted
    })
    
    // 🚫 AGUARDAR INICIALIZAÇÃO COMPLETA
    if (!isInitialized) {
      console.log('🚫 [ROOT] Aguardando inicialização do provider...')
      return
    }

    // 🚫 AGUARDAR CARREGAMENTO COMPLETO
    if (loading) {
      console.log('🚫 [ROOT] Ainda carregando, aguardando...')
      return
    }
    
    // ✅ USUÁRIO AUTENTICADO - IR PARA DASHBOARD
    if (user) {
      console.log('✅ [ROOT] Usuário autenticado, redirecionando para dashboard:', user.email)
      setRedirectExecuted(true)
      router.replace('/dashboard') // USAR replace ao invés de push
      return
    }
    
    // 🔒 SUPABASE CONFIGURADO MAS SEM USUÁRIO - IR PARA LOGIN
    if (isConfigured && !user) {
      console.log('🔒 [ROOT] Supabase configurado mas sem usuário, redirecionando para login')
      setRedirectExecuted(true)
      router.replace('/login') // USAR replace ao invés de push
      return
    }
    
    // 🔧 MODO DESENVOLVIMENTO - IR PARA DASHBOARD
    if (!isConfigured) {
      console.log('🔧 [ROOT] Modo desenvolvimento, redirecionando para dashboard')
      setRedirectExecuted(true)
      router.replace('/dashboard') // USAR replace ao invés de push
      return
    }
  }, [router, user, loading, isConfigured, isInitialized, redirectExecuted])

  // ✅ MOSTRAR LOADING ENQUANTO DECIDE O REDIRECIONAMENTO
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1B2E4B] to-[#5AC8FA] rounded-2xl mb-4 shadow-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">FichaChef</h2>
        <p className="text-gray-500">Carregando sistema...</p>
        
        {/* ✅ DEBUG INFO */}
        <div className="mt-6 p-4 bg-white/60 rounded-xl text-xs text-gray-600 max-w-md">
          <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
          <p><strong>Initialized:</strong> {isInitialized ? 'Sim' : 'Não'}</p>
          <p><strong>User:</strong> {user ? user.email : 'Nenhum'}</p>
          <p><strong>Configured:</strong> {isConfigured ? 'Sim' : 'Não'}</p>
          <p><strong>Redirect Executed:</strong> {redirectExecuted ? 'Sim' : 'Não'}</p>
        </div>
      </div>
    </div>
  )
}

// 🎯 PRINCIPAIS CORREÇÕES APLICADAS:
// ✅ Adicionado estado redirectExecuted para evitar múltiplos redirects
// ✅ Aguardar isInitialized antes de tomar decisões
// ✅ Usar router.replace ao invés de router.push
// ✅ Logs mais detalhados para debug
// ✅ Interface de loading enquanto decide redirecionamento
// ✅ Debug info visível para troubleshooting
// ✅ Verificações mais robustas de estado
