import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry } from '@/lib/database-utils'
import {
  authenticateWithPermission,
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { movimentacaoProdutoSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateWithPermission('estoque', 'read')

  const movimentacoes = await withDatabaseRetry(async () => {
    return await prisma.movimentacaoProduto.findMany({
      where: { userId: user.id },
      include: {
        produto: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  return createSuccessResponse(movimentacoes)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateWithPermission('estoque', 'write')

  const body = await request.json()
  const parsedBody = movimentacaoProdutoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const movimentacao = await withDatabaseRetry(async () => {
    return await prisma.movimentacaoProduto.create({
      data: {
        ...data,
        userId: user.id,
      },
      include: {
        produto: true,
      },
    })
  })

  await logUserAction(
    user.id,
    'create',
    'estoque',
    movimentacao.id,
    'movimentacao_produto',
    { tipo: data.tipo, quantidade: data.quantidade, motivo: data.motivo },
    request
  )

  return createSuccessResponse(movimentacao, 201)
})
