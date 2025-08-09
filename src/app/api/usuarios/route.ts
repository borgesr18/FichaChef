import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createForbiddenResponse, authenticateWithPermission } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'

export const GET = withErrorHandler(async function GET() {
  try {
    await authenticateWithPermission('usuarios', 'read')
  } catch {
    return createForbiddenResponse('Acesso negado')
  }

  const usuarios = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.perfilUsuario.findMany({
        orderBy: { createdAt: 'desc' }
      })
    })
  })

  return createSuccessResponse(usuarios)
})
