import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ✅ FUNÇÃO OFICIAL DO SUPABASE PARA MIDDLEWARE - ESLINT CORRIGIDO
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // ✅ VERIFICAR SE SUPABASE ESTÁ CONFIGURADO
  if (!supabaseUrl || !supabaseKey) {
    console.log('🔧 UpdateSession: Supabase não configurado - permitindo acesso')
    return supabaseResponse
  }

  const pathname = request.nextUrl.pathname
  console.log('🔍 UpdateSession: Processando rota:', pathname)

  // ✅ ROTAS PÚBLICAS - SEMPRE PERMITIR
  const publicRoutes = ['/login', '/register', '/reset-password']
  if (publicRoutes.includes(pathname)) {
    console.log('🔓 UpdateSession: Rota pública permitida:', pathname)
    return supabaseResponse
  }

  try {
    // ✅ CRIAR CLIENTE SUPABASE PARA SERVIDOR
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // ✅ CORRIGIDO: Removido parâmetro 'options' não utilizado
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // ✅ VERIFICAR USUÁRIO AUTENTICADO
    const { data: { user }, error } = await supabase.auth.getUser()

    // ✅ LÓGICA PRINCIPAL: DASHBOARD REQUER AUTENTICAÇÃO
    if (pathname.startsWith('/dashboard')) {
      if (!user || error) {
        console.log('🔒 UpdateSession: Usuário não autenticado, redirecionando para login')
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      } else {
        console.log('✅ UpdateSession: Usuário autenticado acessando dashboard:', user.email)
        return supabaseResponse
      }
    }

    // ✅ OUTRAS ROTAS: PERMITIR ACESSO
    return supabaseResponse

  } catch (error) {
    console.error('❌ UpdateSession: Erro na verificação:', error)
    
    // ✅ EM CASO DE ERRO, PERMITIR ACESSO PARA NÃO QUEBRAR O SISTEMA
    console.warn('🔧 UpdateSession: Erro na autenticação, permitindo acesso temporário')
    return supabaseResponse
  }
}

