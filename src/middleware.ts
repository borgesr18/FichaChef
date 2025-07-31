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

// ✅ MIDDLEWARE DEFINITIVO - Solução que REALMENTE funciona
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ✅ CRÍTICO: Lista completa de rotas que NUNCA devem ser interceptadas
  const NEVER_INTERCEPT = [
    '/manifest.json',
    '/sw.js',
    '/favicon.ico',
    '/icon.png',
    '/robots.txt',
    '/sitemap.xml',
    '/browserconfig.xml',
    '/_next/static',
    '/_next/image',
    '/api/auth',
    '/login',           // ✅ CRÍTICO: Login nunca interceptado
    '/register',
    '/reset-password'
  ]

  // ✅ CRÍTICO: Se é uma rota que nunca deve ser interceptada, permitir imediatamente
  const shouldNeverIntercept = NEVER_INTERCEPT.some(route => {
    if (route.endsWith('/')) {
      return pathname.startsWith(route)
    }
    return pathname === route || pathname.startsWith(route + '/')
  })

  if (shouldNeverIntercept) {
    console.log('🚫 Middleware: Rota nunca interceptada:', pathname)
    return NextResponse.next()
  }

  // ✅ CRÍTICO: Verificar se é arquivo estático (extensões)
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot']
  const isStaticFile = staticExtensions.some(ext => pathname.endsWith(ext))
  
  if (isStaticFile) {
    console.log('📁 Middleware: Arquivo estático permitido:', pathname)
    return NextResponse.next()
  }

  // ✅ Verificar configuração do Supabase
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

  // ✅ Se Supabase não configurado, permitir tudo
  if (!isSupabaseConfigured) {
    console.log('🔧 Middleware: Supabase não configurado - permitindo acesso')
    return NextResponse.next()
  }

  // ✅ CRÍTICO: Para rotas protegidas, verificar autenticação
  const PROTECTED_ROUTES = [
    '/dashboard',
    '/cardapios',
    '/fichas-tecnicas',
    '/insumos',
    '/fornecedores',
    '/estoque',
    '/producao',
    '/relatorios',
    '/usuarios',
    '/auditoria',
    '/analise-temporal',
    '/alertas',
    '/configuracoes'
  ]

  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // ✅ Se não é rota protegida, permitir acesso
  if (!isProtectedRoute) {
    console.log('🌐 Middleware: Rota pública permitida:', pathname)
    return NextResponse.next()
  }

  // ✅ VERIFICAÇÃO DE AUTENTICAÇÃO apenas para rotas protegidas
  try {
    console.log('🔒 Middleware: Verificando autenticação para rota protegida:', pathname)

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

    // ✅ Verificação rápida de autenticação (timeout reduzido)
    const authPromise: Promise<AuthResult> = supabase.auth.getUser()
    const timeoutPromise: Promise<never> = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth timeout')), 2000) // ✅ 2 segundos apenas
    })

    const authResult: AuthResult = await Promise.race([
      authPromise,
      timeoutPromise
    ])

    const { data: { user }, error } = authResult

    // ✅ Se não autenticado, redirecionar para login
    if (error || !user) {
      console.log('🔒 Middleware: Usuário não autenticado, redirecionando para login')
      const redirectUrl = new URL('/login', request.url)
      
      // ✅ Adicionar parâmetro de redirect apenas se não for a home
      if (pathname !== '/') {
        redirectUrl.searchParams.set('redirect', pathname)
      }
      
      return NextResponse.redirect(redirectUrl)
    }

    // ✅ Usuário autenticado, permitir acesso
    console.log('✅ Middleware: Usuário autenticado para rota protegida:', user?.email)
    return response

  } catch (error) {
    console.error('❌ Middleware: Erro na verificação de autenticação:', error)
    
    // ✅ Em caso de erro, redirecionar para login
    console.warn('🔧 Middleware: Erro na autenticação, redirecionando para login')
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }
}

// ✅ CONFIGURAÇÃO DEFINITIVA: Matcher que exclui TUDO que não deve ser interceptado
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest) ← CRÍTICO
     * - sw.js (service worker) ← CRÍTICO
     * - icon.png (PWA icons) ← CRÍTICO
     * - icons/ (PWA icons directory) ← CRÍTICO
     * - public folder
     * - api routes that don't need auth
     * - login page ← CRÍTICO
     * - register page
     * - reset-password page
     * - All static file extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon.png|icons/|public|api/auth|login|register|reset-password|browserconfig.xml|robots.txt|sitemap.xml|.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)).*)',
  ],
}
