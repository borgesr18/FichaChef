import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateWithPermission('relatorios', 'read')

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')

    const templates = await prisma.relatorioTemplate.findMany({
      where: {
        userId: user.id,
        ...(tipo && { tipo })
      },
      orderBy: [
        { padrao: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateWithPermission('relatorios', 'write')

    const body = await request.json()
    const validatedData = templateSchema.parse(body)

    const template = await prisma.relatorioTemplate.create({
      data: {
        ...validatedData,
        userId: user.id
      }
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
