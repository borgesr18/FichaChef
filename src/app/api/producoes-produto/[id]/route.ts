import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import {
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { withErrorHandler } from '@/lib/api-helpers'
import { producaoProdutoSchema } from '@/lib/validations'
import { logUserAction, extractRequestMetadata } from '@/lib/permissions'

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

  const requestMeta = extractRequestMetadata(request)
  const body = await request.json()
  
  const bodyWithDates = {
    ...body,
    dataProducao: body.dataProducao ? new Date(body.dataProducao) : undefined,
    dataValidade: body.dataValidade ? new Date(body.dataValidade) : undefined,
  }
  
  const parsedBody = producaoProdutoSchema.safeParse(bodyWithDates)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const producao = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.producaoProduto.update({
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

  await logUserAction(user.id, 'update', 'producao', id, 'producao-produto', data, requestMeta)

  return createSuccessResponse(producao)
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

  const requestMeta = extractRequestMetadata(request)

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.producaoProduto.delete({
        where: { id, userId: user.id },
      })
    })
  })

  await logUserAction(user.id, 'delete', 'producao', id, 'producao-produto', undefined, requestMeta)

  return createSuccessResponse({ message: 'Produção de produto excluída com sucesso' })
})
