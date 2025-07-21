import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateWithPermission } from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
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

    const producao = await prisma.producao.update({
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

    await logUserAction(user.id, 'update', 'producao', id, 'producao', { lote, quantidadeProduzida }, request)

    return NextResponse.json(producao)
  } catch (error) {
    console.error('Error updating producao:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await authenticateWithPermission('producao', 'admin')

    await prisma.producao.delete({
      where: { 
        id,
        userId: user.id
      }
    })

    await logUserAction(user.id, 'delete', 'producao', id, 'producao', {}, request)

    return NextResponse.json({ message: 'Produção deletada com sucesso' })
  } catch (error) {
    console.error('Error deleting producao:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
