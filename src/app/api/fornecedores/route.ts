import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fornecedorSchema } from '@/lib/validations'
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

  const fornecedores = await prisma.fornecedor.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { insumos: true, precos: true }
      }
    },
    orderBy: { nome: 'asc' },
  })

  return createSuccessResponse(fornecedores)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const body = await request.json()
  const parsedBody = fornecedorSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const fornecedor = await prisma.fornecedor.create({
    data: {
      ...data,
      userId: user.id,
    },
    include: {
      _count: {
        select: { insumos: true, precos: true }
      }
    },
  })

  return createSuccessResponse(fornecedor, 201)
})
