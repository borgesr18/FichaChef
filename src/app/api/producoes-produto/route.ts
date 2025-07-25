import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import {
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { producaoProdutoSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const producoes = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.producaoProduto.findMany({
        where: { userId: user.id },
        include: {
          produto: true,
        },
        orderBy: { dataProducao: 'desc' },
      })
    })
  })

  return createSuccessResponse(producoes)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

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
      return await prisma.producaoProduto.create({
        data: {
          ...data,
          userId: user.id,
        },
        include: {
          produto: true,
        },
      })
    })
  })

  await logUserAction(user.id, 'create', 'producao', producao.id, 'producao_produto', data, request)

  return createSuccessResponse(producao, 201)
})
