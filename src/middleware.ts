import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ✅ Middleware robusto para Supabase Auth + Vercel compatível
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // ✅ Verificar se Supabase está corretamente configurado
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
    '/favicon.ico',
    '/manifest.json',
    '/sw.js',
    '/icon.png',
    '/icons/',
    '/browserconfig.xml',
    '/robots.txt',
    '/sitemap.xml',
    '/_next' // arquivos internos do Next.js
  ]

  const pathname = request.nextUrl.pathname

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  if (isPublicRoute) {
    console.log('🌐 Middleware: Rota pública permitida:', pathname)
    return NextResponse.next()
  }

  // ✅ Segurança adicional: permitir arquivos PWA mesmo se estiverem fora da lista
  const pwaFiles = ['manifest.json', 'sw.js', 'favicon.ico', 'icon.png', 'browserconfig.xml']
  const isPwaFile = pwaFiles.some(file => pathname.endsWith(file))
  if (isPwaFile) {
    console.log('📱 Middleware: Arquivo PWA permitido:', pathname)
    return NextResponse.next()
  }

  // ✅ Se Supabase não está configurado, liberar acesso no modo dev
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

      if (pathname !== '/login') {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    console.log('✅ Middleware: Usuário autenticado:', user?.email)
    return response

  } catch (error) {
    console.error('❌ Middleware: Erro de autenticação:', error)
    console.warn('⚠️ Permissão temporária concedida por erro')
    return NextResponse.next()
  }
}

// ✅ Configuração limpa e compatível com Next.js App Router e Vercel
export const config = {
  matcher: [
    '/dashboard/:path*',       // todas as rotas protegidas no sistema
  ],
}

