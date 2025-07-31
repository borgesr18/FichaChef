import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// ✅ MIDDLEWARE OFICIAL DO SUPABASE - COMPATÍVEL COM VERCEL
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)',
  ],
}

