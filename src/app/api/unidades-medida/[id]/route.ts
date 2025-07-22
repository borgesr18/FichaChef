import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry } from '@/lib/database-utils'
import { authenticateWithPermission } from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await authenticateWithPermission('configuracoes', 'write')

    const body = await request.json()
    const { nome, simbolo, tipo } = body

    if (!nome || !simbolo || !tipo) {
      return NextResponse.json({ 
        error: 'Nome, símbolo e tipo são obrigatórios' 
      }, { status: 400 })
    }

    const unidade = await withDatabaseRetry(async () => {
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

    await logUserAction(user.id, 'update', 'unidades-medida', id, 'UnidadeMedida', { nome, simbolo, tipo }, request)

    return NextResponse.json(unidade)
  } catch (error) {
    console.error('Error updating unidade medida:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await authenticateWithPermission('configuracoes', 'admin')

    await withDatabaseRetry(async () => {
      return await prisma.unidadeMedida.delete({
        where: { 
          id,
          userId: user.id
        }
      })
    })

    await logUserAction(user.id, 'delete', 'unidades-medida', id, 'UnidadeMedida', {}, request)

    return NextResponse.json({ message: 'Unidade deletada com sucesso' })
  } catch (error) {
    console.error('Error deleting unidade medida:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
