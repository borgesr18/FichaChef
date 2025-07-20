import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  authenticateUser,
  createUnauthorizedResponse,
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { producaoSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const producoes = await prisma.producao.findMany({
    where: { userId: user.id },
    include: {
      fichaTecnica: true,
    },
    orderBy: { dataProducao: 'desc' },
  })

  return createSuccessResponse(producoes)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const body = await request.json()
  const parsedBody = producaoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const producao = await prisma.producao.create({
    data: {
      ...data,
      userId: user.id,
    },
    include: {
      fichaTecnica: true,
    },
  })

  return createSuccessResponse(producao, 201)
})

