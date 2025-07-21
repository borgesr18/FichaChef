import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUserWithProfile, createUnauthorizedResponse, createSuccessResponse } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { z } from 'zod'

const perfilSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido').optional(),
  role: z.enum(['chef', 'cozinheiro', 'gerente']).optional()
})

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateUserWithProfile()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const perfil = await prisma.perfilUsuario.findUnique({
    where: { userId: user.id }
  })

  return createSuccessResponse(perfil)
})

export const PUT = withErrorHandler(async function PUT(request: NextRequest) {
  const user = await authenticateUserWithProfile()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const body = await request.json()
  const validatedData = perfilSchema.parse(body)

  if (validatedData.role && user.role !== 'chef') {
    delete validatedData.role
  }

  const perfil = await prisma.perfilUsuario.update({
    where: { userId: user.id },
    data: validatedData
  })

  return createSuccessResponse(perfil)
})
