import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
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
  email: z.string().email().optional().or(z.literal('')),
  ativo: z.boolean().optional()
})

export async function GET() {
  try {
    const user = await authenticateWithPermission('relatorios', 'read')

    const agendamentos = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.relatorioAgendamento.findMany({
          where: { userId: user.id },
          include: { template: true },
          orderBy: { createdAt: 'desc' }
        })
      })
    })

    return NextResponse.json(agendamentos)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateWithPermission('relatorios', 'write')

    const body = await request.json()
    const validatedData = agendamentoSchema.parse(body)

    const proximaExecucao = calculateNextExecution(validatedData)

    const agendamento = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.relatorioAgendamento.create({
          data: {
            ...validatedData,
            proximaExecucao,
            userId: user.id
          },
          include: { template: true }
        })
      })
    })

    await logUserAction(user.id, 'create', 'relatorios', agendamento.id, 'agendamento', validatedData, request)

    return NextResponse.json(agendamento, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    console.error('Error creating schedule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateNextExecution(data: { horario: string; frequencia: string; diasSemana?: string; diaMes?: number }): Date {
  const now = new Date()
  const [hours, minutes] = data.horario.split(':').map(Number)
  if (hours === undefined || minutes === undefined) {
    throw new Error('Invalid time format')
  }
  
  const nextExecution = new Date()
  nextExecution.setHours(hours, minutes, 0, 0)
  
  if (nextExecution <= now) {
    nextExecution.setDate(nextExecution.getDate() + 1)
  }
  
  if (data.frequencia === 'semanal' && data.diasSemana) {
    const diasArray = JSON.parse(data.diasSemana)
    const currentDay = nextExecution.getDay()
    let nextDay = diasArray.find((day: number) => day > currentDay)
    
    if (!nextDay) {
      nextDay = diasArray[0]
      nextExecution.setDate(nextExecution.getDate() + (7 - currentDay + nextDay))
    } else {
      nextExecution.setDate(nextExecution.getDate() + (nextDay - currentDay))
    }
  } else if (data.frequencia === 'mensal' && data.diaMes) {
    nextExecution.setDate(data.diaMes)
    if (nextExecution <= now) {
      nextExecution.setMonth(nextExecution.getMonth() + 1)
    }
  }
  
  return nextExecution
}
