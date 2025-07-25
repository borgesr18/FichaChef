import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { configuracaoAlertaSchema } from '@/lib/validations'
import { 
  createValidationErrorResponse, 
  createSuccessResponse 
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { withErrorHandler } from '@/lib/api-helpers'
import { logUserAction } from '@/lib/permissions'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo')
  const itemTipo = searchParams.get('itemTipo')

  const where: { user_id: string; tipo?: string; itemTipo?: string } = { user_id: user.id }
  if (tipo) where.tipo = tipo
  if (itemTipo) where.itemTipo = itemTipo

  const configuracoes = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.configuracaoAlerta.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  return createSuccessResponse(configuracoes)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const body = await request.json()
  const parsedBody = configuracaoAlertaSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const existing = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.configuracaoAlerta.findFirst({
        where: {
          user_id: user.id,
          tipo: data.tipo,
          itemId: data.itemId,
          itemTipo: data.itemTipo
        }
      })
    })
  })

  if (existing) {
    const configuracao = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.configuracaoAlerta.update({
          where: { id: existing.id },
          data: {
            ...data,
            user_id: user.id,
          },
        })
      })
    })
    
    await logUserAction(user.id, 'update', 'alertas', configuracao.id, 'configuracao_alerta', data, request)
    return createSuccessResponse(configuracao)
  } else {
    const configuracao = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.configuracaoAlerta.create({
          data: {
            ...data,
            user_id: user.id,
          },
        })
      })
    })
    
    await logUserAction(user.id, 'create', 'alertas', configuracao.id, 'configuracao_alerta', data, request)
    return createSuccessResponse(configuracao, 201)
  }
})
