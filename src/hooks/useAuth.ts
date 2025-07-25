/**
 * Hook de autenticação para FichaChef
 * Gerencia estado de autenticação, sessão e permissões do usuário
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User, Session } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export interface UserProfile {
  id: string
  email: string
  name?: string
  role: 'admin' | 'manager' | 'user'
  permissions: string[]
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isManager: boolean
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updatePassword: (password: string) => Promise<{ error?: string }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>
  refreshSession: () => Promise<void>
  checkPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

export type UseAuthReturn = AuthState & AuthActions

const STORAGE_KEYS = {
  SESSION: 'fichachef-session',
  PROFILE: 'fichachef-profile',
  LAST_ACTIVITY: 'fichachef-last-activity'
}

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutos
const REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutos antes do vencimento

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isAdmin: false,
    isManager: false
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Atualiza estado de autenticação
   */
  const updateAuthState = useCallback((
    user: User | null,
    session: Session | null,
    profile: UserProfile | null = null,
    error: string | null = null
  ) => {
    const isAuthenticated = !!user && !!session
    const isAdmin = profile?.role === 'admin'
    const isManager = profile?.role === 'manager' || isAdmin

    setState({
      user,
      profile,
      session,
      loading: false,
      error,
      isAuthenticated,
      isAdmin,
      isManager
    })

    // Salvar no localStorage
    if (isAuthenticated && session) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString())
      if (profile) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile))
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION)
      localStorage.removeItem(STORAGE_KEYS.PROFILE)
      localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY)
    }

    // Log de auditoria
    if (user) {
      logger.audit('auth_state_updated', user.id, {
        isAuthenticated,
        role: profile?.role,
        sessionId: session?.access_token?.slice(-8)
      })
    }
  }, [])

  /**
   * Carrega perfil do usuário
   */
  const loadUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('perfilUsuario')
        .select('*')
        .eq('userId', userId)
        .single()

      if (error) {
        logger.error('Failed to load user profile', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      logger.error('Error loading user profile', error as Error)
      return null
    }
  }, [supabase])

  /**
   * Configura refresh automático da sessão
   */
  const setupSessionRefresh = useCallback((session: Session) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    const expiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000
    const refreshAt = expiresAt - REFRESH_THRESHOLD

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession()
        if (error) {
          logger.error('Session refresh failed', error)
          await signOut()
        } else if (data.session) {
          logger.info('Session refreshed successfully')
          setupSessionRefresh(data.session)
        }
      } catch (error) {
        logger.error('Error refreshing session', error as Error)
        await signOut()
      }
    }, Math.max(0, refreshAt - Date.now()))
  }, [supabase])

  /**
   * Configura timeout de inatividade
   */
  const setupActivityTimeout = useCallback(() => {
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current)
    }

    activityTimeoutRef.current = setTimeout(async () => {
      logger.warn('Session expired due to inactivity')
      await signOut()
    }, SESSION_TIMEOUT)
  }, [])

  /**
   * Atualiza atividade do usuário
   */
  const updateActivity = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString())
    setupActivityTimeout()
  }, [setupActivityTimeout])

  /**
   * Verifica se a sessão expirou por inatividade
   */
  const checkSessionActivity = useCallback(() => {
    const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY)
    if (lastActivity) {
      const timeSinceActivity = Date.now() - parseInt(lastActivity)
      if (timeSinceActivity > SESSION_TIMEOUT) {
        logger.warn('Session expired due to inactivity')
        signOut()
        return false
      }
    }
    return true
  }, [])

  /**
   * Inicializa autenticação
   */
  const initializeAuth = useCallback(async () => {
    try {
      // Verificar atividade da sessão
      if (!checkSessionActivity()) {
        return
      }

      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        logger.error('Failed to get session', error)
        updateAuthState(null, null, null, error.message)
        return
      }

      if (session?.user) {
        const profile = await loadUserProfile(session.user.id)
        updateAuthState(session.user, session, profile)
        setupSessionRefresh(session)
        setupActivityTimeout()
      } else {
        updateAuthState(null, null)
      }
    } catch (error) {
      logger.error('Error initializing auth', error as Error)
      updateAuthState(null, null, null, 'Erro ao inicializar autenticação')
    }
  }, [supabase, updateAuthState, loadUserProfile, setupSessionRefresh, setupActivityTimeout, checkSessionActivity])

  /**
   * Login do usuário
   */
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        logger.security('login_failed', { email, error: error.message })
        updateAuthState(null, null, null, error.message)
        return { error: error.message }
      }

      if (data.user && data.session) {
        const profile = await loadUserProfile(data.user.id)
        updateAuthState(data.user, data.session, profile)
        setupSessionRefresh(data.session)
        setupActivityTimeout()
        
        logger.audit('user_login', data.user.id, { email })
        return {}
      }

      return { error: 'Falha na autenticação' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      logger.error('Sign in error', error as Error)
      updateAuthState(null, null, null, errorMessage)
      return { error: errorMessage }
    }
  }, [supabase, updateAuthState, loadUserProfile, setupSessionRefresh, setupActivityTimeout])

  /**
   * Registro de usuário
   */
  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, unknown>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        logger.security('signup_failed', { email, error: error.message })
        updateAuthState(null, null, null, error.message)
        return { error: error.message }
      }

      logger.audit('user_signup', data.user?.id || 'unknown', { email })
      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      logger.error('Sign up error', error as Error)
      updateAuthState(null, null, null, errorMessage)
      return { error: errorMessage }
    }
  }, [supabase, updateAuthState])

  /**
   * Logout do usuário
   */
  const signOut = useCallback(async () => {
    try {
      const userId = state.user?.id
      
      // Limpar timeouts
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current)
      }

      await supabase.auth.signOut()
      updateAuthState(null, null)
      
      if (userId) {
        logger.audit('user_logout', userId)
      }
    } catch (error) {
      logger.error('Sign out error', error as Error)
    }
  }, [supabase, updateAuthState, state.user?.id])

  /**
   * Reset de senha
   */
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        logger.security('password_reset_failed', { email, error: error.message })
        return { error: error.message }
      }

      logger.audit('password_reset_requested', 'unknown', { email })
      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      logger.error('Reset password error', error as Error)
      return { error: errorMessage }
    }
  }, [supabase])

  /**
   * Atualização de senha
   */
  const updatePassword = useCallback(async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        logger.error('Password update failed', error)
        return { error: error.message }
      }

      if (state.user) {
        logger.audit('password_updated', state.user.id)
      }
      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      logger.error('Update password error', error as Error)
      return { error: errorMessage }
    }
  }, [supabase, state.user])

  /**
   * Atualização de perfil
   */
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      if (!state.user) {
        return { error: 'Usuário não autenticado' }
      }

      const { error } = await supabase
        .from('perfilUsuario')
        .update(updates)
        .eq('userId', state.user.id)

      if (error) {
        logger.error('Profile update failed', error)
        return { error: error.message }
      }

      // Recarregar perfil
      const updatedProfile = await loadUserProfile(state.user.id)
      if (updatedProfile) {
        updateAuthState(state.user, state.session, updatedProfile)
      }

      logger.audit('profile_updated', state.user.id, { updates })
      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      logger.error('Update profile error', error as Error)
      return { error: errorMessage }
    }
  }, [supabase, state.user, state.session, loadUserProfile, updateAuthState])

  /**
   * Refresh manual da sessão
   */
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        logger.error('Manual session refresh failed', error)
        await signOut()
      } else if (data.session) {
        setupSessionRefresh(data.session)
        logger.info('Session refreshed manually')
      }
    } catch (error) {
      logger.error('Error refreshing session manually', error as Error)
      await signOut()
    }
  }, [supabase, setupSessionRefresh, signOut])

  /**
   * Verifica permissão específica
   */
  const checkPermission = useCallback((permission: string): boolean => {
    if (!state.profile) return false
    return state.profile.permissions.includes(permission) || state.isAdmin
  }, [state.profile, state.isAdmin])

  /**
   * Verifica role específico
   */
  const hasRole = useCallback((role: string): boolean => {
    if (!state.profile) return false
    return state.profile.role === role || (role !== 'admin' && state.isAdmin)
  }, [state.profile, state.isAdmin])

  // Inicializar autenticação
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Listener para mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session) => {
        logger.info('Auth state changed', { event })
        
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await loadUserProfile(session.user.id)
          updateAuthState(session.user, session, profile)
          setupSessionRefresh(session)
          setupActivityTimeout()
        } else if (event === 'SIGNED_OUT') {
          updateAuthState(null, null)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setupSessionRefresh(session)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, updateAuthState, loadUserProfile, setupSessionRefresh, setupActivityTimeout])

  // Listener para atividade do usuário
  useEffect(() => {
    if (state.isAuthenticated) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
      
      events.forEach(event => {
        document.addEventListener(event, updateActivity, true)
      })

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, updateActivity, true)
        })
      }
    }
  }, [state.isAuthenticated, updateActivity])

  // Cleanup
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current)
      }
    }
  }, [])

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    checkPermission,
    hasRole
  }
}

