import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  authenticateUser, 
  createUnauthorizedResponse, 
  createValidationErrorResponse, 
  createSuccessResponse 
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { categoriaSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const categorias = await prisma.categoriaInsumo.findMany({
    where: { userId: user.id },
    orderBy: { nome: 'asc' },
  })

  return createSuccessResponse(categorias)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const body = await request.json()
  const parsedBody = categoriaSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const { nome, descricao } = parsedBody.data

  const categoria = await prisma.categoriaInsumo.create({
    data: {
      nome,
      descricao,
      userId: user.id,
    },
  })

  return createSuccessResponse(categoria, 201)
})
