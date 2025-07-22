import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { authenticateWithPermission } from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await authenticateWithPermission('estoque', 'write')

    const body = await request.json()
    const { 
      insumoId, 
      tipo, 
      quantidade, 
      motivo, 
      lote, 
      dataValidade 
    } = body

    if (!insumoId || !tipo || !quantidade || !motivo) {
      return NextResponse.json({ 
        error: 'Insumo, tipo, quantidade e motivo são obrigatórios' 
      }, { status: 400 })
    }

    const movimentacao = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.movimentacaoEstoque.update({
          where: { 
            id,
            userId: user.id
          },
          data: {
            insumoId,
            tipo,
            quantidade: parseFloat(quantidade),
            motivo,
            lote,
            dataValidade: dataValidade ? new Date(dataValidade) : null
          },
          include: {
            insumo: true
          }
        })
      })
    })

    await logUserAction(user.id, 'update', 'estoque', id, 'movimentacao', { tipo, quantidade, motivo }, request)

    return NextResponse.json(movimentacao)
  } catch (error) {
    console.error('Error updating movimentacao estoque:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await authenticateWithPermission('estoque', 'admin')

    await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.movimentacaoEstoque.delete({
          where: { 
            id,
            userId: user.id
          }
        })
      })
    })

    await logUserAction(user.id, 'delete', 'estoque', id, 'movimentacao', {}, request)

    return NextResponse.json({ message: 'Movimentação deletada com sucesso' })
  } catch (error) {
    console.error('Error deleting movimentacao estoque:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
