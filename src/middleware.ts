import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const pathname = request.nextUrl.pathname

  const publicRoutes = [
    '/login',
    '/register',
    '/reset-password',
    '/api/auth',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js',
    '/icon.png',
    '/icons/',
    '/browserconfig.xml',
    '/robots.txt',
    '/sitemap.xml',
    '/_next'
  ]

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route)
  )

  const isSupabaseConfigured = !!(
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseKey.includes('placeholder')
  )

  // ✅ Permitir imediatamente rotas públicas
  if (isPublicRoute || !isSupabaseConfigured) {
    console.log('🌐 Middleware: Rota pública liberada ou Supabase desconfigurado:', pathname)
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
      console.log('🔒 Middleware: Usuário não autenticado')
      if (pathname !== '/login') {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    console.log('✅ Middleware: Usuário autenticado:', user?.email)
    return response

  } catch (error) {
    console.error('❌ Middleware: Erro crítico:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
}


