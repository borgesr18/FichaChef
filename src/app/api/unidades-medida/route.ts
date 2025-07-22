import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import {
  authenticateWithPermission,
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { unidadeMedidaSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateWithPermission('insumos', 'read')

  const unidades = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.unidadeMedida.findMany({
        where: { userId: user.id },
        orderBy: { nome: 'asc' },
      })
    })
  })

  return createSuccessResponse(unidades)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateWithPermission('insumos', 'write')

  const body = await request.json()
  const parsedBody = unidadeMedidaSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const unidade = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.unidadeMedida.create({
        data: {
          ...data,
          userId: user.id,
        },
      })
    })
  })

  await logUserAction(user.id, 'create', 'unidades-medida', unidade.id, 'UnidadeMedida', data, request)

  return createSuccessResponse(unidade, 201)
})

