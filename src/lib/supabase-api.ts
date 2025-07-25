import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

/**
 * Cria um cliente Supabase específico para uso em rotas da API
 * Extrai cookies e headers diretamente do NextRequest
 */
export function createSupabaseApiClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set() {
        },
        remove() {
        },
      },
    }
  )
}

/**
 * Autentica usuário a partir de uma requisição da API
 * Retorna dados do usuário se autenticado, null caso contrário
 */
export async function authenticateUserFromApi(req: NextRequest) {
  try {
    const supabase = createSupabaseApiClient(req)
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      logger.security('api_auth_failed', { error: error.message })
      return null
    }
    
    if (!user) {
      logger.security('api_auth_no_user')
      return null
    }
    
    logger.info('api_auth_success', { userId: user.id, email: user.email })
    
    return {
      id: user.id,
      email: user.email || '',
      user_metadata: user.user_metadata || {},
      app_metadata: user.app_metadata || {}
    }
  } catch (error) {
    logger.error('api_auth_error', error as Error)
    return null
  }
}

/**
 * Middleware para proteger rotas da API
 * Retorna resposta 401 se usuário não estiver autenticado
 */
export async function requireApiAuthentication(req: NextRequest) {
  const user = await authenticateUserFromApi(req)
  
  if (!user) {
    return {
      authenticated: false,
      user: null,
      response: NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
  }
  
  return {
    authenticated: true,
    user,
    response: null
  }
}
