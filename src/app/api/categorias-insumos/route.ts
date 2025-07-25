import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { 
  createValidationErrorResponse, 
  createSuccessResponse 
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { categoriaSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const categorias = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.categoriaInsumo.findMany({
        where: { userId: user.id },
        orderBy: { nome: 'asc' },
      })
    })
  })

  return createSuccessResponse(categorias)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const body = await request.json()
  const parsedBody = categoriaSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const { nome, descricao } = parsedBody.data

  const categoria = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.categoriaInsumo.create({
        data: {
          nome,
          descricao,
          userId: user.id,
        },
      })
    })
  })

  await logUserAction(user.id, 'create', 'insumos', categoria.id, 'categoria', { nome, descricao }, request)

  return createSuccessResponse(categoria, 201)
})
