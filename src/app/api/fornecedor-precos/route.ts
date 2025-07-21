import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fornecedorPrecoSchema } from '@/lib/validations'
import { 
  authenticateUser, 
  createUnauthorizedResponse, 
  createValidationErrorResponse, 
  createSuccessResponse 
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const { searchParams } = new URL(request.url)
  const insumoId = searchParams.get('insumoId')
  const fornecedorId = searchParams.get('fornecedorId')

  const where: { userId: string; insumoId?: string; fornecedorId?: string } = { userId: user.id }
  if (insumoId) where.insumoId = insumoId
  if (fornecedorId) where.fornecedorId = fornecedorId

  const precos = await prisma.fornecedorPreco.findMany({
    where,
    include: {
      fornecedor: true,
      insumo: true,
    },
    orderBy: { dataVigencia: 'desc' },
  })

  return createSuccessResponse(precos)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const body = await request.json()
  const parsedBody = fornecedorPrecoSchema.safeParse({
    ...body,
    dataVigencia: new Date(body.dataVigencia)
  })

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  await prisma.fornecedorPreco.updateMany({
    where: {
      fornecedorId: data.fornecedorId,
      insumoId: data.insumoId,
      userId: user.id,
      ativo: true
    },
    data: { ativo: false }
  })

  const preco = await prisma.fornecedorPreco.create({
    data: {
      ...data,
      userId: user.id,
    },
    include: {
      fornecedor: true,
      insumo: true,
    },
  })

  return createSuccessResponse(preco, 201)
})
