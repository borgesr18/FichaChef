import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { authenticateWithPermission } from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'

export const PUT = withErrorHandler(async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await authenticateWithPermission('configuracoes', 'write')

  const body = await request.json()
  const { nome, simbolo, tipo } = body

  if (!nome || !simbolo || !tipo) {
    return NextResponse.json({ 
      error: 'Nome, símbolo e tipo são obrigatórios' 
    }, { status: 400 })
  }

  const unidade = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.unidadeMedida.update({
        where: { 
          id,
          userId: user.id
        },
        data: {
          nome,
          simbolo,
          tipo
        }
      })
    })
  })

  await logUserAction(user.id, 'update', 'unidades-medida', id, 'UnidadeMedida', { nome, simbolo, tipo }, request)

  return NextResponse.json(unidade)
})

export const DELETE = withErrorHandler(async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await authenticateWithPermission('configuracoes', 'admin')

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.unidadeMedida.delete({
        where: { 
          id,
          userId: user.id
        }
      })
    })
  })

  await logUserAction(user.id, 'delete', 'unidades-medida', id, 'UnidadeMedida', {}, request)

  return NextResponse.json({ message: 'Unidade deletada com sucesso' })
})
