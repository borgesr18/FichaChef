import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createNotFoundResponse,
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { withErrorHandler } from '@/lib/api-helpers'
import { menuSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  const user = auth.user!

  const menu = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.menu.findFirst({
        where: { id, userId: user.id },
        include: {
          itens: {
            include: {
              produto: {
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
              }
            }
          },
          periodos: true
        }
      })
    })
  })

  if (!menu) {
    return createNotFoundResponse()
  }

  return createSuccessResponse(menu)
})

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
  const parsedBody = menuSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const existingMenu = await withDatabaseRetry(async () => {
    return await prisma.menu.findFirst({
      where: { id, userId: user.id }
    })
  })

  if (!existingMenu) {
    return createNotFoundResponse()
  }

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.menuItem.deleteMany({
        where: { menuId: id }
      })
    })
  })

  const menu = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.menu.update({
        where: { id },
        data: {
          nome: data.nome,
          descricao: data.descricao,
          tipo: data.tipo,
          ativo: data.ativo,
          itens: {
            create: data.itens.map(item => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              observacoes: item.observacoes
            }))
          }
        },
        include: {
          itens: {
            include: {
              produto: {
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
              }
            }
          },
          periodos: true
        }
      })
    })
  })

  const { logUserAction } = await import('@/lib/permissions')
  await logUserAction(user.id, 'update', 'cardapios', id, 'menu', { nome: data.nome }, request)

  return createSuccessResponse(menu)
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

  const existingMenu = await withDatabaseRetry(async () => {
    return await prisma.menu.findFirst({
      where: { id, userId: user.id }
    })
  })

  if (!existingMenu) {
    return createNotFoundResponse()
  }

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.menu.delete({
        where: { id }
      })
    })
  })

  return createSuccessResponse({ message: 'Menu excluído com sucesso' })
})
