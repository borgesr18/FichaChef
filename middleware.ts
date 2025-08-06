import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

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
  
  // ✅ CRÍTICO: NUNCA interceptar arquivos Next.js
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  return await updateSession(request)
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

