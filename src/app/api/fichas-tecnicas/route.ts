import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fichas = await prisma.fichaTecnica.findMany({
      where: { userId: user.id },
      include: {
        categoria: true,
        ingredientes: {
          include: {
            insumo: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    })

    return NextResponse.json(fichas)
  } catch (error) {
    console.error('Error fetching fichas tecnicas:', error)
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

    const ficha = await prisma.fichaTecnica.create({
      data: {
        nome,
        categoriaId,
        pesoFinalGramas: parseFloat(pesoFinalGramas),
        numeroPorcoes: parseInt(numeroPorcoes),
        tempoPreparo: tempoPreparo ? parseInt(tempoPreparo) : null,
        temperaturaForno: temperaturaForno ? parseInt(temperaturaForno) : null,
        modoPreparo,
        nivelDificuldade,
        userId: user.id,
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

    return NextResponse.json(ficha, { status: 201 })
  } catch (error) {
    console.error('Error creating ficha tecnica:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
