/**
 * Utilitários de autenticação para o sistema FichaChef
 */

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

export interface AuthContext {
  user: User | null
  error: string | null
  isAuthenticated: boolean
}

/**
 * Cria cliente Supabase para uso no middleware
 */
export function createSupabaseClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )
}

/**
 * Verifica autenticação do usuário
 */
export async function verifyAuth(request: NextRequest): Promise<AuthContext> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createSupabaseClient(request, response)

  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return {
        user: null,
        error: error.message,
        isAuthenticated: false
      }
    }

    return {
      user,
      error: null,
      isAuthenticated: !!user
    }
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Erro de autenticação',
      isAuthenticated: false
    }
  }
}

/**
 * Cria resposta de erro de autenticação
 */
export function createAuthErrorResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { 
      error: message,
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString()
    },
    { status: 401 }
  )
}

/**
 * Cria resposta de redirecionamento para login
 */
export function createLoginRedirect(request: NextRequest) {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

/**
 * Verifica se a rota requer autenticação
 */
export function requiresAuth(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/api/insumos',
    '/api/producao',
    '/api/produtos',
    '/api/fichas-tecnicas',
    '/api/categorias-insumos',
    '/api/categorias-receitas',
    '/api/dashboard-stats',
    '/api/auditoria',
    '/api/alertas',
    '/api/analise-temporal',
    '/api/batch-operations',
    '/api/configuracoes-alerta'
  ]

  return protectedRoutes.some(route => pathname.startsWith(route))
}

/**
 * Verifica se a rota é pública
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/api/auth',
    '/api/health',
    '/_next',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js'
  ]

  return publicRoutes.some(route => pathname.startsWith(route))
}

/**
 * Adiciona headers de usuário à resposta
 */
export function addUserHeaders(response: NextResponse, user: User): NextResponse {
  response.headers.set('x-user-id', user.id)
  response.headers.set('x-user-email', user.email || '')
  response.headers.set('x-user-role', user.user_metadata?.role || 'user')
  return response
}

/**
 * Rate limiting simples baseado em IP
 */
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

export function checkRateLimit(
  ip: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(ip)

  if (!userLimit) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return true
  }

  if (now - userLimit.lastReset > windowMs) {
    userLimit.count = 1
    userLimit.lastReset = now
    return true
  }

  if (userLimit.count >= maxRequests) {
    return false
  }

  userLimit.count++
  return true
}

/**
 * Limpa dados antigos do rate limiting
 */
export function cleanupRateLimit() {
  const now = Date.now()
  const windowMs = 60000 // 1 minuto

  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.lastReset > windowMs) {
      rateLimitMap.delete(ip)
    }
  }
}

// Limpar rate limit a cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimit, 5 * 60 * 1000)
}

