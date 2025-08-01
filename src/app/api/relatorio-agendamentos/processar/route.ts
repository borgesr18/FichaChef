import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { generatePDF, generateExcel } from '@/lib/export-utils'
import { withErrorHandler } from '@/lib/api-helpers'

interface ProcessingResult {
  agendamentoId: string
  status: 'sucesso' | 'erro'
  arquivo?: string
  erro?: string
}

export const POST = withErrorHandler(async function POST() {
  const now = new Date()
    
    const agendamentosVencidos = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.relatorioAgendamento.findMany({
          where: {
            ativo: true,
            proximaExecucao: {
              lte: now
            }
          },
          include: {
            template: true
          }
        })
      })
    })

    const results: ProcessingResult[] = []

    for (const agendamento of agendamentosVencidos) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)

        const reportResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/relatorios?type=${agendamento.tipo}`, {
          headers: {
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!reportResponse.ok) {
          throw new Error('Failed to generate report data')
        }

        const reportData = await reportResponse.json()

        let filename: string

        if (agendamento.formato === 'pdf') {
          const template = agendamento.template ? {
            id: agendamento.template.id,
            nome: agendamento.template.nome,
            tipo: agendamento.template.tipo,
            configuracao: agendamento.template.configuracao as {
              cores: { primaria: string; secundaria: string; texto: string }
              fonte: { familia: string; tamanho: number }
              layout: { margens: number; espacamento: number; logoEmpresa: boolean }
            }
          } : undefined
          generatePDF(reportData, template)
          filename = `relatorio-${agendamento.tipo}-${new Date().toISOString().split('T')[0]}.pdf`
        } else {
          generateExcel(reportData)
          filename = `relatorio-${agendamento.tipo}-${new Date().toISOString().split('T')[0]}.xlsx`
        }

        await withConnectionHealthCheck(async () => {
          return await withDatabaseRetry(async () => {
            return await prisma.relatorioExecucao.create({
              data: {
                agendamentoId: agendamento.id,
                dataExecucao: now,
                status: 'sucesso',
                arquivo: filename,
                userId: agendamento.userId
              }
            })
          })
        })

        const proximaExecucao = calculateNextExecution(agendamento)
        await withConnectionHealthCheck(async () => {
          return await withDatabaseRetry(async () => {
            return await prisma.relatorioAgendamento.update({
              where: { id: agendamento.id },
              data: {
                ultimaExecucao: now,
                proximaExecucao
              }
            })
          })
        })

        results.push({
          agendamentoId: agendamento.id,
          status: 'sucesso',
          arquivo: filename
        })

      } catch (error) {
        await withConnectionHealthCheck(async () => {
          return await withDatabaseRetry(async () => {
            return await prisma.relatorioExecucao.create({
              data: {
                agendamentoId: agendamento.id,
                dataExecucao: now,
                status: 'erro',
                erro: error instanceof Error ? error.message : 'Unknown error',
                userId: agendamento.userId
              }
            })
          })
        })

        results.push({
          agendamentoId: agendamento.id,
          status: 'erro',
          erro: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

  return NextResponse.json({
    processados: results.length,
    resultados: results
  })
})

function calculateNextExecution(agendamento: { horario: string; frequencia: string }): Date {
  const [hours, minutes] = agendamento.horario.split(':').map(Number)
  if (hours === undefined || minutes === undefined) {
    throw new Error('Invalid time format')
  }
  
  const nextExecution = new Date()
  nextExecution.setHours(hours, minutes, 0, 0)
  
  if (agendamento.frequencia === 'diario') {
    nextExecution.setDate(nextExecution.getDate() + 1)
  } else if (agendamento.frequencia === 'semanal') {
    nextExecution.setDate(nextExecution.getDate() + 7)
  } else if (agendamento.frequencia === 'mensal') {
    nextExecution.setMonth(nextExecution.getMonth() + 1)
  }
  
  return nextExecution
}
