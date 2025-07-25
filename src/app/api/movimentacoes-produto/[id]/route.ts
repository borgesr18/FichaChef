import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import {
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { withErrorHandler } from '@/lib/api-helpers'
import { movimentacaoProdutoSchema } from '@/lib/validations'

export const PUT = withErrorHandler(async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  const user = auth.user!

  const body = await request.json()
  const parsedBody = movimentacaoProdutoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const movimentacao = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.movimentacaoProduto.update({
        where: { id, userId: user.id },
        data: {
          ...data,
        },
        include: {
          produto: true,
        },
      })
    })
  })

  const { logUserAction } = await import('@/lib/permissions')
  await logUserAction(user.id, 'update', 'estoque', id, 'movimentacao-produto', data, request)

  return createSuccessResponse(movimentacao)
})

export const DELETE = withErrorHandler(async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  const user = auth.user!

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.movimentacaoProduto.delete({
        where: { id, userId: user.id },
      })
    })
  })

  const { logUserAction } = await import('@/lib/permissions')
  await logUserAction(user.id, 'delete', 'estoque', id, 'movimentacao-produto', undefined, request)

  return createSuccessResponse({ message: 'Movimentação de produto excluída com sucesso' })
})
