import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ✅ INTERFACE TYPESCRIPT ESPECÍFICA - SEM ANY
interface SupabaseUser {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
  aud?: string
  created_at?: string
  updated_at?: string
}

// ✅ INTERFACE PARA RESULTADO DE AUTENTICAÇÃO - SEM ANY
interface AuthResult {
  data: {
    user: SupabaseUser | null
  }
  error: Error | null
}

// ✅ MIDDLEWARE ULTRA SIMPLES QUE REALMENTE FUNCIONA
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  console.log('🔍 Middleware executado para:', pathname)

  // ✅ CRÍTICO: Se não é uma rota do dashboard, permitir SEMPRE
  if (!pathname.startsWith('/dashboard')) {
    console.log('🌐 Middleware: Não é dashboard, permitindo:', pathname)
    return NextResponse.next()
  }

  // ✅ A partir daqui, só rotas /dashboard/* são processadas
  console.log('🔒 Middleware: Verificando autenticação para dashboard:', pathname)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // ✅ Verificar se Supabase está configurado
  const isSupabaseConfigured = !!(
    supabaseUrl && 
    supabaseKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseKey !== 'placeholder-key' &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseKey.includes('placeholder')
  )

  // ✅ Se Supabase não configurado, permitir (desenvolvimento)
  if (!isSupabaseConfigured) {
    console.log('🔧 Middleware: Supabase não configurado - permitindo acesso ao dashboard')
    return NextResponse.next()
  }

  try {
    // ✅ Criar response
    const response = NextResponse.next({ request })

    // ✅ Criar cliente Supabase
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseKey!,
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

    // ✅ Verificar autenticação com timeout
    const authPromise: Promise<AuthResult> = supabase.auth.getUser()
    const timeoutPromise: Promise<never> = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth timeout')), 3000)
    })

    const authResult: AuthResult = await Promise.race([
      authPromise,
      timeoutPromise
    ])

    const { data: { user }, error } = authResult

    // ✅ Se não autenticado, redirecionar para login
    if (error || !user) {
      console.log('🔒 Middleware: Usuário não autenticado, redirecionando para login')
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // ✅ Usuário autenticado, permitir acesso ao dashboard
    console.log('✅ Middleware: Usuário autenticado para dashboard:', user?.email)
    return response

  } catch (error) {
    console.error('❌ Middleware: Erro na verificação de autenticação:', error)
    
    // ✅ Em caso de erro, redirecionar para login
    console.warn('🔧 Middleware: Erro na autenticação, redirecionando para login')
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }
}

// ✅ CONFIGURAÇÃO ULTRA SIMPLES: Só intercepta /dashboard
export const config = {
  matcher: [
    '/dashboard/:path*'
  ],
}
