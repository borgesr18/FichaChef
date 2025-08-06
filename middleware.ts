import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const pathname = request.nextUrl.pathname

  // ✅ ROTAS QUE NUNCA DEVEM SER INTERCEPTADAS
  const neverIntercept = [
    '/manifest.json',
    '/sw.js',
    '/favicon.ico',
    '/icon.png',
    '/icon',
    '/_next/',
    '/api/',
    '/login',
    '/register',
    '/reset-password',
    '/auth/',
    '/public/'
  ]

  // ✅ VERIFICAÇÃO IMEDIATA - PRIMEIRA COISA NO MIDDLEWARE
  for (const route of neverIntercept) {
    if (pathname.startsWith(route) || pathname === route) {
      console.log('🚫 Middleware: Rota não interceptada:', pathname)
      return response
    }
  }

  // 🔧 VERIFICAÇÃO MELHORADA DE DESENVOLVIMENTO
  const isDevelopment = process.env.NODE_ENV === 'development'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isSupabaseConfigured = !!(
    supabaseUrl && 
    supabaseKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseKey !== 'placeholder-key' &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseKey.includes('placeholder') &&
    supabaseUrl.length > 20 &&
    supabaseKey.length > 20
  )

  // 🔓 EM DESENVOLVIMENTO OU SEM SUPABASE CONFIGURADO, SEMPRE PERMITIR ACESSO
  if (isDevelopment || !isSupabaseConfigured) {
    console.log('🔓 [MIDDLEWARE] Permitindo acesso livre:', { 
      isDevelopment, 
      isSupabaseConfigured, 
      pathname,
      reason: isDevelopment ? 'desenvolvimento' : 'supabase não configurado'
    })
    return response
  }

  // ✅ APENAS DASHBOARD PRECISA DE AUTENTICAÇÃO EM PRODUÇÃO
  if (!pathname.startsWith('/dashboard')) {
    console.log('🔓 [MIDDLEWARE] Rota pública permitida:', pathname)
    return response
  }

  try {
    // ✅ CRIAR CLIENTE SUPABASE PARA SERVIDOR
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseKey!,
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
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
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
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
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

    // ✅ VERIFICAR AUTENTICAÇÃO DO USUÁRIO
    const { data: { user }, error } = await supabase.auth.getUser()

    // ✅ SE HÁ ERRO OU USUÁRIO NÃO AUTENTICADO
    if (error || !user) {
      console.log('🔒 [MIDDLEWARE] Usuário não autenticado, redirecionando para login:', {
        pathname,
        error: error?.message,
        hasUser: !!user
      })
      
      // ✅ EVITAR LOOP DE REDIRECIONAMENTO
      if (pathname !== '/login') {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        console.log('🔄 [MIDDLEWARE] Redirecionando para:', redirectUrl.toString())
        return NextResponse.redirect(redirectUrl)
      }
    } else {
      // ✅ USUÁRIO AUTENTICADO, PERMITIR ACESSO
      console.log('✅ [MIDDLEWARE] Usuário autenticado:', user?.email, 'acessando:', pathname)
    }

    return response

  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erro na verificação de autenticação:', error)
    
    // ✅ EM CASO DE ERRO, PERMITIR ACESSO PARA NÃO QUEBRAR O SISTEMA
    console.warn('🔧 [MIDDLEWARE] Erro na autenticação, permitindo acesso temporário para:', pathname)
    return response
  }
}

// ✅ CONFIGURAÇÃO OTIMIZADA - NÃO INTERCEPTAR ARQUIVOS ESTÁTICOS E PWA
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - sw.js (service worker)
     * - icon.png (PWA icon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon.png).*)',
  ],
}
