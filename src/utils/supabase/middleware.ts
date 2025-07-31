import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ✅ FUNÇÃO OFICIAL DO SUPABASE PARA ATUALIZAR SESSÃO
// Fonte: https://supabase.com/docs/guides/auth/server-side/nextjs

export async function updateSession(request: NextRequest) {
  // ✅ ANÁLISE DO LOG: O problema é que o usuário fica em "Redirecionando..."
  // Isso acontece porque o middleware não está permitindo o acesso ao dashboard
  
  console.log('🔍 UpdateSession: Processando rota:', request.nextUrl.pathname)

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // ✅ SOLUÇÃO BASEADA NO LOG: O usuário está autenticado mas não consegue acessar dashboard
  // Log mostra: "✅ Login: Usuário já autenticado, redirecionando para: /dashboard"
  // Mas o middleware está bloqueando o acesso

  // ✅ IMPORTANTE: Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ✅ SOLUÇÃO CRÍTICA: Permitir acesso ao dashboard para usuários autenticados
  // O log mostra que o usuário está autenticado mas fica preso em "Redirecionando..."
  
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      // ✅ Usuário não autenticado tentando acessar dashboard -> redirecionar para login
      console.log('🔒 UpdateSession: Usuário não autenticado, redirecionando para login')
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    } else {
      // ✅ CRÍTICO: Usuário autenticado acessando dashboard -> PERMITIR ACESSO
      console.log('✅ UpdateSession: Usuário autenticado acessando dashboard:', user.email)
      return supabaseResponse
    }
  }

  // ✅ Para outras rotas (login, páginas públicas), permitir acesso
  if (request.nextUrl.pathname === '/login' && user) {
    // ✅ Usuário autenticado na página de login -> redirecionar para dashboard
    console.log('🔄 UpdateSession: Usuário autenticado na página de login, redirecionando para dashboard')
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  console.log('🌐 UpdateSession: Rota pública permitida:', request.nextUrl.pathname)
  return supabaseResponse
}

// ✅ EXPLICAÇÃO DA SOLUÇÃO:

// 1. O LOG MOSTRA QUE O USUÁRIO ESTÁ AUTENTICADO:
//    "✅ Login: Usuário já autenticado, redirecionando para: /dashboard"
//    "🔐 Auth state changed: SIGNED_IN"

// 2. MAS FICA PRESO EM "Redirecionando..." PORQUE:
//    - O middleware estava bloqueando o acesso ao dashboard
//    - Mesmo com usuário autenticado, não permitia o acesso

// 3. A SOLUÇÃO OFICIAL DO SUPABASE:
//    - Usar updateSession() que só atualiza cookies
//    - Não fazer verificações complexas de autenticação
//    - Permitir que as páginas façam suas próprias verificações

// 4. DIFERENÇA CRUCIAL:
//    - Antes: Middleware complexo com muitas verificações
//    - Agora: Middleware simples que só atualiza sessão
//    - Páginas fazem suas próprias verificações de auth

// ✅ RESULTADO ESPERADO:
// - Login funcionará normalmente
// - Dashboard será acessível para usuários autenticados
// - Não haverá mais redirecionamento infinito
// - Console mostrará logs claros do processo
