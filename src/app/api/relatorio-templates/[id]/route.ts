import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry } from '@/lib/database-utils'
import { authenticateWithPermission } from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateWithPermission('relatorios', 'write')

    const body = await request.json()
    const validatedData = templateSchema.parse(body)

    const params = await context.params
    const template = await withDatabaseRetry(async () => {
      return await prisma.relatorioTemplate.update({
        where: {
          id: params.id,
          userId: user.id
        },
        data: validatedData
      })
    })

    await logUserAction(user.id, 'update', 'relatorio-templates', params.id, 'template', validatedData, request)

    return NextResponse.json(template)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    console.error('Error updating template:', error)
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
    await withDatabaseRetry(async () => {
      return await prisma.relatorioTemplate.delete({
        where: {
          id: params.id,
          userId: user.id
        }
      })
    })

    await logUserAction(user.id, 'delete', 'relatorio-templates', params.id, 'template', {}, request)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
