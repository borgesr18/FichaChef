import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/login',
    '/register', 
    '/forgot-password',
    '/reset-password',
    '/api/health',
    '/_next',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js'
  ]

  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Verificar configuração do Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Se Supabase não está configurado, usar modo desenvolvimento
  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl === '' || supabaseKey === '' ||
      supabaseUrl.includes('placeholder') || 
      supabaseKey.includes('placeholder')) {
    
    console.log('🔓 Supabase não configurado - Modo desenvolvimento ativo')
    
    // Em desenvolvimento, permitir acesso direto ao dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    return NextResponse.next()
  }

  // Criar cliente Supabase para verificação de autenticação
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
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

  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // Se há erro na autenticação ou usuário não existe
    if (error || !user) {
      console.log('❌ Usuário não autenticado:', error?.message || 'Sem usuário')
      
      // Se está tentando acessar uma rota protegida, redirecionar para login
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Não autorizado. Faça login para continuar.' },
            { status: 401 }
          )
        }
        
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
    } else {
      console.log('✅ Usuário autenticado:', user.email)
      
      // Se usuário está logado e tenta acessar login, redirecionar para dashboard
      if (pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Se está na raiz, redirecionar baseado na autenticação
    if (pathname === '/') {
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    return response
    
  } catch (error) {
    console.error('❌ Erro no middleware:', error)
    
    // Em caso de erro, permitir acesso em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 Erro no middleware, permitindo acesso em desenvolvimento')
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.next()
    }
    
    // Em produção, redirecionar para login em caso de erro
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Erro de autenticação' },
        { status: 500 }
      )
    }
    
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

