import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import {
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { logUserAction, extractRequestMetadata } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { fichaTecnicaSchema } from '@/lib/validations'
import { withTempUserHandling } from '@/lib/temp-user-utils'

// Autenticação simples (compatível com Produtos)
async function getAuthenticatedUser(): Promise<{ id: string; email: string } | null> {
  try {
    // Sempre retorna usuário temporário para demonstração
    return { id: 'temp-prod-user', email: 'temp@fichachef.com' }
  } catch {
    return null
  }
}

export const GET = withErrorHandler(async function GET() {
  console.log('🔍 [FICHAS API] Iniciando GET /api/fichas-tecnicas')
  
  const user = await getAuthenticatedUser()
  if (!user) {
    return createValidationErrorResponse('Não autorizado')
  }

  console.log('✅ [FICHAS API] Usuário autenticado:', user.email)

  return withTempUserHandling(user.id, 'fichas-tecnicas', async () => {
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

    console.log('🔍 [FICHAS API] Fichas encontradas no banco:', fichas.length)
    return createSuccessResponse(fichas)
  })
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  console.log('🔍 [FICHAS API] Iniciando POST /api/fichas-tecnicas')
  
  const user = await getAuthenticatedUser()
  if (!user) {
    return createValidationErrorResponse('Não autorizado')
  }

  const requestMeta = extractRequestMetadata(request)
  const body = await request.json()
  const parsedBody = fichaTecnicaSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const ficha = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.fichaTecnica.create({
        data: {
          nome: data.nome,
          categoriaId: data.categoriaId,
          pesoFinalGramas: data.pesoFinalGramas,
          numeroPorcoes: data.numeroPorcoes,
          tempoPreparo: data.tempoPreparo,
          temperaturaForno: data.temperaturaForno,
          modoPreparo: data.modoPreparo,
          nivelDificuldade: data.nivelDificuldade,
          userId: user.id,
          ingredientes: {
            create: data.ingredientes.map(ing => ({
              insumoId: ing.insumoId,
              quantidadeGramas: ing.quantidadeGramas
            }))
          }
        },
        include: {
          categoria: true,
          ingredientes: {
            include: {
              insumo: true,
            },
          },
        }
      })
    })
  })

  await logUserAction(user.id, 'create', 'fichas-tecnicas', ficha.id, 'ficha-tecnica', { nome: data.nome }, requestMeta)

  return createSuccessResponse(ficha, 201)
})

