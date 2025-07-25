/**
 * Sistema de autenticação simplificado para FichaChef
 * Foca na funcionalidade essencial sem complexidade desnecessária
 */

import { createBrowserClient } from '@supabase/ssr'
import type { User, Session } from '@supabase/supabase-js'

// Interface simplificada do perfil do usuário
export interface SimpleUserProfile {
  id: string
  email: string
  name?: string
  role: 'chef' | 'cozinheiro' | 'admin'
}

// Estado simplificado de autenticação
export interface SimpleAuthState {
  user: User | null
  profile: SimpleUserProfile | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
}

// Cliente Supabase simplificado
export function createSimpleSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Função simplificada de login
export async function simpleSignIn(email: string, password: string) {
  const supabase = createSimpleSupabaseClient()
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user, session: data.session }
  } catch (error) {
    return { success: false, error: 'Erro inesperado ao fazer login' }
  }
}

// Função simplificada de logout
export async function simpleSignOut() {
  const supabase = createSimpleSupabaseClient()
  
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Erro inesperado ao fazer logout' }
  }
}

// Função simplificada para obter sessão atual
export async function getCurrentSession() {
  const supabase = createSimpleSupabaseClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return { success: false, error: error.message, session: null }
    }

    return { success: true, session }
  } catch (error) {
    return { success: false, error: 'Erro ao obter sessão', session: null }
  }
}

// Função simplificada para carregar perfil do usuário
export async function loadUserProfile(userId: string): Promise<SimpleUserProfile | null> {
  const supabase = createSimpleSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('perfis_usuarios')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      // Se não encontrar perfil, criar um básico
      return {
        id: userId,
        email: '',
        role: 'chef'
      }
    }

    return {
      id: data.user_id,
      email: data.email || '',
      name: data.nome || '',
      role: data.role || 'chef'
    }
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)
    return null
  }
}

// Verificar se usuário tem permissão
export function hasPermission(profile: SimpleUserProfile | null, requiredRole: string): boolean {
  if (!profile) return false
  
  const roleHierarchy = {
    'admin': 3,
    'chef': 2,
    'cozinheiro': 1
  }
  
  const userLevel = roleHierarchy[profile.role] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
  
  return userLevel >= requiredLevel
}

// Função para modo desenvolvimento/produção
export function getAuthFallback(): SimpleAuthState {
  return {
    user: {
      id: 'temp-prod-user',
      email: 'temp@fichachef.com'
    } as User,
    profile: {
      id: 'temp-prod-user',
      email: 'temp@fichachef.com',
      name: 'Usuário Temporário',
      role: 'chef'
    },
    session: null,
    loading: false,
    isAuthenticated: true
  }
}

