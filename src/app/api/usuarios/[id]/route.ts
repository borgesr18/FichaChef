import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateWithPermission, createSuccessResponse } from '@/lib/auth'
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
