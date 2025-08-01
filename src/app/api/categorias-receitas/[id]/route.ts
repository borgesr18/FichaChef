import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'

export const PUT = withErrorHandler(async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  const user = auth.user!

  const body = await request.json()
  const { nome, descricao } = body

  if (!nome) {
    return NextResponse.json({ 
      error: 'Nome é obrigatório' 
    }, { status: 400 })
  }

  const categoria = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
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
  })

  await logUserAction(user.id, 'update', 'categorias-receitas', id, 'categoria', { nome, descricao })

  return NextResponse.json(categoria)
})

export const DELETE = withErrorHandler(async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  const user = auth.user!

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.categoriaReceita.delete({
        where: { 
          id,
          userId: user.id
        }
      })
    })
  })

  await logUserAction(user.id, 'delete', 'categorias-receitas', id, 'categoria')

  return NextResponse.json({ message: 'Categoria deletada com sucesso' })
})
