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

export const PUT = withErrorHandler(async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const produto = await prisma.produto.update({
    where: { id, userId: user.id },
    data: {
      nome: data.nome,
      precoVenda: data.precoVenda,
      margemLucro: data.margemLucro,
      produtoFichas: {
        deleteMany: {},
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

  return createSuccessResponse(produto)
})

export const DELETE = withErrorHandler(async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  await prisma.produto.delete({
    where: { id, userId: user.id },
  })

  return createSuccessResponse({ message: 'Produto excluído com sucesso' })
})
