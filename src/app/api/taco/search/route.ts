import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { createSuccessResponse } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  const tacoAlimentos = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.tacoAlimento.findMany({
        where: {
          OR: [
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 20,
        orderBy: [
          { description: 'asc' }
        ]
      })
    })
  })

  return createSuccessResponse(tacoAlimentos)
})
