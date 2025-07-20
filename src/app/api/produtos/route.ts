import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  authenticateUser,
  createUnauthorizedResponse,
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { produtoSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const produtos = await prisma.produto.findMany({
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

  return createSuccessResponse(produtos)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const body = await request.json()
  const parsedBody = produtoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const produto = await prisma.produto.create({
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

  return createSuccessResponse(produto, 201)
})

