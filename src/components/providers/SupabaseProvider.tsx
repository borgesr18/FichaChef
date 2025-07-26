'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

// ✅ CORRIGIDO: Provider com debug e cache clearing
interface SupabaseContextType {
  user: User | null
  userRole: string | null
  loading: boolean
  signOut: () => Promise<void>
  isConfigured: boolean
  refreshUserRole: () => Promise<void>
  clearCache: () => void
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  userRole: null,
  loading: true,
  signOut: async () => {},
  isConfigured: false,
  refreshUserRole: async () => {},
  clearCache: () => {}
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)

  // ✅ NOVO: Função para limpar cache
  const clearCache = useCallback(() => {
    console.log('🧹 Limpando cache de role...')
    setUserRole(null)
    localStorage.removeItem('fichachef-user-role')
    localStorage.removeItem('fichachef-user-profile')
  }, [])

  // ✅ CORRIGIDO: Função com debug e cache clearing - database como fonte da verdade
  const refreshUserRole = useCallback(async (forceRefresh = false) => {
    if (!user) {
      console.log('❌ refreshUserRole: Sem usuário')
      setUserRole(null)
      return
    }

    console.log('🔄 refreshUserRole: Buscando role para usuário:', user.email)

    // ✅ Se forçar refresh, limpar cache primeiro
    if (forceRefresh) {
      clearCache()
    }

    try {
      // ✅ CORRIGIDO: Usar API endpoint em vez de query direta (evita problemas de RLS)
      console.log('📡 Fazendo request para API /api/perfil-usuario...')
      const response = await fetch('/api/perfil-usuario', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📊 Response status:', response.status)

      if (!response.ok) {
        console.error('❌ Erro ao buscar role do usuário via API:', response.status)
        console.warn('⚠️ API falhou, usando fallback cozinheiro')
        setUserRole('cozinheiro')
        localStorage.setItem('fichachef-user-role', 'cozinheiro')
        return
      }

      const data = await response.json()
      console.log('📊 Resultado da API:', data)

      if (!data || !data.role) {
        console.warn('⚠️ Dados inválidos da API, usando fallback cozinheiro')
        setUserRole('cozinheiro')
        localStorage.setItem('fichachef-user-role', 'cozinheiro')
        return
      }

      console.log('✅ Role encontrado com sucesso:', data.role)
      console.log('👤 Dados do perfil:', data)
      
      const role = data.role || 'cozinheiro'
      setUserRole(role)
      
      // ✅ Salvar no cache
      localStorage.setItem('fichachef-user-role', role)
      localStorage.setItem('fichachef-user-profile', JSON.stringify(data))

      // ✅ Debug final
      if (role === 'chef') {
        console.log('👨‍🍳 USUÁRIO É CHEF - Deve ter acesso completo!')
      } else if (role === 'gerente') {
        console.log('👔 USUÁRIO É GERENTE - Acesso limitado')
      } else {
        console.log('🍳 USUÁRIO É COZINHEIRO - Acesso básico')
      }

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar role:', error)
      setUserRole('cozinheiro')
      localStorage.setItem('fichachef-user-role', 'cozinheiro')
    }
  }, [user, clearCache])

  useEffect(() => {
    // Verificar se o Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const configured = !!(supabaseUrl && supabaseKey && 
      supabaseUrl !== 'https://placeholder.supabase.co' && 
      supabaseKey !== 'placeholder-key' &&
      !supabaseUrl.includes('placeholder') &&
      !supabaseKey.includes('placeholder'))
    
    setIsConfigured(configured)
    console.log('⚙️ Supabase configurado:', configured)

    // ✅ Só tentar autenticação se estiver configurado
    if (configured) {
      // Obter sessão atual
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('🔐 Sessão atual:', session?.user?.email || 'Nenhuma')
        setUser(session?.user ?? null)
        setLoading(false)
      })

      // ✅ Escutar mudanças de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('🔄 Auth state change:', event, session?.user?.email || 'Nenhuma')
          setUser(session?.user ?? null)
          setLoading(false)
          
          // ✅ Limpar role quando usuário sair
          if (event === 'SIGNED_OUT') {
            console.log('👋 Usuário saiu - limpando role')
            setUserRole(null)
            clearCache()
          }
          
          // ✅ Forçar refresh do role no login
          if (event === 'SIGNED_IN') {
            console.log('🚪 Usuário entrou - forçando refresh do role')
            setTimeout(() => {
              if (session?.user) {
                refreshUserRole(true) // Forçar refresh
              }
            }, 1000)
          }
        }
      )

      return () => subscription.unsubscribe()
    } else {
      console.warn('⚠️ Supabase não configurado - algumas funcionalidades podem não funcionar')
      setLoading(false)
    }
  }, [isConfigured, refreshUserRole, clearCache])

  // ✅ Buscar role quando usuário mudar
  useEffect(() => {
    if (user && isConfigured) {
      console.log('👤 Usuário mudou, buscando role...')
      refreshUserRole()
    } else if (!user) {
      console.log('❌ Sem usuário, limpando role')
      setUserRole(null)
    }
  }, [user, isConfigured, refreshUserRole])

  const signOut = async () => {
    if (isConfigured) {
      console.log('👋 Fazendo logout...')
      await supabase.auth.signOut()
      setUserRole(null)
      clearCache()
    }
  }

  return (
    <SupabaseContext.Provider value={{ 
      user, 
      userRole, 
      loading, 
      signOut, 
      isConfigured, 
      refreshUserRole: () => refreshUserRole(true), // Sempre forçar refresh
      clearCache
    }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase deve ser usado dentro de um SupabaseProvider')
  }
  return context
}

