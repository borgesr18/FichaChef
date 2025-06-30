import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const movimentacoes = await prisma.movimentacaoEstoque.findMany({
      where: { userId: user.id },
      include: {
        insumo: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(movimentacoes)
  } catch (error) {
    console.error('Error fetching movimentacoes estoque:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const movimentacao = await prisma.movimentacaoEstoque.create({
      data: {
        insumoId,
        tipo,
        quantidade: parseFloat(quantidade),
        motivo,
        lote,
        dataValidade: dataValidade ? new Date(dataValidade) : null,
        userId: user.id
      },
      include: {
        insumo: true
      }
    })

    return NextResponse.json(movimentacao, { status: 201 })
  } catch (error) {
    console.error('Error creating movimentacao estoque:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
