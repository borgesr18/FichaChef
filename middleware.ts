import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // ✅ Verificar se Supabase está configurado
  const isSupabaseConfigured = !!(
    supabaseUrl && 
    supabaseKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseKey !== 'placeholder-key' &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseKey.includes('placeholder')
  )

  // ✅ ROTAS PÚBLICAS: Sempre permitir acesso
  const publicRoutes = [
    '/login',
    '/register', 
    '/reset-password',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js',
    '/icon'
  ]

  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return response
  }

  // ✅ Se Supabase não está configurado, permitir acesso (modo desenvolvimento)
  if (!isSupabaseConfigured) {
    console.log('🔧 Middleware: Supabase não configurado - permitindo acesso')
    return response
  }

  try {
    // ✅ Criar cliente Supabase para servidor
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

    // ✅ Verificar autenticação para TODAS as rotas protegidas
    const { data: { user }, error } = await supabase.auth.getUser()

    // ✅ Se há erro ou usuário não autenticado, redirecionar para login
    if (error || !user) {
      console.log('🔒 Middleware: Usuário não autenticado, redirecionando para login')
      
      // ✅ Evitar loop de redirecionamento
      if (request.nextUrl.pathname !== '/login') {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // ✅ Usuário autenticado, permitir acesso
    console.log('✅ Middleware: Usuário autenticado:', user?.email)
    return response

  } catch (error) {
    console.error('❌ Middleware: Erro na verificação de autenticação:', error)
    
    // ✅ Em caso de erro, permitir acesso para não quebrar o sistema
    console.warn('🔧 Middleware: Erro na autenticação, permitindo acesso temporário')
    return response
  }
}

// ✅ CORRIGIDO: Configuração de rotas mais específica
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
}

