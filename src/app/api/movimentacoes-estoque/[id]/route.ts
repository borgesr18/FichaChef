import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const movimentacao = await prisma.movimentacaoEstoque.update({
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

    return NextResponse.json(movimentacao)
  } catch (error) {
    console.error('Error updating movimentacao estoque:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.movimentacaoEstoque.delete({
      where: { 
        id,
        userId: user.id
      }
    })

    return NextResponse.json({ message: 'Movimentação deletada com sucesso' })
  } catch (error) {
    console.error('Error deleting movimentacao estoque:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
