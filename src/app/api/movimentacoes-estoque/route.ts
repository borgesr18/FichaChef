import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  authenticateUser,
  createUnauthorizedResponse,
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { movimentacaoEstoqueSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const movimentacoes = await prisma.movimentacaoEstoque.findMany({
    where: { userId: user.id },
    include: {
      insumo: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return createSuccessResponse(movimentacoes)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const body = await request.json()
  const parsedBody = movimentacaoEstoqueSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const movimentacao = await prisma.movimentacaoEstoque.create({
    data: {
      ...data,
      userId: user.id,
    },
    include: {
      insumo: true,
    },
  })

  return createSuccessResponse(movimentacao, 201)
})
