import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry } from '@/lib/database-utils'
import { fornecedorPrecoSchema } from '@/lib/validations'
import { 
  authenticateWithPermission, 
  createValidationErrorResponse, 
  createSuccessResponse 
} from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const user = await authenticateWithPermission('fornecedores', 'read')

  const { searchParams } = new URL(request.url)
  const insumoId = searchParams.get('insumoId')
  const fornecedorId = searchParams.get('fornecedorId')

  const where: { userId: string; insumoId?: string; fornecedorId?: string } = { userId: user.id }
  if (insumoId) where.insumoId = insumoId
  if (fornecedorId) where.fornecedorId = fornecedorId

  const precos = await withDatabaseRetry(async () => {
    return await prisma.fornecedorPreco.findMany({
      where,
      include: {
        fornecedor: true,
        insumo: true,
      },
      orderBy: { dataVigencia: 'desc' },
    })
  })

  return createSuccessResponse(precos)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateWithPermission('fornecedores', 'write')

  const body = await request.json()
  const parsedBody = fornecedorPrecoSchema.safeParse({
    ...body,
    dataVigencia: new Date(body.dataVigencia)
  })

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  await withDatabaseRetry(async () => {
    return await prisma.fornecedorPreco.updateMany({
      where: {
        fornecedorId: data.fornecedorId,
        insumoId: data.insumoId,
        userId: user.id,
        ativo: true
      },
      data: { ativo: false }
    })
  })

  const preco = await withDatabaseRetry(async () => {
    return await prisma.fornecedorPreco.create({
      data: {
        ...data,
        userId: user.id,
      },
      include: {
        fornecedor: true,
        insumo: true,
      },
    })
  })

  await logUserAction(user.id, 'create', 'fornecedores', preco.id, 'fornecedor_preco', data, request)

  return createSuccessResponse(preco, 201)
})
