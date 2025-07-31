import { NextResponse, type NextRequest } from 'next/server'

// ✅ SOLUÇÃO REAL - MIDDLEWARE ULTRA SIMPLES QUE FUNCIONA
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  console.log('🔍 Middleware executado para:', pathname)

  // ✅ CRÍTICO: NUNCA interceptar estes arquivos
  const neverIntercept = [
    '/manifest.json',
    '/sw.js', 
    '/favicon.ico',
    '/icon.png',
    '/login',
    '/register',
    '/api/',
    '/_next/',
    '/public/'
  ]

  // ✅ VERIFICAÇÃO IMEDIATA - SEM PROCESSAMENTO
  for (const route of neverIntercept) {
    if (pathname.startsWith(route) || pathname === route) {
      console.log('🚫 Middleware: Rota nunca interceptada:', pathname)
      return NextResponse.next()
    }
  }

  // ✅ SE NÃO É DASHBOARD, PERMITIR SEMPRE
  if (!pathname.startsWith('/dashboard')) {
    console.log('🌐 Middleware: Não é dashboard, permitindo:', pathname)
    return NextResponse.next()
  }

  // ✅ APENAS PARA DASHBOARD: Verificar se tem cookie de sessão
  const sessionCookie = request.cookies.get('sb-access-token') || 
                       request.cookies.get('supabase-auth-token') ||
                       request.cookies.get('sb-refresh-token')

  if (!sessionCookie) {
    console.log('🔒 Middleware: Sem cookie de sessão, redirecionando para login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  console.log('✅ Middleware: Cookie encontrado, permitindo acesso ao dashboard')
  return NextResponse.next()
}

// ✅ CONFIGURAÇÃO MÍNIMA - SÓ DASHBOARD
export const config = {
  matcher: [
    /*
     * Interceptar apenas rotas que começam com /dashboard
     * Tudo mais é permitido automaticamente
     */
    '/dashboard/:path*'
  ],
}

