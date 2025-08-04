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
import { produtoSchema } from '@/lib/validations'
import { withTempUserHandling } from '@/lib/temp-user-utils'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  return withTempUserHandling(user.id, 'produtos', async () => {
    const produtos = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.produto.findMany({
          where: { userId: user.id },
          include: {
            produtoFichas: {
              include: {
                fichaTecnica: {
                  include: {
                    ingredientes: {
                      include: {
                        insumo: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { nome: 'asc' },
        })
      })
    })

    return createSuccessResponse(produtos)
  })
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const requestMeta = extractRequestMetadata(request)
  const body = await request.json()
  const parsedBody = produtoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const produto = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.produto.create({
        data: {
          nome: data.nome,
          precoVenda: data.precoVenda,
          margemLucro: data.margemLucro,
          userId: user.id,
          produtoFichas: {
            create: data.fichas.map(ficha => ({
              fichaTecnicaId: ficha.fichaTecnicaId,
              quantidadeGramas: ficha.quantidadeGramas
            }))
          }
        },
        include: {
          produtoFichas: {
            include: {
              fichaTecnica: {
                include: {
                  ingredientes: {
                    include: {
                      insumo: true
                    }
                  }
                }
              }
            }
          }
        }
      })
    })
  })

  await logUserAction(user.id, 'create', 'produtos', produto.id, 'produto', { nome: data.nome }, requestMeta)

  return createSuccessResponse(produto, 201)
})

