import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const producoes = await prisma.producao.findMany({
      where: { userId: user.id },
      include: {
        fichaTecnica: true
      },
      orderBy: { dataProducao: 'desc' }
    })

    return NextResponse.json(producoes)
  } catch (error) {
    console.error('Error fetching producoes:', error)
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

    const producao = await prisma.producao.create({
      data: {
        fichaTecnicaId,
        dataProducao: new Date(dataProducao),
        dataValidade: new Date(dataValidade),
        quantidadeProduzida: parseFloat(quantidadeProduzida),
        lote,
        userId: user.id
      },
      include: {
        fichaTecnica: true
      }
    })

    return NextResponse.json(producao, { status: 201 })
  } catch (error) {
    console.error('Error creating producao:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
