import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateWithPermission } from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateWithPermission('relatorios', 'write')

    const body = await request.json()
    const validatedData = agendamentoSchema.parse(body)

    const params = await context.params
    const agendamento = await prisma.relatorioAgendamento.update({
      where: {
        id: params.id,
        userId: user.id
      },
      data: validatedData,
      include: { template: true }
    })

    await logUserAction(user.id, 'update', 'relatorio-agendamentos', params.id, 'agendamento', validatedData, request)

    return NextResponse.json(agendamento)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    console.error('Error updating schedule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateWithPermission('relatorios', 'admin')

    const params = await context.params
    await prisma.relatorioAgendamento.delete({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    await logUserAction(user.id, 'delete', 'relatorio-agendamentos', params.id, 'agendamento', {}, request)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
