import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry } from '@/lib/database-utils'
import { authenticateWithPermission, createSuccessResponse, createErrorResponse } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  role: z.enum(['chef', 'cozinheiro', 'gerente'])
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  await authenticateWithPermission('usuarios', 'admin')

  const body = await request.json()
  const validatedData = createUserSchema.parse(body)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const isDevMode = !supabaseUrl || !supabaseKey || 
                    supabaseUrl === '' || supabaseKey === '' ||
                    supabaseUrl.includes('placeholder') || 
                    supabaseKey.includes('placeholder')

  if (isDevMode) {
    const mockUserId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newUser = await withDatabaseRetry(async () => {
      return await prisma.perfilUsuario.create({
        data: {
          userId: mockUserId,
          email: validatedData.email,
          nome: validatedData.nome,
          role: validatedData.role
        }
      })
    })

    return createSuccessResponse({
      message: 'Usuário criado com sucesso (modo desenvolvimento)',
      user: newUser
    })
  }

  try {
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true
    })

    if (authError) {
      return createErrorResponse(authError.message, 400)
    }

    if (!authUser.user) {
      return createErrorResponse('Falha ao criar usuário no Supabase', 500)
    }

    const newUser = await withDatabaseRetry(async () => {
      return await prisma.perfilUsuario.create({
        data: {
          userId: authUser.user.id,
          email: validatedData.email,
          nome: validatedData.nome,
          role: validatedData.role
        }
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
