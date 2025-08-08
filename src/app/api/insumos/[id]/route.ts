import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createNotFoundResponse
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction, extractRequestMetadata } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { insumoSchema } from '@/lib/validations'

export const PUT = withErrorHandler(async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  const user = auth.user!

  const requestMeta = extractRequestMetadata(request)
  const body = await request.json()
  const parsedBody = insumoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const existing = await withDatabaseRetry(async () => {
    return await prisma.insumo.findFirst({ where: { id, userId: user.id } })
  })
  if (!existing) {
    return createNotFoundResponse('Insumo')
  }

  const insumo = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.update({
        where: { id },
        data: {
          ...data
        }
      })
    })
  })

  await logUserAction(user.id, 'update', 'insumos', id, 'insumo', data, requestMeta)

  return createSuccessResponse(insumo)
})

export const DELETE = withErrorHandler(async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  const user = auth.user!

  const requestMeta = extractRequestMetadata(request)

  const existing = await withDatabaseRetry(async () => {
    return await prisma.insumo.findFirst({ where: { id, userId: user.id } })
  })
  if (!existing) {
    return createNotFoundResponse('Insumo')
  }

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.delete({
        where: { id }
      })
    })
  })

  await logUserAction(user.id, 'delete', 'insumos', id, 'insumo', {}, requestMeta)

  return createSuccessResponse({ message: 'Insumo excluído com sucesso' })
})
