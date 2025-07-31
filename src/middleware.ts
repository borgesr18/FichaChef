import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ✅ INTERFACE TYPESCRIPT ESPECÍFICA - SEM ANY
interface SupabaseUser {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
  aud?: string
  created_at?: string
  updated_at?: string
}

// ✅ INTERFACE PARA RESULTADO DE AUTENTICAÇÃO - SEM ANY
interface AuthResult {
  data: {
    user: SupabaseUser | null
  }
  error: Error | null
}

// ✅ MIDDLEWARE CORRIGIDO - Resolve redirecionamento infinito baseado no log
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // ✅ CRÍTICO: Permitir manifest.json SEMPRE (resolve erro 401)
  if (request.nextUrl.pathname === '/manifest.json') {
    console.log('📱 Middleware: Permitindo manifest.json (resolve erro 401)')
    return NextResponse.next()
  }

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
    return NextResponse.next()
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
    return NextResponse.next()
  }

  // ✅ Se Supabase não está configurado, permitir acesso (modo desenvolvimento)
  if (!isSupabaseConfigured) {
    console.log('🔧 Middleware: Supabase não configurado - permitindo acesso')
    return NextResponse.next()
  }

  // ✅ CRÍTICO: Para página de login, permitir acesso SEM verificar autenticação
  // Isso resolve o problema de redirecionamento infinito
  if (request.nextUrl.pathname === '/login') {
    console.log('🔓 Middleware: Permitindo acesso direto à página de login (sem verificar auth)')
    return NextResponse.next()
  }

  try {
    // ✅ CORRIGIDO: Usar const para response
    const response = NextResponse.next({
      request,
    })

    // ✅ Interface oficial Supabase SSR
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

    // ✅ CORRIGIDO: Verificar autenticação com timeout e tipos específicos
    const authPromise: Promise<AuthResult> = supabase.auth.getUser()
    const timeoutPromise: Promise<never> = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth timeout')), 3000) // ✅ Reduzido para 3 segundos
    })

    // ✅ CORRIGIDO: Usar tipo específico
    const authResult: AuthResult = await Promise.race([
      authPromise,
      timeoutPromise
    ])

    const { data: { user }, error } = authResult

    // ✅ CORRIGIDO: Para outras rotas (não login), verificar autenticação
    if (error || !user) {
      console.log('🔒 Middleware: Usuário não autenticado, redirecionando para login')
      
      // ✅ CRÍTICO: Evitar loop de redirecionamento
      if (request.nextUrl.pathname !== '/login') {
        const redirectUrl = new URL('/login', request.url)
        // ✅ Adicionar parâmetro de redirect apenas se não for a home
        if (request.nextUrl.pathname !== '/') {
          redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        }
        return NextResponse.redirect(redirectUrl)
      }
      
      // Se já está na página de login, permitir
      return response
    }

    // ✅ Usuário autenticado, permitir acesso
    console.log('✅ Middleware: Usuário autenticado:', user?.email)
    return response

  } catch (error) {
    console.error('❌ Middleware: Erro na verificação de autenticação:', error)
    
    // ✅ CORRIGIDO: Em caso de erro, comportamento específico por rota
    if (request.nextUrl.pathname === '/login') {
      // Se erro na página de login, permitir acesso
      console.warn('🔧 Middleware: Erro na autenticação, permitindo acesso ao login')
      return NextResponse.next()
    }
    
    // Para outras rotas, redirecionar para login em caso de erro
    console.warn('🔧 Middleware: Erro na autenticação, redirecionando para login')
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }
}

// ✅ CORRIGIDO: Configuração que exclui arquivos PWA E permite manifest.json
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest) ← CRÍTICO: Excluído para evitar erro 401
     * - sw.js (service worker)
     * - icon.png (PWA icons)
     * - icons/ (PWA icons directory)
     * - public folder
     * - api routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon.png|icons/|public|api/auth|browserconfig.xml|robots.txt|sitemap.xml).*)',
  ],
}
