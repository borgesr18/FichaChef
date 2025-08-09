import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Cria um cliente Supabase específico para uso em rotas da API
 * Extrai cookies e headers diretamente do NextRequest
 */
export function createSupabaseApiClient(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Verificar se as credenciais estão configuradas
  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl === '' || supabaseKey === '' ||
      supabaseUrl.includes('placeholder') || 
      supabaseKey.includes('placeholder')) {
    throw new Error('Supabase não configurado')
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        // Fornece getAll para compatibilidade total com @supabase/ssr
        getAll() {
          return req.cookies.getAll()
        },
        setAll() {
          // Em rotas da API não definimos cookies aqui; o refresh é tratado pelo cliente
        },
      },
    }
  )
}

function getAuthCookieName(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return null
  const projectRef = url.split('//')[1]?.split('.')[0]
  return projectRef ? `sb-${projectRef}-auth-token` : null
}

async function getUserFromAuthCookie(req: NextRequest) {
  try {
    const cookieName = getAuthCookieName()
    if (!cookieName) return null

    const raw = req.cookies.get(cookieName)?.value
    if (!raw) return null

    // Cookie armazenado como JSON pelo /api/auth/sync
    const parsed = JSON.parse(raw) as {
      access_token?: string
    }

    const token = parsed?.access_token
    if (!token) return null

    const { data: { user: tokenUser }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !tokenUser) {
      logger.security('api_auth_cookie_token_invalid', { error: error?.message })
      return null
    }

    logger.info('api_auth_success_cookie_token', { userId: tokenUser.id, email: tokenUser.email })
    return {
      id: tokenUser.id,
      email: tokenUser.email || '',
      user_metadata: tokenUser.user_metadata || {},
      app_metadata: tokenUser.app_metadata || {}
    }
  } catch (err) {
    logger.error('api_auth_cookie_parse_error', err as Error)
    return null
  }
}

/**
 * Autentica usuário a partir de uma requisição da API
 * Retorna dados do usuário se autenticado, null caso contrário
 */
export async function authenticateUserFromApi(req: NextRequest) {
  try {
    // Verificar configuração do Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Log das variáveis para debug (sem expor chaves completas)
    logger.info('api_auth_config_check', { 
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlPrefix: supabaseUrl?.substring(0, 20),
      keyPrefix: supabaseKey?.substring(0, 20),
      nodeEnv: process.env.NODE_ENV
    })
    
    // Se Supabase não está configurado, usar modo desenvolvimento apenas em dev
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === '' || supabaseKey === '' ||
        supabaseUrl.includes('placeholder') || 
        supabaseKey.includes('placeholder')) {
      // Em produção, não usar modo desenvolvimento
      if (process.env.NODE_ENV === 'production') {
        logger.error('Supabase não configurado em produção', new Error('api_auth_prod_no_config'))
        return null
      }
      logger.info('api_auth_dev_mode', { message: 'Supabase não configurado - usando modo desenvolvimento' })
      return {
        id: 'dev-user-id',
        email: 'dev@fichachef.com',
        user_metadata: { role: 'chef' },
        app_metadata: {}
      }
    }

    // 1) Tentar via cookie de auth (mais confiável em produção)
    const cookieUser = await getUserFromAuthCookie(req)
    if (cookieUser) {
      return cookieUser
    }

    // Log detalhado dos cookies para debug
    const cookies = req.cookies.getAll()
    logger.info('api_auth_cookies_debug', {
      cookieCount: cookies.length,
      cookieNames: cookies.map(c => c.name),
      hasAuthCookies: cookies.some(c => c.name.includes('auth') || c.name.includes('supabase'))
    })

    const supabase = createSupabaseApiClient(req)
    
    // Tentar autenticação via cookies de sessão primeiro
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // Log detalhado do resultado da autenticação
    logger.info('api_auth_session_attempt', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      errorMessage: error?.message,
      errorCode: error?.status
    })
    
    if (user && !error) {
      logger.info('api_auth_success_session', { userId: user.id, email: user.email })
      return {
        id: user.id,
        email: user.email || '',
        user_metadata: user.user_metadata || {},
        app_metadata: user.app_metadata || {}
      }
    }
    
    // Se falhou com cookies, tentar com Authorization header
    const authHeader = req.headers.get('authorization')
    logger.info('api_auth_header_check', {
      hasAuthHeader: !!authHeader,
      headerPrefix: authHeader?.substring(0, 20)
    })
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
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
      hasAuthHeader: !!authHeader,
      cookieCount: req.cookies.getAll().length,
      userAgent: req.headers.get('user-agent')?.substring(0, 50),
      referer: req.headers.get('referer')
    })
    return null
  } catch (error) {
    logger.error('api_auth_error', error as Error)
    
    // Em desenvolvimento, retornar usuário fake em caso de erro
    if (process.env.NODE_ENV === 'development') {
      logger.warn('api_auth_fallback_dev', { message: 'Erro na autenticação, usando usuário de desenvolvimento' })
      return {
        id: 'dev-user-id',
        email: 'dev@fichachef.com',
        user_metadata: { role: 'chef' },
        app_metadata: {}
      }
    }
    
    return null
  }
}

/**
 * Middleware para proteger rotas da API
 * Retorna resposta 401 se usuário não estiver autenticado
 */
export async function requireApiAuthentication(req: NextRequest) {
  // 🔓 PERMITIR ACESSO SEM AUTENTICAÇÃO EM DESENVOLVIMENTO
  if (process.env.NODE_ENV === 'development') {
    console.log('🔓 [DEV MODE] Permitindo acesso sem autenticação para:', req.url)
    return {
      authenticated: true,
      user: {
        id: 'dev-user',
        email: 'dev@fichachef.com',
        user_metadata: { role: 'chef' },
        app_metadata: {}
      },
      response: null
    }
  }

  const user = await authenticateUserFromApi(req)
  
  if (!user) {
    // Em produção, retornar 401 sem fallback de usuário temporário para evitar inconsistências
    return {
      authenticated: false,
      user: null,
      response: NextResponse.json(
        { 
          error: 'Não autorizado. Faça login para continuar.',
          code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        },
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
