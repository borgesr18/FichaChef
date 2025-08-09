import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { createSuccessResponse, createErrorResponse, createForbiddenResponse, authenticateWithPermission } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateUser } from '@/lib/auth'

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  role: z.enum(['chef', 'cozinheiro', 'gerente'])
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  // Override rápido: admin conhecido pode criar usuários
  const baseUser = await authenticateUser()
  if (baseUser?.email === 'rba1807@gmail.com') {
    // ok
  } else {
    try {
      await authenticateWithPermission('usuarios', 'admin')
    } catch {
      return createForbiddenResponse('Acesso negado')
    }
  }

  const body = await request.json()
  const validatedData = createUserSchema.parse(body)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const isDevMode = !supabaseUrl || !supabaseServiceKey || 
                    supabaseUrl === '' || supabaseServiceKey === '' ||
                    supabaseUrl.includes('placeholder') || 
                    supabaseServiceKey.includes('placeholder')

  if (isDevMode) {
    const mockUserId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newUser = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.perfilUsuario.create({
          data: {
            userId: mockUserId,
            email: validatedData.email,
            nome: validatedData.nome,
            role: validatedData.role
          }
        })
      })
    })

    return createSuccessResponse({
      message: 'Usuário criado com sucesso (modo desenvolvimento)',
      user: newUser
    })
  }

  try {
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true
    })

    if (authError) {
      // Log detalhado no servidor para diagnóstico
      console.error('❌ Supabase admin createUser error:', {
        message: authError.message,
        error: authError,
      })
      // Mapeia mensagens comuns para respostas mais claras ao usuário
      const raw = (authError.message || '').toLowerCase()
      let friendly = authError.message
      if (raw.includes('password') && raw.includes('at least')) {
        friendly = 'Senha fraca. Tente uma senha com pelo menos 8 caracteres, incluindo letras e números.'
      } else if (raw.includes('already') && raw.includes('registered')) {
        friendly = 'Este email já está cadastrado. Você pode enviar um convite ou redefinir a senha.'
      } else if (raw.includes('invalid') && raw.includes('key')) {
        friendly = 'Falha de autenticação do servidor. Verifique a SERVICE_ROLE_KEY no ambiente.'
      } else if (raw.includes('not allowed') || raw.includes('signups') || raw.includes('signup')) {
        friendly = 'Cadastro de usuários está desativado no projeto Supabase.'
      }
      return createErrorResponse(friendly, 400)
    }

    if (!authUser.user) {
      return createErrorResponse('Falha ao criar usuário no Supabase', 500)
    }

    const newUser = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.perfilUsuario.create({
          data: {
            userId: authUser.user.id,
            email: validatedData.email,
            nome: validatedData.nome,
            role: validatedData.role
          }
        })
      })
    })

    return createSuccessResponse({
      message: 'Usuário criado com sucesso',
      user: newUser
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return createErrorResponse('Erro interno do servidor', 500)
  }
})
