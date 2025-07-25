import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { fornecedorSchema } from '@/lib/validations'
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

  return withTempUserHandling(user.id, 'fornecedores', async () => {
    const fornecedores = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.fornecedor.findMany({
          where: { userId: user.id },
          include: {
            _count: {
              select: { insumos: true, precos: true }
            }
          },
          orderBy: { nome: 'asc' },
        })
      })
    })

    return createSuccessResponse(fornecedores)
  })
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const body = await request.json()
  const parsedBody = fornecedorSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const fornecedor = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.fornecedor.create({
        data: {
          ...data,
          userId: user.id,
        },
        include: {
          _count: {
            select: { insumos: true, precos: true }
          }
        },
      })
    })
  })

  const { logUserAction } = await import('@/lib/permissions')
  await logUserAction(user.id, 'create', 'fornecedores', fornecedor.id, 'fornecedor', { nome: fornecedor.nome }, request)

  return createSuccessResponse(fornecedor, 201)
})
