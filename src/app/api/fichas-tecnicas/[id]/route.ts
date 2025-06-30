import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      nome, 
      categoriaId, 
      pesoFinalGramas, 
      numeroPorcoes, 
      tempoPreparo, 
      temperaturaForno, 
      modoPreparo, 
      nivelDificuldade,
      ingredientes 
    } = body

    if (!nome || !categoriaId || !pesoFinalGramas || !numeroPorcoes || !modoPreparo || !nivelDificuldade) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: nome, categoria, peso final, porções, modo de preparo e nível de dificuldade' 
      }, { status: 400 })
    }

    await prisma.ingrediente.deleteMany({
      where: { fichaTecnicaId: id }
    })

    const ficha = await prisma.fichaTecnica.update({
      where: { 
        id,
        userId: user.id
      },
      data: {
        nome,
        categoriaId,
        pesoFinalGramas: parseFloat(pesoFinalGramas),
        numeroPorcoes: parseInt(numeroPorcoes),
        tempoPreparo: tempoPreparo ? parseInt(tempoPreparo) : null,
        temperaturaForno: temperaturaForno ? parseInt(temperaturaForno) : null,
        modoPreparo,
        nivelDificuldade,
        ingredientes: {
          create: ingredientes?.map((ing: { insumoId: string; quantidadeGramas: string }) => ({
            insumoId: ing.insumoId,
            quantidadeGramas: parseFloat(ing.quantidadeGramas)
          })) || []
        }
      },
      include: {
        categoria: true,
        ingredientes: {
          include: {
            insumo: true
          }
        }
      }
    })

    return NextResponse.json(ficha)
  } catch (error) {
    console.error('Error updating ficha tecnica:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.fichaTecnica.delete({
      where: { 
        id,
        userId: user.id
      }
    })

    return NextResponse.json({ message: 'Ficha técnica deletada com sucesso' })
  } catch (error) {
    console.error('Error deleting ficha tecnica:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
