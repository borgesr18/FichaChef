import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { insumoSchema } from '@/lib/validations'
import { 
  authenticateUser, 
  createUnauthorizedResponse, 
  createValidationErrorResponse, 
  createSuccessResponse 
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const insumos = await prisma.insumo.findMany({
    where: { userId: user.id },
    include: {
      categoria: true,
      unidadeCompra: true,
    },
    orderBy: { nome: 'asc' },
  })

  return createSuccessResponse(insumos)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const body = await request.json()
  const parsedBody = insumoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const insumo = await prisma.insumo.create({
    data: {
      ...data,
      userId: user.id,
    },
    include: {
      categoria: true,
      unidadeCompra: true,
    },
  })

  return createSuccessResponse(insumo, 201)
})
