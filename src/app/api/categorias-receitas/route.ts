import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categorias = await prisma.categoriaReceita.findMany({
      where: { userId: user.id },
      orderBy: { nome: 'asc' }
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error('Error fetching categorias receitas:', error)
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
    const { nome, descricao } = body

    if (!nome) {
      return NextResponse.json({ 
        error: 'Nome é obrigatório' 
      }, { status: 400 })
    }

    const categoria = await prisma.categoriaReceita.create({
      data: {
        nome,
        descricao,
        userId: user.id
      }
    })

    return NextResponse.json(categoria, { status: 201 })
  } catch (error) {
    console.error('Error creating categoria receita:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
