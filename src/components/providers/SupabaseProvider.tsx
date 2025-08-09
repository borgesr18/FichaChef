"use client"

// 🎯 SUPABASE PROVIDER FINAL - SEM LOOPS - VERCEL COMPATIBLE
// Versão final corrigida com todos os erros de TypeScript resolvidos

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

async function syncSessionCookie() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await fetch('/api/auth/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        token_type: session.token_type,
        user: session.user,
      }),
      credentials: 'include',
    })
  } catch (e) {
    console.warn('Falha ao sincronizar sessão', e)
  }
}

type UserRole = 'chef' | 'gerente' | 'cozinheiro' | null

interface SupabaseContextType {
  user: User | null
  userRole: UserRole
  loading: boolean
  refreshUserRole: () => Promise<void>
  clearCache: () => void
  signOut: () => Promise<void>
  isConfigured: boolean
  isInitialized: boolean
}

interface AuthStateChangeEvent {
  data: {
    subscription: {
      unsubscribe: () => void
    }
  }
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // ✅ CONFIGURAÇÃO MEMOIZADA
  const isConfigured = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    return !!(
      url && 
      key && 
      url !== 'https://placeholder.supabase.co' && 
      key !== 'placeholder-key' &&
      url.length > 20 &&
      key.length > 20
    )
  }, [])

  // ✅ FUNÇÃO: SIGN OUT SIMPLIFICADA
  const handleSignOut = useCallback(async () => {
    try {
      console.log('🚪 [PROVIDER] Fazendo logout...')
      
      // Limpar estado local primeiro
      setUser(null)
      setUserRole(null)
      setLoading(false)
      
      // Limpar localStorage
      localStorage.removeItem('fichachef-user-role')
      localStorage.removeItem('fichachef-user-email')
      
      // Fazer logout no Supabase se configurado
      if (isConfigured) {
        await supabase.auth.signOut()
        try { await fetch('/api/auth/sync', { method: 'DELETE', credentials: 'include' }) } catch {}
      }
      
      console.log('✅ [PROVIDER] Logout realizado com sucesso')
      
    } catch (error) {
      console.error('❌ [PROVIDER] Erro no logout:', error)
    }
  }, [isConfigured])

  // ✅ FUNÇÃO: LIMPEZA SIMPLES
  const handleClearCache = useCallback(() => {
    console.log('🧹 [PROVIDER] Limpando cache...')
    
    // Limpar localStorage
    localStorage.removeItem('fichachef-user-role')
    localStorage.removeItem('fichachef-user-email')
    
    // Reset estado
    setUserRole(null)
    setLoading(true)
    
    console.log('✅ [PROVIDER] Cache limpo')
  }, [])

  // ✅ FUNÇÃO: REFRESH USER ROLE SIMPLIFICADA
  const refreshUserRole = useCallback(async () => {
    if (!user || !isInitialized) {
      console.log('🚫 [PROVIDER] refreshUserRole: Condições não atendidas')
      return
    }

    console.log('🔄 [PROVIDER] Atualizando role do usuário:', user.email)
    setLoading(true)

    try {
      // 🔧 MODO DESENVOLVIMENTO: Role padrão
      if (process.env.NODE_ENV === 'development' || !isConfigured) {
        console.log('🔧 [PROVIDER] Modo desenvolvimento - definindo role padrão')
        setUserRole('chef')
        setLoading(false)
        return
      }

      // 🎯 HARDCODE PARA ADMIN CONHECIDO
      if (user.email === 'rba1807@gmail.com') {
        console.log('👨‍🍳 [PROVIDER] Admin detectado - definindo como chef')
        setUserRole('chef')
        localStorage.setItem('fichachef-user-role', 'chef')
        setLoading(false)
        return
      }

      // 🔍 TENTAR CONSULTA SIMPLES (SEM CIRCUIT BREAKER)
      const { data, error } = await supabase
        .from('perfis_usuarios')
        .select('role, nome, email')
        .eq('user_id', user.id)
        .single()

      if (!error && data?.role) {
        console.log('✅ [PROVIDER] Role encontrado via consulta:', data.role)
        const role = data.role as UserRole
        setUserRole(role)
        
        // ✅ CORREÇÃO: Verificar se role não é null antes de salvar no localStorage
        if (role) {
          localStorage.setItem('fichachef-user-role', role)
        }
      } else {
        // 🔧 FALLBACK SIMPLES
        console.log('⚠️ [PROVIDER] Consulta falhou, usando fallback')
        const fallbackRole: UserRole = 'cozinheiro'
        setUserRole(fallbackRole)
        localStorage.setItem('fichachef-user-role', fallbackRole)
      }

    } catch (error) {
      console.error('❌ [PROVIDER] Erro na consulta:', error)
      
      // 🔧 FALLBACK EM CASO DE ERRO
      const fallbackRole: UserRole = 'cozinheiro'
      setUserRole(fallbackRole)
      localStorage.setItem('fichachef-user-role', fallbackRole)
    } finally {
      setLoading(false)
    }
  }, [user, isInitialized, isConfigured])

  // ✅ EFEITO: INICIALIZAÇÃO SIMPLIFICADA
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🔄 [PROVIDER] Inicializando autenticação...')
        
        // ✅ Marcar inicialização iniciada imediatamente para destravar telas que aguardam esse flag
        if (mounted) {
          setIsInitialized(true)
        }
        
        if (!isConfigured) {
          console.log('🔧 [PROVIDER] Supabase não configurado - modo desenvolvimento')
          setIsInitialized(true)
          setLoading(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          if (session?.user) {
            console.log('✅ [PROVIDER] Sessão encontrada:', session.user.email)
            setUser(session.user)
            // Sincronizar cookie para APIs reconhecerem a sessão
            await syncSessionCookie()
          } else {
            console.log('🚫 [PROVIDER] Nenhuma sessão encontrada')
          }
          
          setIsInitialized(true)
          setLoading(false)
        }
        
      } catch (error) {
        console.error('❌ [PROVIDER] Erro na inicialização:', error)
        if (mounted) {
          setIsInitialized(true)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // ✅ LISTENER DE MUDANÇAS DE AUTH SIMPLIFICADO
    let subscription: AuthStateChangeEvent | null = null
    
    if (isConfigured) {
      subscription = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔐 [PROVIDER] Auth state changed:', event, 'User:', session?.user?.email || 'null')
          
          if (mounted) {
            if (session?.user) {
              console.log('✅ [PROVIDER] Definindo usuário:', session.user.email)
              setUser(session.user)
              // Sincronizar cookie para APIs reconhecerem a sessão
              await syncSessionCookie()
            } else {
              console.log('🚫 [PROVIDER] Limpando usuário')
              setUser(null)
              setUserRole(null)
              try { await fetch('/api/auth/sync', { method: 'DELETE', credentials: 'include' }) } catch {}
            }
            // ✅ Garantir que a inicialização seja marcada como concluída mesmo que o evento dispare antes do initializeAuth
            setIsInitialized(true)
            setLoading(false)
          }
        }
      ) as AuthStateChangeEvent

    }

    return () => {
      mounted = false
      if (subscription) {
        subscription.data.subscription.unsubscribe()
      }
    }
  }, [isConfigured])

  // ✅ EFEITO: CARREGAR ROLE QUANDO USUÁRIO MUDA
  useEffect(() => {
    if (!user || !isInitialized) return

    // 🎯 VERIFICAÇÃO IMEDIATA PARA ADMIN
    if (user.email === 'rba1807@gmail.com') {
      console.log('⚡ [PROVIDER] Admin detectado - definindo chef imediatamente')
      setUserRole('chef')
      localStorage.setItem('fichachef-user-role', 'chef')
      setLoading(false)
      return
    }

    // 🔧 MODO DESENVOLVIMENTO
    if (process.env.NODE_ENV === 'development' || !isConfigured) {
      console.log('🔧 [PROVIDER] Modo desenvolvimento - definindo chef')
      setUserRole('chef')
      setLoading(false)
      return
    }

    // 🔄 CARREGAR ROLE APÓS DELAY MÍNIMO
    const timer = setTimeout(() => {
      refreshUserRole()
    }, 100)

    return () => clearTimeout(timer)
  }, [user, isInitialized, refreshUserRole, isConfigured])

  // ✅ VALOR DO CONTEXTO MEMOIZADO
  const value = useMemo(() => ({
    user,
    userRole,
    loading,
    refreshUserRole,
    clearCache: handleClearCache,
    signOut: handleSignOut,
    isConfigured,
    isInitialized
  }), [user, userRole, loading, refreshUserRole, handleClearCache, handleSignOut, isConfigured, isInitialized])

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

// 🎯 CORREÇÃO FINAL APLICADA:
// ✅ Verificação se role não é null antes de localStorage.setItem
// ✅ Tipagem explícita para fallbackRole como UserRole
// ✅ Mantida toda funcionalidade de correção de loops
// ✅ Compatível com TypeScript strict do Vercel
// ✅ Todos os erros de build resolvidos

