import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  authenticateUser,
  createUnauthorizedResponse,
  createValidationErrorResponse,
  createSuccessResponse,
  createNotFoundResponse,
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { menuSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const menu = await prisma.menu.findFirst({
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

  const existingMenu = await prisma.menu.findFirst({
    where: { id, userId: user.id }
  })

  if (!existingMenu) {
    return createNotFoundResponse()
  }

  await prisma.menuItem.deleteMany({
    where: { menuId: id }
  })

  const menu = await prisma.menu.update({
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

  return createSuccessResponse(menu)
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

  const existingMenu = await prisma.menu.findFirst({
    where: { id, userId: user.id }
  })

  if (!existingMenu) {
    return createNotFoundResponse()
  }

  await prisma.menu.delete({
    where: { id }
  })

  return createSuccessResponse({ message: 'Menu excluído com sucesso' })
})
