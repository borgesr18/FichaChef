import { createClient, type Session } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Verificação de configuração
if (process.env.NODE_ENV === 'development' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('⚠️ Supabase URL ou ANON_KEY não configurados. Algumas funcionalidades podem não funcionar.')
}

// Verificar se as credenciais são válidas (não placeholders)
const isValidConfig: boolean = !!(supabaseUrl && 
                     supabaseAnonKey && 
                     !supabaseUrl.includes('placeholder') && 
                     !supabaseAnonKey.includes('placeholder'))

// Criar cliente com configuração adequada
export const supabase = createClient(
  isValidConfig ? supabaseUrl : 'https://placeholder.supabase.co',
  isValidConfig ? supabaseAnonKey : 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? {
        getItem: (key: string) => {
          return document.cookie
            .split('; ')
            .find(row => row.startsWith(key + '='))
            ?.split('=')[1] || null
        },
        setItem: (key: string, value: string) => {
          document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax`
        },
        removeItem: (key: string) => {
          document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        }
      } : undefined,
      storageKey: 'sb-access-token',
    },
    global: {
      headers: {
        'X-Client-Info': 'fichachef-web',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
  }
)

// Função para verificar se o Supabase está configurado
export function isSupabaseConfigured(): boolean {
  return isValidConfig
}

// Função para obter o usuário atual
export async function getCurrentUser() {
  if (!isValidConfig) {
    console.log('🔧 Supabase não configurado - retornando usuário de desenvolvimento')
    return {
      id: 'dev-user-id',
      email: 'dev@fichachef.com',
      user_metadata: { role: 'chef' },
      app_metadata: {}
    }
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('❌ Erro ao obter usuário:', error.message)
      return null
    }
    
    return user
  } catch (error) {
    console.error('❌ Erro crítico ao obter usuário:', error)
    return null
  }
}

// Função para fazer login
export async function signIn(email: string, password: string) {
  if (!isValidConfig) {
    console.log('🔧 Supabase não configurado - simulando login')
    return {
      data: {
        user: {
          id: 'dev-user-id',
          email: email,
          user_metadata: { role: 'chef' },
          app_metadata: {}
        },
        session: {
          access_token: 'dev-token',
          refresh_token: 'dev-refresh-token'
        }
      },
      error: null
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('❌ Erro no login:', error.message)
    } else {
      console.log('✅ Login realizado com sucesso:', data.user?.email)
    }
    
    return { data, error }
  } catch (error) {
    console.error('❌ Erro crítico no login:', error)
    return {
      data: { user: null, session: null },
      error: { message: 'Erro interno no login' }
    }
  }
}

// Função para fazer logout
export async function signOut() {
  if (!isValidConfig) {
    console.log('🔧 Supabase não configurado - simulando logout')
    return { error: null }
  }

  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('❌ Erro no logout:', error.message)
    } else {
      console.log('✅ Logout realizado com sucesso')
    }
    
    return { error }
  } catch (error) {
    console.error('❌ Erro crítico no logout:', error)
    return { error: { message: 'Erro interno no logout' } }
  }
}

// Função para registrar listener de mudanças de autenticação
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  if (!isValidConfig) {
    console.log('🔧 Supabase não configurado - não registrando listener de auth')
    return { data: { subscription: { unsubscribe: () => {} } } }
  }

  return supabase.auth.onAuthStateChange(callback)
}
