import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction, extractRequestMetadata } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'

export const PUT = withErrorHandler(async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  const user = auth.user!

  const requestMeta = extractRequestMetadata(request)
  const body = await request.json()
  const { 
    insumoId, 
    tipo, 
    quantidade, 
    motivo, 
    lote, 
    dataValidade 
  } = body

  if (!insumoId || !tipo || !quantidade || !motivo) {
    return NextResponse.json({ 
      error: 'Insumo, tipo, quantidade e motivo são obrigatórios' 
    }, { status: 400 })
  }

  const movimentacao = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.movimentacaoEstoque.update({
        where: { 
          id,
          userId: user.id
        },
        data: {
          insumoId,
          tipo,
          quantidade: parseFloat(quantidade),
          motivo,
          lote,
          dataValidade: dataValidade ? new Date(dataValidade) : null
        },
        include: {
          insumo: true
        }
      })
    })
  })

  await logUserAction(user.id, 'update', 'estoque', id, 'movimentacao', { tipo, quantidade, motivo }, requestMeta)

  return NextResponse.json(movimentacao)
})

export const DELETE = withErrorHandler(async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  const user = auth.user!

  const requestMeta = extractRequestMetadata(request)

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.movimentacaoEstoque.delete({
        where: { 
          id,
          userId: user.id
        }
      })
    })
  })

  await logUserAction(user.id, 'delete', 'estoque', id, 'movimentacao', {}, requestMeta)

  return NextResponse.json({ message: 'Movimentação deletada com sucesso' })
})
