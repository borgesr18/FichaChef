import { NextRequest } from 'next/server'
import { createSuccessResponse } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const preferences = await request.json()
  
  return createSuccessResponse({
    message: 'Preferências salvas com sucesso',
    preferences
  })
})

export const GET = withErrorHandler(async function GET() {
  return createSuccessResponse({})
})
