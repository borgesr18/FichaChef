import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import {
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { produtoSchema } from '@/lib/validations'

export const PUT = withErrorHandler(async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const body = await request.json()
  const parsedBody = produtoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const produto = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.produto.update({
        where: { id, user_id: user.id },
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

  await logUserAction(user.id, 'update', 'produtos', id, 'produto', { nome: data.nome }, request)

  return createSuccessResponse(produto)
})

export const DELETE = withErrorHandler(async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.produto.delete({
        where: { id, user_id: user.id },
      })
    })
  })

  await logUserAction(user.id, 'delete', 'produtos', id, 'produto', {}, request)

  return createSuccessResponse({ message: 'Produto excluído com sucesso' })
})
