import { NextResponse, type NextRequest } from 'next/server'

// ✅ MIDDLEWARE DEFINITIVO - BASEADO NA INVESTIGAÇÃO COMPLETA
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // ✅ CRÍTICO: NUNCA interceptar manifest.json (resolve erro 401)
  if (pathname === '/manifest.json') {
    return NextResponse.next()
  }
  
  // ✅ CRÍTICO: NUNCA interceptar arquivos PWA
  if (pathname === '/sw.js' || pathname === '/favicon.ico' || pathname.startsWith('/icon')) {
    return NextResponse.next()
  }
  
  // ✅ CRÍTICO: NUNCA interceptar página de login (resolve loop infinito)
  if (pathname === '/login') {
    return NextResponse.next()
  }
  
  // ✅ CRÍTICO: NUNCA interceptar arquivos Next.js
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // ✅ APENAS dashboard precisa de autenticação
  if (pathname.startsWith('/dashboard')) {
    // Verificação simples de cookie de sessão - usar nome correto do cookie Supabase
    const authCookie = request.cookies.get('sb-qaomdfwvaxmyyyndbyic-auth-token') || 
                      request.cookies.get('sb-access-token') || 
                      request.cookies.get('supabase-auth-token')
    
    if (!authCookie) {
      // Redirecionar para login apenas se não tiver cookie
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // ✅ Para todas as outras rotas, permitir acesso
  return NextResponse.next()
}

// ✅ CONFIGURAÇÃO MÍNIMA - Não interceptar arquivos estáticos
export const config = {
  matcher: [
    /*
     * Match all request paths except static files and PWA files
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon.png|icons/).*)',
  ],
}

