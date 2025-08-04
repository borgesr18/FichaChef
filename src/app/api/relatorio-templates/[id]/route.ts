import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction, extractRequestMetadata } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { z } from 'zod'

const templateSchema = z.object({
  nome: z.string().min(1),
  tipo: z.string(),
  configuracao: z.object({
    cores: z.object({
      primaria: z.string(),
      secundaria: z.string(),
      texto: z.string()
    }),
    fonte: z.object({
      familia: z.string(),
      tamanho: z.number()
    }),
    layout: z.object({
      margens: z.number(),
      espacamento: z.number(),
      logoEmpresa: z.boolean()
    })
  }),
  padrao: z.boolean().optional()
})

export const PUT = withErrorHandler(async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const requestMeta = extractRequestMetadata(request)
  const body = await request.json()
  const validatedData = templateSchema.parse(body)

  const params = await context.params
  const template = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.relatorioTemplate.update({
        where: {
          id: params.id,
          userId: user.id
        },
        data: validatedData
      })
    })
  })

  await logUserAction(user.id, 'update', 'relatorio-templates', params.id, 'template', validatedData, requestMeta)

  return NextResponse.json(template)
})

export const DELETE = withErrorHandler(async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const requestMeta = extractRequestMetadata(request)
  const params = await context.params
  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.relatorioTemplate.delete({
        where: {
          id: params.id,
          userId: user.id
        }
      })
    })
  })

  await logUserAction(user.id, 'delete', 'relatorio-templates', params.id, 'template', {}, requestMeta)

  return NextResponse.json({ success: true })
})
