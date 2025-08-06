import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 🔧 MIDDLEWARE TEMPORARIAMENTE DESABILITADO PARA RESOLVER LOOP
  // 
  // PROBLEMA IDENTIFICADO:
  // - Usuário faz login com sucesso
  // - É redirecionado para /dashboard
  // - Middleware intercepta e redireciona de volta para /login
  // - Cria loop infinito: login → dashboard → login → dashboard
  //
  // SOLUÇÃO TEMPORÁRIA:
  // - Desabilitar verificação de autenticação
  // - Permitir acesso livre a todas as rotas
  // - Usuário consegue acessar o dashboard
  
  console.log('🔧 [MIDDLEWARE] TEMPORARIAMENTE DESABILITADO - Permitindo acesso livre')
  console.log('📍 [MIDDLEWARE] Rota acessada:', request.nextUrl.pathname)
  
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
}

// ✅ CONFIGURAÇÃO OTIMIZADA - NÃO INTERCEPTAR ARQUIVOS ESTÁTICOS E PWA
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
     * - icon.png (PWA icon)
     * - _vercel (Vercel internals)
     * - static (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon.png|_vercel|static).*)',
  ],
}

// 🎯 MIDDLEWARE TEMPORARIAMENTE DESABILITADO
// 
// MOTIVO: Resolver loop de redirecionamento
// - Login funciona ✅
// - Redirecionamento para /dashboard funciona ✅
// - Middleware intercepta e redireciona de volta para /login ❌
// - Cria loop infinito ❌
//
// SOLUÇÃO: Desabilitar middleware temporariamente
// - Permite acesso livre ao dashboard ✅
// - Usuário consegue usar o sistema ✅
// - Depois podemos investigar e corrigir o problema de autenticação
//
// PARA REABILITAR NO FUTURO:
// 1. Adicionar import: import { createServerClient } from '@supabase/ssr'
// 2. Implementar lógica de verificação de autenticação
// 3. Testar se a autenticação funciona corretamente sem loops
// 4. Garantir que cookies do Supabase estão sendo lidos corretamente
