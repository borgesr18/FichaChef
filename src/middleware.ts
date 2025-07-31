import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// ✅ MIDDLEWARE BASEADO NA DOCUMENTAÇÃO OFICIAL DO SUPABASE
// Fonte: https://supabase.com/docs/guides/auth/server-side/nextjs

export async function middleware(request: NextRequest) {
  // ✅ SOLUÇÃO OFICIAL: Usar updateSession do Supabase
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * ✅ MATCHER OFICIAL DO SUPABASE:
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
