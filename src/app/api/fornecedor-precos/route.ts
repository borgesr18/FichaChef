import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { fornecedorPrecoSchema } from '@/lib/validations'
import { 
  createValidationErrorResponse, 
  createSuccessResponse 
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const { searchParams } = new URL(request.url)
  const insumoId = searchParams.get('insumoId')
  const fornecedorId = searchParams.get('fornecedorId')

  const where: { user_id: string; insumoId?: string; fornecedorId?: string } = { user_id: user.id }
  if (insumoId) where.insumoId = insumoId
  if (fornecedorId) where.fornecedorId = fornecedorId

  const precos = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.fornecedorPreco.findMany({
        where,
        include: {
          fornecedor: true,
          insumo: true,
        },
        orderBy: { dataVigencia: 'desc' },
      })
    })
  })

  return createSuccessResponse(precos)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const body = await request.json()
  const parsedBody = fornecedorPrecoSchema.safeParse({
    ...body,
    dataVigencia: new Date(body.dataVigencia)
  })

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.fornecedorPreco.updateMany({
        where: {
          fornecedorId: data.fornecedorId,
          insumoId: data.insumoId,
          user_id: user.id,
          ativo: true
        },
        data: { ativo: false }
      })
    })
  })

  const preco = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.fornecedorPreco.create({
        data: {
          ...data,
          user_id: user.id,
        },
        include: {
          fornecedor: true,
          insumo: true,
        },
      })
    })
  })

  await logUserAction(user.id, 'create', 'fornecedores', preco.id, 'fornecedor_preco', data, request)

  return createSuccessResponse(preco, 201)
})
