import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry } from '@/lib/database-utils'
import { 
  authenticateWithPermission, 
  createValidationErrorResponse,
  createSuccessResponse 
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const user = await authenticateWithPermission('alertas', 'read')

  const { searchParams } = new URL(request.url)
  const lida = searchParams.get('lida')

  const where: { userId: string; lida?: boolean } = { userId: user.id }
  if (lida !== null) where.lida = lida === 'true'

  const notificacoes = await withDatabaseRetry(async () => {
    return await prisma.notificacao.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  })

  return createSuccessResponse(notificacoes)
})

export const PUT = withErrorHandler(async function PUT(request: NextRequest) {
  const user = await authenticateWithPermission('alertas', 'write')

  const body = await request.json()
  const { ids, lida } = body

  if (!Array.isArray(ids) || typeof lida !== 'boolean') {
    return createValidationErrorResponse('IDs devem ser um array e lida deve ser boolean')
  }

  await withDatabaseRetry(async () => {
    return await prisma.notificacao.updateMany({
      where: {
        id: { in: ids },
        userId: user.id
      },
      data: { lida }
    })
  })

  const { logUserAction } = await import('@/lib/permissions')
  await logUserAction(user.id, 'update', 'alertas', undefined, 'notificacao', { ids, lida }, request)

  return createSuccessResponse({ message: 'Notificações atualizadas com sucesso' })
})
