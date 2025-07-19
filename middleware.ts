import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // BYPASS TOTAL - SEMPRE PERMITIR ACESSO AO DASHBOARD
  console.log('🔓 MIDDLEWARE: Bypass total ativo - permitindo acesso a todas as rotas')
  
  // Se está tentando acessar dashboard, permitir sempre
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // Se está na raiz, redirecionar para dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Se está no login, redirecionar para dashboard
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Permitir acesso a todas as outras rotas
  return NextResponse.next()
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

