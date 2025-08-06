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
      return response
    }
  }

  // ✅ VERIFICAR SE SUPABASE ESTÁ CONFIGURADO
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isSupabaseConfigured = !!(
    supabaseUrl && 
    supabaseKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseKey !== 'placeholder-key' &&
    !supabaseUrl.includes('placeholder' ) &&
    !supabaseKey.includes('placeholder') &&
    supabaseUrl.length > 20 &&
    supabaseKey.length > 20
  )

  // ✅ SE SUPABASE NÃO CONFIGURADO, PERMITIR ACESSO (MODO DESENVOLVIMENTO)
  if (!isSupabaseConfigured) {
    console.log('🔧 Middleware: Supabase não configurado - permitindo acesso (modo dev)')
    return response
  }

  // ✅ APENAS DASHBOARD PRECISA DE AUTENTICAÇÃO
  if (!pathname.startsWith('/dashboard')) {
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
      console.log('🔒 Middleware: Usuário não autenticado, redirecionando para login')
      
      // ✅ EVITAR LOOP DE REDIRECIONAMENTO
      if (pathname !== '/login') {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // ✅ USUÁRIO AUTENTICADO, PERMITIR ACESSO
    console.log('✅ Middleware: Usuário autenticado:', user?.email)
    return response

  } catch (error) {
    console.error('❌ Middleware: Erro na verificação de autenticação:', error)
    
    // ✅ EM CASO DE ERRO, PERMITIR ACESSO PARA NÃO QUEBRAR O SISTEMA
    console.warn('🔧 Middleware: Erro na autenticação, permitindo acesso temporário')
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

