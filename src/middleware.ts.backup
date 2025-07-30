import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { 
  verifyAuth, 
  createAuthErrorResponse, 
  createLoginRedirect, 
  requiresAuth, 
  isPublicRoute, 
  addUserHeaders,
  checkRateLimit
} from './lib/auth-utils'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  // Rate limiting
  if (!checkRateLimit(ip, 100, 60000)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // Permitir rotas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Verificar autenticação para rotas protegidas
  if (requiresAuth(pathname)) {
    const authContext = await verifyAuth(request)

    if (!authContext.isAuthenticated) {
      // Para APIs, retornar erro JSON
      if (pathname.startsWith('/api/')) {
        return createAuthErrorResponse(
          authContext.error || 'Token inválido ou expirado'
        )
      }

      // Para páginas, redirecionar para login
      return createLoginRedirect(request)
    }

    // Adicionar informações do usuário aos headers para APIs
    if (pathname.startsWith('/api/') && authContext.user) {
      let response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })
      
      response = addUserHeaders(response, authContext.user)
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
