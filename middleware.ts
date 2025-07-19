import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Em desenvolvimento, permitir acesso direto se Supabase não estiver configurado
  if (process.env.NODE_ENV === 'development') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === '' || supabaseKey === '' ||
        supabaseUrl.includes('placeholder') || 
        supabaseKey.includes('placeholder')) {
      
      // Permitir acesso direto ao dashboard em desenvolvimento
      if (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      
      // Permitir acesso a todas as rotas em desenvolvimento
      return NextResponse.next()
    }
  }

  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            req.cookies.set({
              name,
              value,
              ...options,
            })
            res = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            res.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            req.cookies.set({
              name,
              value: '',
              ...options,
            })
            res = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            res.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session && (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname === '/')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Em caso de erro, permitir acesso em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      if (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return NextResponse.next()
    }
    
    // Em produção, redirecionar para login em caso de erro
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ]
}
