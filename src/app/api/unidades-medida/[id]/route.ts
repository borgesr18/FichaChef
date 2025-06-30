import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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

    const unidade = await prisma.unidadeMedida.update({
      where: { 
        id: params.id,
        userId: user.id
      },
      data: {
        nome,
        simbolo,
        tipo
      }
    })

    return NextResponse.json(unidade)
  } catch (error) {
    console.error('Error updating unidade medida:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.unidadeMedida.delete({
      where: { 
        id: params.id,
        userId: user.id
      }
    })

    return NextResponse.json({ message: 'Unidade deletada com sucesso' })
  } catch (error) {
    console.error('Error deleting unidade medida:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
