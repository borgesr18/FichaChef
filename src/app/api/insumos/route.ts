import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { insumoSchema } from '@/lib/validations'
import { 
  createValidationErrorResponse, 
  createSuccessResponse 
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const insumos = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.findMany({
        where: { user_id: user.id },
        include: {
          categoria: true,
          unidadeCompra: true,
          fornecedorRel: true,
        },
        orderBy: { nome: 'asc' },
      })
    })
  })

  return createSuccessResponse(insumos)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const body = await request.json()
  const parsedBody = insumoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const insumo = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.create({
        data: {
          ...data,
          user_id: user.id,
        },
        include: {
          categoria: true,
          unidadeCompra: true,
          fornecedorRel: true,
        },
      })
    })
  })

  await logUserAction(user.id, 'create', 'insumos', insumo.id, 'insumo', { nome: insumo.nome }, request)

  return createSuccessResponse(insumo, 201)
})
