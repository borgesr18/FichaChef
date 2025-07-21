import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { configuracaoAlertaSchema } from '@/lib/validations'
import { 
  authenticateWithPermission, 
  createValidationErrorResponse, 
  createSuccessResponse 
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { logUserAction } from '@/lib/permissions'

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const user = await authenticateWithPermission('alertas', 'read')

  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo')
  const itemTipo = searchParams.get('itemTipo')

  const where: { userId: string; tipo?: string; itemTipo?: string } = { userId: user.id }
  if (tipo) where.tipo = tipo
  if (itemTipo) where.itemTipo = itemTipo

  const configuracoes = await prisma.configuracaoAlerta.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return createSuccessResponse(configuracoes)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateWithPermission('alertas', 'write')

  const body = await request.json()
  const parsedBody = configuracaoAlertaSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const existing = await prisma.configuracaoAlerta.findFirst({
    where: {
      userId: user.id,
      tipo: data.tipo,
      itemId: data.itemId,
      itemTipo: data.itemTipo
    }
  })

  if (existing) {
    const configuracao = await prisma.configuracaoAlerta.update({
      where: { id: existing.id },
      data: {
        ...data,
        userId: user.id,
      },
    })
    
    await logUserAction(user.id, 'update', 'alertas', configuracao.id, 'configuracao_alerta', data, request)
    return createSuccessResponse(configuracao)
  } else {
    const configuracao = await prisma.configuracaoAlerta.create({
      data: {
        ...data,
        userId: user.id,
      },
    })
    
    await logUserAction(user.id, 'create', 'alertas', configuracao.id, 'configuracao_alerta', data, request)
    return createSuccessResponse(configuracao, 201)
  }
})
