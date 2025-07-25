import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import {
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { withErrorHandler } from '@/lib/api-helpers'
import { menuSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const menus = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.menu.findMany({
        where: { userId: user.id },
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
        },
        orderBy: { nome: 'asc' },
      })
    })
  })

  return createSuccessResponse(menus)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
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

  const menu = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.menu.create({
        data: {
          nome: data.nome,
          descricao: data.descricao,
          tipo: data.tipo,
          ativo: data.ativo,
          userId: user.id,
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
  await logUserAction(user.id, 'create', 'cardapios', menu.id, 'menu', { nome: menu.nome }, request)

  return createSuccessResponse(menu, 201)
})
