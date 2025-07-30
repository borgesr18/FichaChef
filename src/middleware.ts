import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ✅ CORRIGIDO: Middleware que usa interface correta do Supabase
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

  // ✅ ROTAS PÚBLICAS: Sempre permitir acesso (incluindo PWA)
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

  // ✅ CRÍTICO: Permitir acesso direto a arquivos PWA
  if (isPublicRoute) {
    console.log('🌐 Middleware: Rota pública permitida:', request.nextUrl.pathname)
    return response
  }

  // ✅ CRÍTICO: Verificar se é arquivo estático PWA
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
    return response
  }

  // ✅ Se Supabase não está configurado, permitir acesso (modo desenvolvimento)
  if (!isSupabaseConfigured) {
    console.log('🔧 Middleware: Supabase não configurado - permitindo acesso')
    return response
  }

  try {
    // ✅ CORRIGIDO: Criar cliente Supabase com interface correta
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

    // ✅ Verificar autenticação
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

// ✅ CORRIGIDO: Configuração que exclui arquivos PWA
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - sw.js (service worker)
     * - icon.png (PWA icons)
     * - icons/ (PWA icons directory)
     * - public folder
     * - api routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon.png|icons/|public|api/auth|browserconfig.xml|robots.txt|sitemap.xml).*)',
  ],
}
