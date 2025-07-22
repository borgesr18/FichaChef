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

export const PUT = withErrorHandler(async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await authenticateWithPermission('produtos', 'write')

  const body = await request.json()
  const parsedBody = produtoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const produto = await withDatabaseRetry(async () => {
    return await prisma.produto.update({
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
  })

  await logUserAction(user.id, 'update', 'produtos', id, 'produto', { nome: data.nome }, request)

  return createSuccessResponse(produto)
})

export const DELETE = withErrorHandler(async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await authenticateWithPermission('produtos', 'admin')

  await withDatabaseRetry(async () => {
    return await prisma.produto.delete({
      where: { id, userId: user.id },
    })
  })

  await logUserAction(user.id, 'delete', 'produtos', id, 'produto', {}, request)

  return createSuccessResponse({ message: 'Produto excluído com sucesso' })
})
