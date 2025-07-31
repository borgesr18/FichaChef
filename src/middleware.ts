import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ✅ Middleware com verificação de autenticação e suporte a rotas públicas
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isSupabaseConfigured = !!(
    supabaseUrl && 
    supabaseKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseKey !== 'placeholder-key' &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseKey.includes('placeholder')
  )

  const publicRoutes = [
    '/login',
    '/register', 
    '/reset-password',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js',
    '/icon.png',
    '/icons/',
    '/browserconfig.xml',
    '/robots.txt',
    '/sitemap.xml'
  ]

  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route) || 
    request.nextUrl.pathname === route
  )

  if (isPublicRoute) {
    console.log('🌐 Middleware: Rota pública permitida:', request.nextUrl.pathname)
    return NextResponse.next()
  }

  const pwaFiles = [
    'manifest.json',
    'sw.js', 
    'favicon.ico',
    'icon.png',
    'browserconfig.xml'
  ]

  const isPwaFile = pwaFiles.some(file => 
    request.nextUrl.pathname.endsWith(file)
  )

  if (isPwaFile) {
    console.log('📱 Middleware: Arquivo PWA permitido:', request.nextUrl.pathname)
    return NextResponse.next()
  }

  if (!isSupabaseConfigured) {
    console.log('🔧 Middleware: Supabase não configurado - permitindo acesso')
    return NextResponse.next()
  }

  try {
    const response = NextResponse.next({ request })

    const supabase = createServerClient(
      supabaseUrl!,
      supabaseKey!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.log('🔒 Middleware: Usuário não autenticado, redirecionando para login')
      if (request.nextUrl.pathname !== '/login') {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    console.log('✅ Middleware: Usuário autenticado:', user?.email)
    return response

  } catch (error) {
    console.error('❌ Middleware: Erro na verificação de autenticação:', error)
    console.warn('🔧 Middleware: Erro na autenticação, permitindo acesso temporário')
    return NextResponse.next()
  }
}

// ✅ Configuração compatível com Vercel e App Router
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}
