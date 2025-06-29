import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const insumos = await prisma.insumo.findMany({
      where: { userId: user.id },
      include: {
        categoria: true,
        unidadeCompra: true
      },
      orderBy: { nome: 'asc' }
    })

    return NextResponse.json(insumos)
  } catch (error) {
    console.error('Error fetching insumos:', error)
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

    const insumo = await prisma.insumo.create({
      data: {
        nome,
        marca,
        fornecedor,
        categoriaId,
        unidadeCompraId,
        pesoLiquidoGramas: parseFloat(pesoLiquidoGramas),
        precoUnidade: parseFloat(precoUnidade),
        userId: user.id
      },
      include: {
        categoria: true,
        unidadeCompra: true
      }
    })

    return NextResponse.json(insumo, { status: 201 })
  } catch (error) {
    console.error('Error creating insumo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
