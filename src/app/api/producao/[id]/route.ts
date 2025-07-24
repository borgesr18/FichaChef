import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { authenticateWithPermission } from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'

export const PUT = withErrorHandler(async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await authenticateWithPermission('producao', 'write')

  const body = await request.json()
  const { 
    fichaTecnicaId, 
    dataProducao, 
    dataValidade, 
    quantidadeProduzida, 
    lote 
  } = body

  if (!fichaTecnicaId || !dataProducao || !dataValidade || !quantidadeProduzida || !lote) {
    return NextResponse.json({ 
      error: 'Todos os campos são obrigatórios' 
    }, { status: 400 })
  }

  const producao = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.producao.update({
        where: { 
          id,
          userId: user.id
        },
        data: {
          fichaTecnicaId,
          dataProducao: new Date(dataProducao),
          dataValidade: new Date(dataValidade),
          quantidadeProduzida: parseFloat(quantidadeProduzida),
          lote
        },
        include: {
          fichaTecnica: true
        }
      })
    })
  })

  await logUserAction(user.id, 'update', 'producao', id, 'producao', { lote, quantidadeProduzida }, request)

  return NextResponse.json(producao)
})

export const DELETE = withErrorHandler(async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await authenticateWithPermission('producao', 'admin')

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.producao.delete({
        where: { 
          id,
          userId: user.id
        }
      })
    })
  })

  await logUserAction(user.id, 'delete', 'producao', id, 'producao', {}, request)

  return NextResponse.json({ message: 'Produção deletada com sucesso' })
})
