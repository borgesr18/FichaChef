import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const produtos = await prisma.produto.findMany({
      where: { userId: user.id },
      include: {
        fichaTecnica: true
      },
      orderBy: { nome: 'asc' }
    })

    return NextResponse.json(produtos)
  } catch (error) {
    console.error('Error fetching produtos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
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

    const produto = await prisma.produto.create({
      data: {
        nome,
        fichaTecnicaId,
        precoVenda: parseFloat(precoVenda),
        margemLucro: parseFloat(margemLucro),
        userId: user.id
      },
      include: {
        fichaTecnica: true
      }
    })

    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    console.error('Error creating produto:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
