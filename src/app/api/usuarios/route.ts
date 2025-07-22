import { prisma } from '@/lib/prisma'
import { authenticateWithPermission, createSuccessResponse } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'

export const GET = withErrorHandler(async function GET() {
  await authenticateWithPermission('usuarios', 'read')

  const usuarios = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.perfilUsuario.findMany({
        orderBy: { createdAt: 'desc' }
      })
    })
  })

  return createSuccessResponse(usuarios)
})
