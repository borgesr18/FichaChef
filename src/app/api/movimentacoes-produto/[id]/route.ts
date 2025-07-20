import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  authenticateUser,
  createUnauthorizedResponse,
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { movimentacaoProdutoSchema } from '@/lib/validations'

export const PUT = withErrorHandler(async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const body = await request.json()
  const parsedBody = movimentacaoProdutoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const movimentacao = await prisma.movimentacaoProduto.update({
    where: { id, userId: user.id },
    data: {
      ...data,
    },
    include: {
      produto: true,
    },
  })

  return createSuccessResponse(movimentacao)
})

export const DELETE = withErrorHandler(async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  await prisma.movimentacaoProduto.delete({
    where: { id, userId: user.id },
  })

  return createSuccessResponse({ message: 'Movimentação de produto excluída com sucesso' })
})
