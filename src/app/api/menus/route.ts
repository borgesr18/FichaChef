import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  authenticateUser,
  createUnauthorizedResponse,
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { menuSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const menus = await prisma.menu.findMany({
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

  return createSuccessResponse(menus)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const body = await request.json()
  const parsedBody = menuSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const menu = await prisma.menu.create({
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

  return createSuccessResponse(menu, 201)
})
