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

    return NextResponse.json(producao)
  } catch (error) {
    console.error('Error updating producao:', error)
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

    await prisma.producao.delete({
      where: { 
        id,
        userId: user.id
      }
    })

    return NextResponse.json({ message: 'Produção deletada com sucesso' })
  } catch (error) {
    console.error('Error deleting producao:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
