import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
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
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const { id } = await params

  const body = await request.json()
  const validatedData = updateUserSchema.parse(body)

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
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const { id } = await params

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const isDevMode = !supabaseUrl || !supabaseServiceKey || 
                    supabaseUrl === '' || supabaseServiceKey === '' ||
                    supabaseUrl.includes('placeholder') || 
                    supabaseServiceKey.includes('placeholder')

  try {
    await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.perfilUsuario.delete({
          where: { userId: id }
        })
      })
    })

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
