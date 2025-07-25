import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { 
  createValidationErrorResponse, 
  createSuccessResponse 
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { withErrorHandler } from '@/lib/api-helpers'
import { fichaTecnicaSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const fichas = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.fichaTecnica.findMany({
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
    })
  })

  return createSuccessResponse(fichas)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

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

  const novaFicha = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.fichaTecnica.create({
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
    })
  })

  const { logUserAction } = await import('@/lib/permissions')
  await logUserAction(
    user.id,
    'create',
    'fichas-tecnicas',
    novaFicha.id,
    'FichaTecnica',
    { nome: novaFicha.nome },
    request
  )

  return createSuccessResponse(novaFicha, 201)
})

