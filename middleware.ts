import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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

  // ✅ Se Supabase não está configurado, permitir acesso (modo desenvolvimento)
  if (!isSupabaseConfigured) {
    console.log('🔧 Middleware: Supabase não configurado - permitindo acesso')
    return response
  }

  try {
    // ✅ Criar cliente Supabase para servidor
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseKey!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    if (pathname.startsWith('/dashboard')) {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        console.log('🔒 Middleware: Usuário não autenticado, redirecionando para login')
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      console.log('✅ Middleware: Usuário autenticado:', user?.email)
    }

    return response

  } catch (error) {
    console.error('❌ Middleware: Erro na verificação de autenticação:', error)
    
    // ✅ Em caso de erro, permitir acesso para não quebrar o sistema
    console.warn('🔧 Middleware: Erro na autenticação, permitindo acesso temporário')
    return response
  }
}

// ✅ CONFIGURAÇÃO MÍNIMA - Não interceptar arquivos estáticos
export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon.png).*)',
  ],
}

