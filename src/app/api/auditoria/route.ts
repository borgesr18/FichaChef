import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { withErrorHandler } from '@/lib/api-helpers'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }

  const { searchParams } = new URL(request.url)
  const modulo = searchParams.get('modulo')
  const acao = searchParams.get('acao')

  const where: Record<string, string> = {}
  if (modulo) where.modulo = modulo
  if (acao) where.acao = acao

  const acoes = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.auditoriaAcao.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    })
  })

  return createSuccessResponse(acoes)
})
