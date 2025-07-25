import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { 
  createValidationErrorResponse,
  createSuccessResponse 
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { withErrorHandler } from '@/lib/api-helpers'
import { withTempUserHandling } from '@/lib/temp-user-utils'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  return withTempUserHandling(user.id, 'notificacoes', async () => {
    const { searchParams } = new URL(request.url)
    const lida = searchParams.get('lida')

    const where: { userId: string; lida?: boolean } = { userId: user.id }
    if (lida !== null) where.lida = lida === 'true'

    const notificacoes = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.notificacao.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 50,
        })
      })
    })

    return createSuccessResponse(notificacoes)
  })
})

export const PUT = withErrorHandler(async function PUT(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const body = await request.json()
  const { ids, lida } = body

  if (!Array.isArray(ids) || typeof lida !== 'boolean') {
    return createValidationErrorResponse('IDs devem ser um array e lida deve ser boolean')
  }

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.notificacao.updateMany({
        where: {
          id: { in: ids },
          userId: user.id
        },
        data: { lida }
      })
    })
  })

  const { logUserAction } = await import('@/lib/permissions')
  await logUserAction(user.id, 'update', 'alertas', undefined, 'notificacao', { ids, lida }, request)

  return createSuccessResponse({ message: 'Notificações atualizadas com sucesso' })
})
