import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      nome, 
      marca, 
      fornecedor, 
      categoriaId, 
      unidadeCompraId, 
      pesoLiquidoGramas, 
      precoUnidade 
    } = body

    if (!nome || !categoriaId || !unidadeCompraId || !pesoLiquidoGramas || !precoUnidade) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: nome, categoria, unidade, peso líquido e preço' 
      }, { status: 400 })
    }

    const insumo = await prisma.insumo.update({
      where: { 
        id,
        userId: user.id
      },
      data: {
        nome,
        marca,
        fornecedor,
        categoriaId,
        unidadeCompraId,
        pesoLiquidoGramas: parseFloat(pesoLiquidoGramas),
        precoUnidade: parseFloat(precoUnidade)
      },
      include: {
        categoria: true,
        unidadeCompra: true
      }
    })

    return NextResponse.json(insumo)
  } catch (error) {
    console.error('Error updating insumo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.insumo.delete({
      where: { 
        id,
        userId: user.id
      }
    })

    return NextResponse.json({ message: 'Insumo deletado com sucesso' })
  } catch (error) {
    console.error('Error deleting insumo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
