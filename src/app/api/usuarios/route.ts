import { prisma } from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { withErrorHandler } from '@/lib/api-helpers'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { NextRequest } from 'next/server'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }

  const usuarios = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.perfis_usuarios.findMany({
        orderBy: { createdAt: 'desc' }
      })
    })
  })

  return createSuccessResponse(usuarios)
})
