import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import {
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction, extractRequestMetadata } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { movimentacaoProdutoSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const movimentacoes = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.movimentacaoProduto.findMany({
        where: { userId: user.id },
        include: {
          produto: true,
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

  const requestMeta = extractRequestMetadata(request)
  const body = await request.json()
  const parsedBody = movimentacaoProdutoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const movimentacao = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
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
  })

  await logUserAction(
    user.id,
    'create',
    'estoque',
    movimentacao.id,
    'movimentacao_produto',
    { tipo: data.tipo, quantidade: data.quantidade, motivo: data.motivo },
    requestMeta
  )

  return createSuccessResponse(movimentacao, 201)
})
