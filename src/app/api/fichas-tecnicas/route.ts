import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  authenticateUser, 
  createUnauthorizedResponse, 
  createValidationErrorResponse, 
  createSuccessResponse 
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { fichaTecnicaSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const fichas = await prisma.fichaTecnica.findMany({
    where: { userId: user.id },
    include: {
      categoria: true,
      ingredientes: {
        include: {
          insumo: true,
        },
      },
    },
    orderBy: { nome: 'asc' },
  })

  return createSuccessResponse(fichas)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const body = await request.json()
  const parsedBody = fichaTecnicaSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const {
    nome,
    categoriaId,
    pesoFinalGramas,
    numeroPorcoes,
    tempoPreparo,
    temperaturaForno,
    modoPreparo,
    nivelDificuldade,
    ingredientes
  } = parsedBody.data

  const novaFicha = await prisma.fichaTecnica.create({
    data: {
      nome,
      categoriaId,
      pesoFinalGramas,
      numeroPorcoes,
      tempoPreparo,
      temperaturaForno,
      modoPreparo,
      nivelDificuldade,
      userId: user.id,
      ingredientes: {
        create: ingredientes?.map(ing => ({
          insumoId: ing.insumoId,
          quantidadeGramas: ing.quantidadeGramas,
        })),
      },
    },
    include: {
      categoria: true,
      ingredientes: {
        include: {
          insumo: true,
        },
      },
    },
  })

  return createSuccessResponse(novaFicha, 201)
})

