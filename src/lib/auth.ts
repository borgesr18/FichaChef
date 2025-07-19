import { NextResponse } from 'next/server'
import { createClient } from './supabase-server'

export interface AuthenticatedUser {
  id: string
  email?: string
}

export async function authenticateUser(): Promise<AuthenticatedUser | null> {
  try {
    // Em desenvolvimento, verificar se deve usar dados de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      // Verificar flag explícita
      if (process.env.DEV_MODE === 'true') {
        console.log('🔓 Modo desenvolvimento: DEV_MODE=true, permitindo acesso sem autenticação')
        return {
          id: 'dev-user-id',
          email: 'dev@fichachef.com'
        }
      }
      
      // Verificar se Supabase está configurado
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl === '' || supabaseKey === '' ||
          supabaseUrl.includes('placeholder') || 
          supabaseKey.includes('placeholder')) {
        console.log('🔓 Modo desenvolvimento: Supabase não configurado, permitindo acesso sem autenticação')
        return {
          id: 'dev-user-id',
          email: 'dev@fichachef.com'
        }
      }
    }

    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    
    // Em desenvolvimento, retornar usuário fake se houver erro
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔓 Modo desenvolvimento: Erro na autenticação, usando usuário fake')
      return {
        id: 'dev-user-id',
        email: 'dev@fichachef.com'
      }
    }
    
    return null
  }
}

export function createUnauthorizedResponse() {
  return NextResponse.json(
    { error: 'Não autorizado. Faça login para continuar.' },
    { status: 401 }
  )
}

export function createValidationErrorResponse(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  )
}

export function createServerErrorResponse(message: string = 'Erro interno do servidor') {
  return NextResponse.json(
    { error: message },
    { status: 500 }
  )
}

export function createNotFoundResponse(resource: string = 'Recurso') {
  return NextResponse.json(
    { error: `${resource} não encontrado` },
    { status: 404 }
  )
}

export function createSuccessResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status })
}

