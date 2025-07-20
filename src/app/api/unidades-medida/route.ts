import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  authenticateUser,
  createUnauthorizedResponse,
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { unidadeMedidaSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const unidades = await prisma.unidadeMedida.findMany({
    where: { userId: user.id },
    orderBy: { nome: 'asc' },
  })

  return createSuccessResponse(unidades)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const body = await request.json()
  const parsedBody = unidadeMedidaSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const unidade = await prisma.unidadeMedida.create({
    data: {
      ...data,
      userId: user.id,
    },
  })

  return createSuccessResponse(unidade, 201)
})

