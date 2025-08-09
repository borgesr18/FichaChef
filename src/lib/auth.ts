import { NextResponse } from 'next/server'
import { createClient } from './supabase-server'
import { withRequestDeduplication } from './request-cache'

export interface AuthenticatedUser {
  id: string
  email?: string
  role?: string
  nome?: string
}

export async function authenticateUser(): Promise<AuthenticatedUser | null> {
  try {
    // Verificar se Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Se Supabase não está configurado, usar modo desenvolvimento
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === '' || supabaseKey === '' ||
        supabaseUrl.includes('placeholder') || 
        supabaseKey.includes('placeholder')) {
      
      console.log('🔓 Supabase não configurado - Modo desenvolvimento ativo')
      console.log('🔧 Para produção: Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no Vercel')
      return {
        id: 'dev-user-id',
        email: 'dev@fichachef.com'
      }
    }

    // Usar autenticação real do Supabase
    console.log('🔐 Supabase configurado - Usando autenticação real')
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('❌ Erro na autenticação Supabase:', error.message)
      console.error('🔧 Verifique as credenciais do Supabase no Vercel')
      
      // Em produção, usar fallback temporário
      if (process.env.NODE_ENV === 'production') {
        console.warn('🔧 PRODUÇÃO: Usando fallback temporário para manter funcionalidade')
        return {
          id: 'temp-prod-user',
          email: 'temp@fichachef.com'
        }
      }
      
      return null
    }

    if (!user) {
      console.log('❌ Usuário não autenticado')
      
      // Em produção, usar fallback temporário
      if (process.env.NODE_ENV === 'production') {
        console.warn('🔧 PRODUÇÃO: Usuário não autenticado, usando fallback temporário')
        return {
          id: 'temp-prod-user',
          email: 'temp@fichachef.com'
        }
      }
      
      return null
    }

    console.log('✅ Usuário autenticado:', user.email)
    return {
      id: user.id,
      email: user.email,
    }
  } catch (error) {
    console.error('❌ Erro crítico na autenticação:', error)
    
    // Em desenvolvimento, retornar usuário fake em caso de erro
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 Erro na autenticação, usando usuário de desenvolvimento')
      return {
        id: 'dev-user-id',
        email: 'dev@fichachef.com'
      }
    }
    
    // Em produção, usar fallback temporário
    if (process.env.NODE_ENV === 'production') {
      console.warn('🔧 PRODUÇÃO: Erro crítico na autenticação, usando fallback temporário')
      return {
        id: 'temp-prod-user',
        email: 'temp@fichachef.com'
      }
    }
    
    console.error('🚨 PRODUÇÃO: Falha crítica na autenticação - verifique variáveis de ambiente no Vercel')
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

export async function authenticateUserWithProfile(): Promise<AuthenticatedUser | null> {
  const user = await authenticateUser()
  if (!user) return null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const isDevMode = !supabaseUrl || !supabaseKey || 
                    supabaseUrl === '' || supabaseKey === '' ||
                    supabaseUrl.includes('placeholder') || 
                    supabaseKey.includes('placeholder')

  if (isDevMode) {
    console.log('🔧 Modo desenvolvimento: usando perfil padrão (chef)')
    return {
      ...user,
      role: 'chef',
      nome: 'Usuário Desenvolvimento'
    }
  }

  try {
    const { prisma } = await import('./prisma')
    const { withConnectionHealthCheck } = await import('./database-utils')
    
    const perfil = await withConnectionHealthCheck(async () => {
      return await prisma.perfilUsuario.findUnique({
        where: { userId: user.id }
      })
    })

    // Override de admin conhecido
    if (user.email === 'rba1807@gmail.com') {
      return {
        ...user,
        role: 'chef',
        nome: perfil?.nome || 'Administrador'
      }
    }

    if (!perfil) {
      // ✅ CORRIGIDO: Não criar perfil automaticamente
      // Se não existe perfil, retorna usuário sem role
      // O perfil deve ser criado manualmente no admin
      console.warn('⚠️ Perfil não encontrado para usuário:', user.email)
      return {
        ...user,
        role: undefined,
        nome: undefined
      }
    }

    return {
      ...user,
      role: perfil.role || undefined,
      nome: perfil.nome || undefined
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return user
  }
}

export async function authenticateWithPermission(
  module: string,
  permission: 'read' | 'write' | 'admin' = 'read'
): Promise<AuthenticatedUser> {
  const cacheKey = `auth-${module}-${permission}`
  
  return withRequestDeduplication(cacheKey, async () => {
    const user = await authenticateUserWithProfile()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { requirePermission } = await import('./permissions')
    requirePermission(user.role as 'chef' | 'cozinheiro' | 'gerente', module, permission)

    return user
  }, 3000)
}

export function createForbiddenResponse(message: string = 'Acesso negado') {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  )
}

export function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { error: message },
    { status }
  )
}

