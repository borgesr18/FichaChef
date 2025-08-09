import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, createForbiddenResponse, authenticateWithPermission } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'

const updateUserSchema = z.object({
  role: z.enum(['chef', 'cozinheiro', 'gerente']).optional(),
  nome: z.string().optional(),
  email: z.string().email().optional()
})

export const PUT = withErrorHandler(async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let actingUser: { id: string } | null = null
  try {
    actingUser = await authenticateWithPermission('usuarios', 'admin')
  } catch {
    return createForbiddenResponse('Acesso negado')
  }
  
  const { id } = await params

  const body = await request.json()
  const validatedData = updateUserSchema.parse(body)

  // Verificar existência
  const exists = await withDatabaseRetry(async () => {
    return await prisma.perfilUsuario.findUnique({ where: { userId: id } })
  })
  if (!exists) {
    return createErrorResponse('Usuário não encontrado', 404)
  }

  // Salvaguardas de role
  if (validatedData.role && exists.role === 'chef' && validatedData.role !== 'chef') {
    const chefs = await prisma.perfilUsuario.count({ where: { role: 'chef' } })
    if (chefs <= 1) {
      return createErrorResponse('Não é possível remover o último chef', 400)
    }
    if (actingUser && actingUser.id === id) {
      return createErrorResponse('Não é possível rebaixar seu próprio usuário', 400)
    }
  }

  const updatedUser = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.perfilUsuario.update({
        where: { userId: id },
        data: validatedData
      })
    })
  })

  return createSuccessResponse(updatedUser)
})

export const DELETE = withErrorHandler(async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let actingUser: { id: string } | null = null
  try {
    actingUser = await authenticateWithPermission('usuarios', 'admin')
  } catch {
    return createForbiddenResponse('Acesso negado')
  }
  
  const { id } = await params

  try {
    // Verificar existência
    const exists = await withDatabaseRetry(async () => {
      return await prisma.perfilUsuario.findUnique({ where: { userId: id } })
    })
    if (!exists) {
      return createErrorResponse('Usuário não encontrado', 404)
    }

    // Não permitir excluir a si próprio
    if (actingUser && actingUser.id === id) {
      return createErrorResponse('Não é possível excluir o próprio usuário', 400)
    }

    // Não permitir excluir o último chef
    if (exists.role === 'chef') {
      const chefs = await prisma.perfilUsuario.count({ where: { role: 'chef' } })
      if (chefs <= 1) {
        return createErrorResponse('Não é possível excluir o último chef', 400)
      }
    }

    await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.perfilUsuario.delete({
          where: { userId: id }
        })
      })
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const isDevMode = !supabaseUrl || !supabaseServiceKey || 
                      supabaseUrl === '' || supabaseServiceKey === '' ||
                      supabaseUrl.includes('placeholder') || 
                      supabaseServiceKey.includes('placeholder')

    if (!isDevMode) {
      await supabaseAdmin.auth.admin.deleteUser(id)
    }

    return createSuccessResponse({
      message: 'Usuário excluído com sucesso'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return createErrorResponse('Erro ao excluir usuário', 500)
  }
})
