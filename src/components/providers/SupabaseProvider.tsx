'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { withRequestDeduplication } from '@/lib/request-cache'

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

  const refreshUserRole = useCallback(async () => {
    if (!user) {
      setUserRole(null)
      return
    }

    try {
      const response = await withRequestDeduplication('user-role', async () => {
        const res = await fetch('/api/perfil-usuario')
        if (res.ok) {
          return res.json()
        }
        throw new Error('Failed to fetch user role')
      })
      setUserRole(response.role)
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }, [user])

  useEffect(() => {
    // Verificar se o Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    setIsConfigured(!!(supabaseUrl && supabaseKey && 
      supabaseUrl !== 'https://placeholder.supabase.co' && 
      supabaseKey !== 'placeholder-key'))

    // Só tentar autenticação se estiver configurado
    if (isConfigured) {
      // Obter sessão atual
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      // Escutar mudanças de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    } else {
      setLoading(false)
    }
  }, [isConfigured])

  useEffect(() => {
    if (user && !userRole) {
      refreshUserRole()
    }
  }, [user, userRole, refreshUserRole])

  const signOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut()
    }
  }

  return (
    <SupabaseContext.Provider value={{ user, userRole, loading, signOut, isConfigured, refreshUserRole }}>
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

