import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  authenticateUser, 
  createUnauthorizedResponse, 
  createValidationErrorResponse,
  createSuccessResponse 
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const { searchParams } = new URL(request.url)
  const lida = searchParams.get('lida')

  const where: { userId: string; lida?: boolean } = { userId: user.id }
  if (lida !== null) where.lida = lida === 'true'

  const notificacoes = await prisma.notificacao.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return createSuccessResponse(notificacoes)
})

export const PUT = withErrorHandler(async function PUT(request: NextRequest) {
  const user = await authenticateUser()
  if (!user) {
    return createUnauthorizedResponse()
  }

  const body = await request.json()
  const { ids, lida } = body

  if (!Array.isArray(ids) || typeof lida !== 'boolean') {
    return createValidationErrorResponse('IDs devem ser um array e lida deve ser boolean')
  }

  await prisma.notificacao.updateMany({
    where: {
      id: { in: ids },
      userId: user.id
    },
    data: { lida }
  })

  return createSuccessResponse({ message: 'Notificações atualizadas com sucesso' })
})
