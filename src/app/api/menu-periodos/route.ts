import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  authenticateUser,
  createUnauthorizedResponse,
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { menuPeriodoSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const { searchParams } = new URL(request.url)
  const menuId = searchParams.get('menuId')

  const where = menuId ? { userId: user.id, menuId } : { userId: user.id }

  const periodos = await prisma.menuPeriodo.findMany({
    where,
    include: {
      menu: {
        include: {
          itens: {
            include: {
              produto: true
            }
          }
        }
      }
    },
    orderBy: { dataInicio: 'desc' },
  })

  return createSuccessResponse(periodos)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const body = await request.json()
  const parsedBody = menuPeriodoSchema.safeParse({
    ...body,
    dataInicio: body.dataInicio ? new Date(body.dataInicio) : undefined,
    dataFim: body.dataFim ? new Date(body.dataFim) : undefined
  })

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const periodo = await prisma.menuPeriodo.create({
    data: {
      ...data,
      userId: user.id,
    },
    include: {
      menu: {
        include: {
          itens: {
            include: {
              produto: true
            }
          }
        }
      }
    }
  })

  return createSuccessResponse(periodo, 201)
})
