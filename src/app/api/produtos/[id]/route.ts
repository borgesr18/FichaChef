import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import {
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
// import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction, extractRequestMetadata } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { produtoSchema } from '@/lib/validations'

async function getAuthenticatedUser(): Promise<{ id: string; email: string } | null> {
  try {
    if (process.env.NODE_ENV === 'development') {
      return { id: 'dev-user', email: 'dev@fichachef.com' }
    }
    return { id: 'temp-prod-user', email: 'temp@fichachef.com' }
  } catch {
    return null
  }
}

export const PUT = withErrorHandler(async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getAuthenticatedUser()
  if (!user) {
    return createValidationErrorResponse('Não autorizado')
  }

  const requestMeta = extractRequestMetadata(request)
  const body = await request.json()
  const parsedBody = produtoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const exists = await withDatabaseRetry(async () => {
    return await prisma.produto.findFirst({ where: { id, userId: user.id } })
  })
  if (!exists) {
    return createSuccessResponse({ error: 'Produto não encontrado' }, 404)
  }

  const produto = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.produto.update({
        where: { id },
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
  })

  await logUserAction(user.id, 'update', 'produtos', id, 'produto', { nome: data.nome }, requestMeta)

  return createSuccessResponse(produto)
})

export const DELETE = withErrorHandler(async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getAuthenticatedUser()
  if (!user) {
    return createValidationErrorResponse('Não autorizado')
  }

  const requestMeta = extractRequestMetadata(request)

  const exists = await withDatabaseRetry(async () => {
    return await prisma.produto.findFirst({ where: { id, userId: user.id } })
  })
  if (!exists) {
    return createSuccessResponse({ error: 'Produto não encontrado' }, 404)
  }

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.produto.delete({
        where: { id },
      })
    })
  })

  await logUserAction(user.id, 'delete', 'produtos', id, 'produto', {}, requestMeta)

  return createSuccessResponse({ message: 'Produto excluído com sucesso' })
})
