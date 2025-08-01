import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction } from '@/lib/permissions'
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

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo')

  const templates = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.relatorioTemplate.findMany({
        where: {
          userId: user.id,
          ...(tipo && { tipo })
        },
        orderBy: [
          { padrao: 'desc' },
          { createdAt: 'desc' }
        ]
      })
    })
  })

  return NextResponse.json(templates)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const body = await request.json()
  const validatedData = templateSchema.parse(body)

  const template = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.relatorioTemplate.create({
        data: {
          ...validatedData,
          userId: user.id
        }
      })
    })
  })

  await logUserAction(
    user.id,
    'create',
    'relatorio-templates',
    template.id,
    'template',
    { nome: template.nome, tipo: template.tipo },
    request
  )

  return NextResponse.json(template, { status: 201 })
})
