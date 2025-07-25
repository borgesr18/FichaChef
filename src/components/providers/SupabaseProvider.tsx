'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

// ✅ SIMPLIFICADO: Provider básico sem conflitos com useAuth
interface SupabaseContextType {
  user: User | null
  userRole: string | null
  loading: boolean
  signOut: () => Promise<void>
  isConfigured: boolean
  refreshUserRole: () => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  userRole: null,
  loading: true,
  signOut: async () => {},
  isConfigured: false,
  refreshUserRole: async () => {}
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)

  // ✅ CORRIGIDO: Função simplificada para buscar role
  const refreshUserRole = useCallback(async () => {
    if (!user) {
      setUserRole(null)
      return
    }

    try {
      // ✅ Buscar diretamente na tabela perfis_usuarios
      const { data, error } = await supabase
        .from('perfis_usuarios')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.warn('Erro ao buscar role do usuário:', error.message)
        // ✅ FALLBACK: Se não encontrar, assumir cozinheiro
        setUserRole('cozinheiro')
        return
      }

      setUserRole(data.role || 'cozinheiro')
    } catch (error) {
      console.error('Erro ao buscar role:', error)
      // ✅ FALLBACK: Em caso de erro, assumir cozinheiro
      setUserRole('cozinheiro')
    }
  }, [user])

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

    // ✅ Só tentar autenticação se estiver configurado
    if (configured) {
      // Obter sessão atual
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      // ✅ SIMPLIFICADO: Escutar mudanças de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)
          
          // ✅ Limpar role quando usuário sair
          if (event === 'SIGNED_OUT') {
            setUserRole(null)
          }
        }
      )

      return () => subscription.unsubscribe()
    } else {
      console.warn('⚠️ Supabase não configurado - algumas funcionalidades podem não funcionar')
      setLoading(false)
    }
  }, [isConfigured])

  // ✅ Buscar role quando usuário mudar
  useEffect(() => {
    if (user && isConfigured) {
      refreshUserRole()
    } else if (!user) {
      setUserRole(null)
    }
  }, [user, isConfigured, refreshUserRole])

  const signOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut()
      setUserRole(null)
    }
  }

  return (
    <SupabaseContext.Provider value={{ 
      user, 
      userRole, 
      loading, 
      signOut, 
      isConfigured, 
      refreshUserRole 
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

