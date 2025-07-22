import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateWithPermission, createSuccessResponse } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { withDatabaseRetry } from '@/lib/database-utils'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  await authenticateWithPermission('auditoria', 'read')

  const { searchParams } = new URL(request.url)
  const modulo = searchParams.get('modulo')
  const acao = searchParams.get('acao')

  const where: Record<string, string> = {}
  if (modulo) where.modulo = modulo
  if (acao) where.acao = acao

  const acoes = await withDatabaseRetry(async () => {
    return await prisma.auditoriaAcao.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  })

  return createSuccessResponse(acoes)
})
