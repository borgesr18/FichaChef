import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createForbiddenResponse, authenticateWithPermission } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { authenticateUser } from '@/lib/auth'

export const GET = withErrorHandler(async function GET() {
  // Override rápido: admin conhecido pode acessar
  const baseUser = await authenticateUser()
  if (baseUser?.email === 'rba1807@gmail.com') {
    // ok
  } else {
    try {
      await authenticateWithPermission('usuarios', 'read')
    } catch {
      return createForbiddenResponse('Acesso negado')
    }
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
