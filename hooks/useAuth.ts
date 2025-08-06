/**
 * Hook de autenticação para FichaChef - VERSÃO CORRIGIDA
 * Gerencia estado de autenticação, sessão e permissões do usuário
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User, Session } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// ✅ TIPOS CORRIGIDOS - Alinhados com o schema do banco
export interface UserProfile {
  id: string
  userId: string
  email: string
  nome?: string
  role: 'chef' | 'gerente' | 'cozinheiro' | null  // ✅ Aceita null
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isChef: boolean      // ✅ Corrigido: chef = admin
  isGerente: boolean   // ✅ Corrigido: gerente = manager
  isCozinheiro: boolean // ✅ Adicionado: cozinheiro = user
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
  const [isHydrated, setIsHydrated] = useState(false)
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isChef: false,
    isGerente: false,
    isCozinheiro: false
  })

  // Verificar se estamos no lado do cliente
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * ✅ CORRIGIDO: Atualiza estado de autenticação com roles corretos
   */
  const updateAuthState = useCallback((
    user: User | null,
    session: Session | null,
    profile: UserProfile | null = null,
    error: string | null = null
  ) => {
    const isAuthenticated = !!user && !!session
    const isChef = profile?.role === 'chef'           // ✅ chef = admin
    const isGerente = profile?.role === 'gerente'     // ✅ gerente = manager  
    const isCozinheiro = profile?.role === 'cozinheiro' // ✅ cozinheiro = user

    setState({
      user,
      profile,
      session,
      loading: false,
      error,
      isAuthenticated,
      isChef,
      isGerente,
      isCozinheiro
    })

    // Salvar no localStorage apenas no cliente
    if (typeof window !== 'undefined' && isHydrated) {
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
    }

    // Log de auditoria
    if (user) {
      logger.audit('auth_state_updated', user.id, {
        isAuthenticated,
        role: profile?.role,
        sessionId: session?.access_token?.slice(-8)
      })
    }
  }, [isHydrated])

  /**
   * ✅ CORRIGIDO: Carrega perfil do usuário com query correta
   */
  const loadUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      // ✅ CORRIGIDO: Query correta para a tabela perfis_usuarios
      const { data, error } = await supabase
        .from('perfis_usuarios')
        .select('*')
        .eq('user_id', userId)  // ✅ Corrigido: user_id em vez de userId
        .single()

      if (error) {
        logger.error('Failed to load user profile', error)
        
        // ✅ FALLBACK: Se não encontrar perfil, criar um padrão
        console.warn('Perfil não encontrado, usando fallback temporário')
        return {
          id: 'temp-profile',
          userId: userId,
          email: '',
          nome: 'Usuário',
          role: null, // ✅ CORRIGIDO: null em vez de cozinheiro
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      // ✅ CORRIGIDO: Mapear dados corretamente
      return {
        id: data.id,
        userId: data.user_id,
        email: data.email || '',
        nome: data.nome,
        role: data.role as 'chef' | 'gerente' | 'cozinheiro',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      logger.error('Error loading user profile', error as Error)
      
      // ✅ FALLBACK: Em caso de erro, retornar perfil temporário
      console.warn('Erro ao carregar perfil, usando fallback temporário')
      return {
        id: 'temp-profile',
        userId: userId,
        email: '',
        nome: 'Usuário',
        role: null, // ✅ CORRIGIDO: null em vez de cozinheiro
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
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
          await supabase.auth.signOut()
          updateAuthState(null, null)
        } else if (data.session) {
          logger.info('Session refreshed successfully')
          setupSessionRefresh(data.session)
        }
      } catch (error) {
        logger.error('Error refreshing session', error as Error)
        await supabase.auth.signOut()
        updateAuthState(null, null)
      }
    }, Math.max(0, refreshAt - Date.now()))
  }, [supabase, updateAuthState])

  /**
   * Configura timeout de inatividade
   */
  const setupActivityTimeout = useCallback(() => {
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current)
    }

    activityTimeoutRef.current = setTimeout(async () => {
      logger.warn('Session expired due to inactivity')
      await supabase.auth.signOut()
      updateAuthState(null, null)
    }, SESSION_TIMEOUT)
  }, [supabase, updateAuthState])

  /**
   * Verifica se a sessão expirou por inatividade
   */
  const checkSessionActivity = useCallback(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY)
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity)
        if (timeSinceActivity > SESSION_TIMEOUT) {
          logger.warn('Session expired due to inactivity')
          supabase.auth.signOut()
          updateAuthState(null, null)
          return false
        }
      }
    }
    return true
  }, [supabase, updateAuthState, isHydrated])

  /**
   * ✅ CORRIGIDO: Inicializa autenticação sem problemas de hidratação
   */
  const initializeAuth = useCallback(async () => {
    try {
      // ✅ Só executar após hidratação
      if (!isHydrated) return

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
  }, [isHydrated, supabase, updateAuthState, loadUserProfile, setupSessionRefresh, setupActivityTimeout, checkSessionActivity])

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
   * Logout do usuário
   */
  const signOut = useCallback(async () => {
    try {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current)
      }

      await supabase.auth.signOut()
      updateAuthState(null, null)
      
      logger.audit('user_logout', state.user?.id || 'unknown')
    } catch (error) {
      logger.error('Sign out error', error as Error)
      // Mesmo com erro, limpar estado local
      updateAuthState(null, null)
    }
  }, [supabase, updateAuthState, state.user?.id])

  /**
   * ✅ CORRIGIDO: Verificação de permissões com roles corretos
   */
  const checkPermission = useCallback((permission: string) => {
    if (!state.profile) return false
    
    // ✅ Chef tem todas as permissões
    if (state.profile.role === 'chef') return true
    
    // ✅ Gerente tem permissões limitadas
    if (state.profile.role === 'gerente') {
      const gerentePermissions = ['read', 'write', 'reports', 'inventory']
      return gerentePermissions.includes(permission)
    }
    
    // ✅ Cozinheiro tem permissões básicas
    if (state.profile.role === 'cozinheiro') {
      const cozinheiroPermissions = ['read', 'recipes', 'production']
      return cozinheiroPermissions.includes(permission)
    }
    
    return false
  }, [state.profile])

  /**
   * ✅ CORRIGIDO: Verificação de roles
   */
  const hasRole = useCallback((role: string) => {
    if (!state.profile) return false
    return state.profile.role === role
  }, [state.profile])

  // ✅ CORRIGIDO: Inicializar apenas após hidratação
  useEffect(() => {
    if (isHydrated) {
      initializeAuth()
    }
  }, [isHydrated, initializeAuth])

  // ✅ Escutar mudanças de autenticação apenas após hidratação
  useEffect(() => {
    if (!isHydrated) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await loadUserProfile(session.user.id)
          updateAuthState(session.user, session, profile)
          setupSessionRefresh(session)
          setupActivityTimeout()
        } else if (event === 'SIGNED_OUT') {
          updateAuthState(null, null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [isHydrated, supabase, loadUserProfile, updateAuthState, setupSessionRefresh, setupActivityTimeout])

  // ✅ Cleanup ao desmontar
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

  // Implementações vazias para as funções não implementadas
  const signUp = useCallback(async () => {
    // TODO: Implementar signup
    return { error: 'Signup não implementado' }
  }, [])

  const resetPassword = useCallback(async () => {
    // TODO: Implementar reset password
    return { error: 'Reset password não implementado' }
  }, [])

  const updatePassword = useCallback(async () => {
    // TODO: Implementar update password
    return { error: 'Update password não implementado' }
  }, [])

  const updateProfile = useCallback(async () => {
    // TODO: Implementar update profile
    return { error: 'Update profile não implementado' }
  }, [])

  const refreshSession = useCallback(async () => {
    // TODO: Implementar refresh session manual
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

