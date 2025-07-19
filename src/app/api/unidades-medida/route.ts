import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const unidades = await prisma.unidadeMedida.findMany({
      where: { userId: user.id },
      orderBy: { nome: 'asc' }
    })

    return NextResponse.json(unidades)
  } catch (error) {
    console.error('Error fetching unidades medida:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { nome, simbolo, tipo } = body

    if (!nome || !simbolo || !tipo) {
      return NextResponse.json({ 
        error: 'Nome, símbolo e tipo são obrigatórios' 
      }, { status: 400 })
    }

    const unidade = await prisma.unidadeMedida.create({
      data: {
        nome,
        simbolo,
        tipo,
        userId: user.id
      }
    })

    return NextResponse.json(unidade, { status: 201 })
  } catch (error) {
    console.error('Error creating unidade medida:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
