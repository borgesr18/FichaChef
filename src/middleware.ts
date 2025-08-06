import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 🔧 MIDDLEWARE TEMPORARIAMENTE DESABILITADO PARA RESOLVER LOOP
  // 
  // PROBLEMA IDENTIFICADO:
  // - Usuário faz login com sucesso
  // - É redirecionado para /dashboard
  // - Middleware intercepta e redireciona de volta para /login
  // - Cria loop infinito: login → dashboard → login → dashboard
  //
  // SOLUÇÃO TEMPORÁRIA:
  // - Desabilitar verificação de autenticação
  // - Permitir acesso livre a todas as rotas
  // - Usuário consegue acessar o dashboard
  //
  // PARA REABILITAR:
  // - Comentar a linha abaixo
  // - Descomentar o código de verificação
  
  console.log('🔧 [MIDDLEWARE] TEMPORARIAMENTE DESABILITADO - Permitindo acesso livre')
  console.log('📍 [MIDDLEWARE] Rota acessada:', request.nextUrl.pathname)
  
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  /* 
  // 🔧 CÓDIGO ORIGINAL (COMENTADO TEMPORARIAMENTE)
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const pathname = request.nextUrl.pathname
  const timestamp = new Date().toISOString()

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
    '/public/',
    '/static/',
    '/_vercel',
    '/health'
  ]

  // ✅ VERIFICAÇÃO IMEDIATA - PRIMEIRA COISA NO MIDDLEWARE
  for (const route of neverIntercept) {
    if (pathname.startsWith(route) || pathname === route) {
      console.log(`🚫 [MIDDLEWARE] Rota não interceptada: ${pathname} (${timestamp})`)
      return response
    }
  }

  // 🔧 VERIFICAÇÃO ROBUSTA DE AMBIENTE
  const isDevelopment = process.env.NODE_ENV === 'development'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // ✅ VERIFICAÇÃO MELHORADA DE CONFIGURAÇÃO DO SUPABASE
  const isSupabaseConfigured = !!(
    supabaseUrl && 
    supabaseKey && 
    supabaseUrl.length > 20 &&
    supabaseKey.length > 20 &&
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseKey !== 'placeholder-key' &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseKey.includes('placeholder') &&
    supabaseUrl.startsWith('https://') &&
    supabaseKey.startsWith('eyJ')
  )

  // 🔓 PERMITIR ACESSO LIVRE EM DESENVOLVIMENTO OU SEM SUPABASE
  if (isDevelopment || !isSupabaseConfigured) {
    console.log(`🔓 [MIDDLEWARE] Acesso livre permitido: ${pathname}`, {
      isDevelopment,
      isSupabaseConfigured,
      reason: isDevelopment ? 'modo desenvolvimento' : 'supabase não configurado',
      timestamp
    })
    return response
  }

  // ✅ VERIFICAÇÃO ADICIONAL: Se não é dashboard, permitir acesso
  if (!pathname.startsWith('/dashboard')) {
    console.log(`🔓 [MIDDLEWARE] Rota pública permitida: ${pathname} (${timestamp})`)
    return response
  }

  // 🔒 VERIFICAÇÃO DE AUTENTICAÇÃO APENAS PARA DASHBOARD EM PRODUÇÃO
  try {
    console.log(`🔍 [MIDDLEWARE] Verificando autenticação para: ${pathname} (${timestamp})`)

    // ✅ CRIAR CLIENTE SUPABASE PARA SERVIDOR
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseKey!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
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
          remove(name: string, options: Record<string, unknown>) {
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

    // ✅ VERIFICAR AUTENTICAÇÃO DO USUÁRIO COM TIMEOUT
    const authPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Auth timeout')), 5000)
    )

    const result = await Promise.race([
      authPromise,
      timeoutPromise
    ]) as { data: { user: unknown }, error: Error | null }

    const { data: { user }, error } = result

    // ✅ SE HÁ ERRO OU USUÁRIO NÃO AUTENTICADO
    if (error || !user) {
      console.log(`🔒 [MIDDLEWARE] Usuário não autenticado, redirecionando: ${pathname}`, {
        error: error?.message,
        hasUser: !!user,
        timestamp
      })
      
      // ✅ EVITAR LOOP DE REDIRECIONAMENTO
      if (pathname !== '/login') {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        console.log(`🔄 [MIDDLEWARE] Redirecionando para: ${redirectUrl.toString()} (${timestamp})`)
        return NextResponse.redirect(redirectUrl)
      }
    } else {
      // ✅ USUÁRIO AUTENTICADO, PERMITIR ACESSO
      const userEmail = (user as { email?: string })?.email || 'unknown'
      console.log(`✅ [MIDDLEWARE] Usuário autenticado: ${userEmail} acessando: ${pathname} (${timestamp})`)
    }

    return response

  } catch (error) {
    console.error(`❌ [MIDDLEWARE] Erro na verificação de autenticação: ${pathname}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp
    })
    
    // ✅ EM CASO DE ERRO, PERMITIR ACESSO PARA NÃO QUEBRAR O SISTEMA
    console.warn(`🔧 [MIDDLEWARE] Erro na autenticação, permitindo acesso temporário: ${pathname} (${timestamp})`)
    return response
  }
  */
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
     * - _vercel (Vercel internals)
     * - static (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon.png|_vercel|static).*)',
  ],
}

// 🎯 MIDDLEWARE TEMPORARIAMENTE DESABILITADO
// 
// MOTIVO: Resolver loop de redirecionamento
// - Login funciona
// - Redirecionamento para /dashboard funciona  
// - Middleware intercepta e redireciona de volta para /login
// - Cria loop infinito
//
// SOLUÇÃO: Desabilitar middleware temporariamente
// - Permite acesso livre ao dashboard
// - Usuário consegue usar o sistema
// - Depois podemos investigar e corrigir o problema de autenticação
//
// PARA REABILITAR:
// 1. Comentar o return NextResponse.next() no início
// 2. Descomentar o código de verificação
// 3. Testar se a autenticação funciona corretamente
