import { createSuccessResponse } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'

export const GET = withErrorHandler(async function GET() {
  const stats = {
    totalUsers: 1,
    performanceChange: 0,
    revenue: 0,
    stockItems: 0,
    profitMargin: 0,
    activeAlerts: 0,
    favoriteRecipes: 0,
    avgPrepTime: 0
  }

  return createSuccessResponse(stats)
})
