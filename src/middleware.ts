import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// ✅ MIDDLEWARE OFICIAL DO SUPABASE - SOLUÇÃO DEFINITIVA
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// ✅ CONFIGURAÇÃO OTIMIZADA PARA VERCEL
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - sw.js (service worker)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)',
  ],
}

