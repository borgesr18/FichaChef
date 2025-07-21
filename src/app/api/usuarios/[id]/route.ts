import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateWithPermission, createSuccessResponse, createErrorResponse } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { z } from 'zod'

const updateUserSchema = z.object({
  role: z.enum(['chef', 'cozinheiro', 'gerente']).optional(),
  nome: z.string().optional(),
  email: z.string().email().optional()
})

export const PUT = withErrorHandler(async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await authenticateWithPermission('usuarios', 'write')
  const { id } = await params

  const body = await request.json()
  const validatedData = updateUserSchema.parse(body)

  const updatedUser = await prisma.perfilUsuario.update({
    where: { userId: id },
    data: validatedData
  })

  return createSuccessResponse(updatedUser)
})

export const DELETE = withErrorHandler(async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await authenticateWithPermission('usuarios', 'admin')
  const { id } = await params

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const isDevMode = !supabaseUrl || !supabaseKey || 
                    supabaseUrl === '' || supabaseKey === '' ||
                    supabaseUrl.includes('placeholder') || 
                    supabaseKey.includes('placeholder')

  try {
    await prisma.perfilUsuario.delete({
      where: { userId: id }
    })

    if (!isDevMode) {
      const { supabase } = await import('@/lib/supabase')
      await supabase.auth.admin.deleteUser(id)
    }

    return createSuccessResponse({
      message: 'Usuário excluído com sucesso'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return createErrorResponse('Erro ao excluir usuário', 500)
  }
})
