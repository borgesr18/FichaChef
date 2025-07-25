import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { z } from 'zod'

const agendamentoSchema = z.object({
  nome: z.string().min(1),
  tipo: z.string(),
  templateId: z.string().optional(),
  formato: z.enum(['pdf', 'excel']),
  frequencia: z.enum(['diario', 'semanal', 'mensal']),
  diasSemana: z.string().optional(),
  diaMes: z.number().optional(),
  horario: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  email: z.string().email().optional(),
  ativo: z.boolean().optional()
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

  const body = await request.json()
  const validatedData = agendamentoSchema.parse(body)

  const params = await context.params
  const agendamento = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.relatorioAgendamento.update({
        where: {
          id: params.id,
          userId: user.id
        },
        data: validatedData,
        include: { template: true }
      })
    })
  })

  await logUserAction(user.id, 'update', 'relatorio-agendamentos', params.id, 'agendamento', validatedData, request)

  return NextResponse.json(agendamento)
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

  const params = await context.params
  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.relatorioAgendamento.delete({
        where: {
          id: params.id,
          userId: user.id
        }
      })
    })
  })

  await logUserAction(user.id, 'delete', 'relatorio-agendamentos', params.id, 'agendamento', {}, request)

  return NextResponse.json({ success: true })
})
