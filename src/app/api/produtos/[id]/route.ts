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
      fichaTecnicaId, 
      precoVenda, 
      margemLucro 
    } = body

    if (!nome || !fichaTecnicaId || !precoVenda || !margemLucro) {
      return NextResponse.json({ 
        error: 'Todos os campos são obrigatórios' 
      }, { status: 400 })
    }

    const produto = await prisma.produto.update({
      where: { 
        id,
        userId: user.id
      },
      data: {
        nome,
        fichaTecnicaId,
        precoVenda: parseFloat(precoVenda),
        margemLucro: parseFloat(margemLucro)
      },
      include: {
        fichaTecnica: true
      }
    })

    return NextResponse.json(produto)
  } catch (error) {
    console.error('Error updating produto:', error)
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

    await prisma.produto.delete({
      where: { 
        id,
        userId: user.id
      }
    })

    return NextResponse.json({ message: 'Produto deletado com sucesso' })
  } catch (error) {
    console.error('Error deleting produto:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
