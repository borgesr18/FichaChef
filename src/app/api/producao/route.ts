import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  authenticateWithPermission,
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { producaoSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateWithPermission('producao', 'read')

  const producoes = await prisma.producao.findMany({
    where: { userId: user.id },
    include: {
      fichaTecnica: true,
    },
    orderBy: { dataProducao: 'desc' },
  })

  return createSuccessResponse(producoes)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateWithPermission('producao', 'write')

  const body = await request.json()
  
  const bodyWithDates = {
    ...body,
    dataProducao: body.dataProducao ? new Date(body.dataProducao) : undefined,
    dataValidade: body.dataValidade ? new Date(body.dataValidade) : undefined,
  }
  
  const parsedBody = producaoSchema.safeParse(bodyWithDates)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const producao = await prisma.producao.create({
    data: {
      ...data,
      userId: user.id,
    },
    include: {
      fichaTecnica: true,
    },
  })

  await logUserAction(user.id, 'create', 'producao', producao.id, 'producao', data, request)

  return createSuccessResponse(producao, 201)
})

