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
    
    if (user && !error) {
      logger.info('api_auth_success_session', { userId: user.id, email: user.email })
      return {
        id: user.id,
        email: user.email || '',
        user_metadata: user.user_metadata || {},
        app_metadata: user.app_metadata || {}
      }
    }
    
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const supabaseAdmin = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            cookies: {
              get() { return undefined },
              set() {},
              remove() {},
            },
          }
        )
        
        const { data: { user: tokenUser }, error: tokenError } = await supabaseAdmin.auth.getUser(token)
        if (tokenUser && !tokenError) {
          logger.info('api_auth_success_token', { userId: tokenUser.id, email: tokenUser.email })
          return {
            id: tokenUser.id,
            email: tokenUser.email || '',
            user_metadata: tokenUser.user_metadata || {},
            app_metadata: tokenUser.app_metadata || {}
          }
        } else {
          logger.security('api_auth_token_invalid', { error: tokenError?.message })
        }
      } catch (tokenErr) {
        logger.error('api_auth_token_error', tokenErr as Error)
      }
    }
    
    logger.security('api_auth_failed', { 
      sessionError: error?.message,
      hasAuthHeader: !!authHeader 
    })
    return null
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
