import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateWithPermission } from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await authenticateWithPermission('fichas-tecnicas', 'read')

    const ficha = await prisma.fichaTecnica.findUnique({
      where: { 
        id,
        userId: user.id
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

    if (!ficha) {
      return NextResponse.json({ error: 'Ficha técnica não encontrada' }, { status: 404 })
    }

    return NextResponse.json(ficha)
  } catch (error) {
    console.error('Error fetching ficha tecnica:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await authenticateWithPermission('fichas-tecnicas', 'write')

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

    await logUserAction(user.id, 'update', 'fichas-tecnicas', id, 'FichaTecnica', { nome }, request)

    return NextResponse.json(ficha)
  } catch (error) {
    console.error('Error updating ficha tecnica:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await authenticateWithPermission('fichas-tecnicas', 'admin')

    await prisma.fichaTecnica.delete({
      where: { 
        id,
        userId: user.id
      }
    })

    await logUserAction(user.id, 'delete', 'fichas-tecnicas', id, 'FichaTecnica', {}, request)

    return NextResponse.json({ message: 'Ficha técnica deletada com sucesso' })
  } catch (error) {
    console.error('Error deleting ficha tecnica:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
