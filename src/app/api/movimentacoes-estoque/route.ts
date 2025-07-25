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
import { movimentacaoEstoqueSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const movimentacoes = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.movimentacaoEstoque.findMany({
        where: { user_id: user.id },
        include: {
          insumo: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  return createSuccessResponse(movimentacoes)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const body = await request.json()
  const parsedBody = movimentacaoEstoqueSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const movimentacao = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.movimentacaoEstoque.create({
        data: {
          ...data,
          user_id: user.id,
        },
        include: {
          insumo: true,
        },
      })
    })
  })

  await logUserAction(
    user.id,
    'create',
    'estoque',
    movimentacao.id,
    'movimentacao',
    { tipo: data.tipo, quantidade: data.quantidade, motivo: data.motivo },
    request
  )

  return createSuccessResponse(movimentacao, 201)
})
