import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry } from '@/lib/database-utils'
import { authenticateWithPermission } from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await authenticateWithPermission('fichas-tecnicas', 'write')

    const body = await request.json()
    const { nome, descricao } = body

    if (!nome) {
      return NextResponse.json({ 
        error: 'Nome é obrigatório' 
      }, { status: 400 })
    }

    const categoria = await withDatabaseRetry(async () => {
      return await prisma.categoriaReceita.update({
        where: { 
          id,
          userId: user.id
        },
        data: {
          nome,
          descricao
        }
      })
    })

    await logUserAction(user.id, 'update', 'categorias-receitas', id, 'categoria', { nome, descricao })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error('Error updating categoria receita:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await authenticateWithPermission('fichas-tecnicas', 'admin')

    await withDatabaseRetry(async () => {
      return await prisma.categoriaReceita.delete({
        where: { 
          id,
          userId: user.id
        }
      })
    })

    await logUserAction(user.id, 'delete', 'categorias-receitas', id, 'categoria')

    return NextResponse.json({ message: 'Categoria deletada com sucesso' })
  } catch (error) {
    console.error('Error deleting categoria receita:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
