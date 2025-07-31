import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ✅ SOLUÇÃO BASEADA NA INVESTIGAÇÃO COMPLETA E PESQUISA ONLINE

// 🔍 PROBLEMA 1: VERCEL AUTHENTICATION BLOQUEIA MANIFEST.JSON
// Fonte: https://github.com/vercel/next.js/discussions/62867
// Solução: Desabilitar Vercel Authentication OU usar matcher específico

// 🔍 PROBLEMA 2: LOOP INFINITO DE REDIRECIONAMENTO
// Fonte: https://github.com/vercel/next.js/issues/62547
// Solução: Usar NextResponse.next() em vez de redirect para usuários autenticados

// 🔍 PROBLEMA 3: MIDDLEWARE INTERCEPTA ARQUIVOS ESTÁTICOS
// Fonte: https://github.com/vercel/next.js/discussions/36308
// Solução: Matcher que exclui completamente arquivos estáticos

// ✅ CONFIGURAÇÃO SUPABASE
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ INTERFACE TYPESCRIPT ESPECÍFICA (sem 'any')
interface SupabaseUser {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
  aud?: string
  created_at?: string
  updated_at?: string
}

interface AuthResult {
  data: {
    user: SupabaseUser | null
  }
  error: Error | null
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  console.log('🔍 Middleware executado para:', pathname)

  // ✅ SOLUÇÃO DEFINITIVA 1: EXCLUIR COMPLETAMENTE ARQUIVOS PWA E ESTÁTICOS
  // Baseado na pesquisa: arquivos estáticos NUNCA devem passar pelo middleware
  const staticFiles = [
    '/manifest.json',
    '/manifest.webmanifest', 
    '/sw.js',
    '/favicon.ico',
    '/icon.png',
    '/robots.txt',
    '/sitemap.xml',
    '/browserconfig.xml'
  ]

  const isStaticFile = staticFiles.includes(pathname) || 
                      pathname.startsWith('/_next/') ||
                      pathname.startsWith('/api/') ||
                      pathname.includes('.')

  if (isStaticFile) {
    console.log('🌐 Middleware: Arquivo estático permitido:', pathname)
    return NextResponse.next()
  }

  // ✅ SOLUÇÃO DEFINITIVA 2: PERMITIR PÁGINA DE LOGIN SEM VERIFICAÇÃO
  // Baseado na pesquisa: página de login NUNCA deve ser interceptada
  if (pathname === '/login' || pathname === '/register') {
    console.log('🔓 Middleware: Página de autenticação permitida:', pathname)
    return NextResponse.next()
  }

  // ✅ SOLUÇÃO DEFINITIVA 3: SÓ VERIFICAR AUTH PARA ROTAS PROTEGIDAS
  // Baseado na pesquisa: verificar auth apenas quando necessário
  if (!pathname.startsWith('/dashboard')) {
    console.log('🌐 Middleware: Rota pública permitida:', pathname)
    return NextResponse.next()
  }

  // ✅ A partir daqui, só rotas /dashboard/* são processadas
  console.log('🔒 Middleware: Verificando autenticação para dashboard:', pathname)

  // ✅ SOLUÇÃO DEFINITIVA 4: CRIAR RESPONSE ANTES DE MODIFICAR COOKIES
  // Baseado na pesquisa: usar const em vez de let para evitar ESLint errors
  const response = NextResponse.next({
    request,
  })

  // ✅ SOLUÇÃO DEFINITIVA 5: INTERFACE SUPABASE CORRETA
  // Baseado na pesquisa: usar interface específica do Supabase SSR
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
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

  try {
    // ✅ SOLUÇÃO DEFINITIVA 6: TIMEOUT PARA EVITAR TRAVAMENTO
    // Baseado na pesquisa: adicionar timeout para auth
    const authPromise: Promise<AuthResult> = supabase.auth.getUser()
    const timeoutPromise: Promise<never> = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth timeout')), 3000) // 3 segundos
    })

    const authResult: AuthResult = await Promise.race([
      authPromise,
      timeoutPromise
    ])

    const { data: { user }, error } = authResult

    if (error) {
      console.log('❌ Middleware: Erro de autenticação:', error.message)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!user) {
      console.log('🔒 Middleware: Usuário não autenticado, redirecionando para login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // ✅ SOLUÇÃO DEFINITIVA 7: USAR NEXT() EM VEZ DE REDIRECT
    // Baseado na pesquisa: NextResponse.next() evita loop infinito
    console.log('✅ Middleware: Usuário autenticado para dashboard:', user.email)
    return response

  } catch (error) {
    console.log('❌ Middleware: Erro na verificação de autenticação:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// ✅ SOLUÇÃO DEFINITIVA 8: MATCHER ESPECÍFICO PARA DASHBOARD
// Baseado na pesquisa: matcher deve ser específico para evitar interceptar arquivos estáticos
export const config = {
  matcher: [
    // ✅ Só interceptar rotas do dashboard
    '/dashboard/:path*'
  ]
}

// ✅ RESUMO DAS SOLUÇÕES IMPLEMENTADAS:

// 1. ✅ VERCEL AUTHENTICATION: 
//    - Arquivos estáticos excluídos completamente
//    - Manifest.json nunca interceptado

// 2. ✅ LOOP INFINITO DE REDIRECIONAMENTO:
//    - NextResponse.next() para usuários autenticados
//    - Página de login nunca interceptada

// 3. ✅ PERFORMANCE:
//    - Matcher específico para dashboard
//    - Verificação mínima para arquivos estáticos

// 4. ✅ TYPESCRIPT:
//    - Interface específica sem 'any'
//    - Tipos seguros para Supabase

// 5. ✅ ROBUSTEZ:
//    - Timeout para auth
//    - Tratamento de erros
//    - Logs informativos

// 6. ✅ PWA:
//    - Manifest.json sempre acessível
//    - Service Worker nunca interceptado
//    - Arquivos estáticos protegidos

// 7. ✅ MANUTENIBILIDADE:
//    - Código limpo e documentado
//    - Lógica clara e simples
//    - Fácil de debuggar

// ✅ RESULTADO ESPERADO:
// - ✅ Login fluido sem redirecionamento infinito
// - ✅ Manifest.json carregando sem erro 401
// - ✅ PWA funcionando perfeitamente
// - ✅ Dashboard protegido com segurança
// - ✅ Performance otimizada
// - ✅ Console limpo com logs informativos
