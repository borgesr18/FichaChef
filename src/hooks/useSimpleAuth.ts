/**
 * Hook de autenticação simplificado para FichaChef
 * Versão mais simples e confiável do useAuth
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  SimpleAuthState,
  SimpleUserProfile,
  simpleSignIn,
  simpleSignOut,
  getCurrentSession,
  loadUserProfile,
  getAuthFallback,
  createSimpleSupabaseClient
} from '@/lib/auth-simple'

export function useSimpleAuth() {
  const [state, setState] = useState<SimpleAuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    isAuthenticated: false
  })
  
  const router = useRouter()
  const supabase = createSimpleSupabaseClient()

  // Função para atualizar estado
  const updateState = useCallback((newState: Partial<SimpleAuthState>) => {
    setState(prev => ({ ...prev, ...newState }))
  }, [])

  // Função de login
  const signIn = useCallback(async (email: string, password: string) => {
    updateState({ loading: true })
    
    const result = await simpleSignIn(email, password)
    
    if (result.success && result.user) {
      const profile = await loadUserProfile(result.user.id)
      
      updateState({
        user: result.user,
        profile,
        session: result.session,
        loading: false,
        isAuthenticated: true
      })
      
      return { success: true }
    } else {
      updateState({ loading: false })
      return { success: false, error: result.error }
    }
  }, [updateState])

  // Função de logout
  const signOut = useCallback(async () => {
    updateState({ loading: true })
    
    await simpleSignOut()
    
    updateState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      isAuthenticated: false
    })
    
    router.push('/login')
  }, [updateState, router])

  // Inicialização
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { session } = await getCurrentSession()
        
        if (session?.user) {
          const profile = await loadUserProfile(session.user.id)
          
          updateState({
            user: session.user,
            profile,
            session,
            loading: false,
            isAuthenticated: true
          })
        } else {
          // Em produção, usar fallback se necessário
          if (process.env.NODE_ENV === 'production') {
            const fallback = getAuthFallback()
            updateState(fallback)
          } else {
            updateState({
              user: null,
              profile: null,
              session: null,
              loading: false,
              isAuthenticated: false
            })
          }
        }
      } catch (error) {
        console.error('Erro na inicialização:', error)
        
        // Em caso de erro, usar fallback em produção
        if (process.env.NODE_ENV === 'production') {
          const fallback = getAuthFallback()
          updateState(fallback)
        } else {
          updateState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAuthenticated: false
          })
        }
      }
    }

    initAuth()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await loadUserProfile(session.user.id)
          
          updateState({
            user: session.user,
            profile,
            session,
            loading: false,
            isAuthenticated: true
          })
        } else if (event === 'SIGNED_OUT') {
          updateState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAuthenticated: false
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [updateState, supabase.auth])

  return {
    ...state,
    signIn,
    signOut
  }
}

