import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry } from '@/lib/database-utils'
import {
  authenticateWithPermission,
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { produtoSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateWithPermission('produtos', 'read')

  const produtos = await withDatabaseRetry(async () => {
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

  return createSuccessResponse(produtos)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateWithPermission('produtos', 'write')

  const body = await request.json()
  const parsedBody = produtoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const produto = await withDatabaseRetry(async () => {
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

  await logUserAction(user.id, 'create', 'produtos', produto.id, 'produto', { nome: data.nome }, request)

  return createSuccessResponse(produto, 201)
})

