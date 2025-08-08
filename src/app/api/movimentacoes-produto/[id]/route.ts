import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction, extractRequestMetadata } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { movimentacaoProdutoSchema } from '@/lib/validations'

export const PUT = withErrorHandler(async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  const user = auth.user!

  const requestMeta = extractRequestMetadata(request)
  const body = await request.json()
  const parsedBody = movimentacaoProdutoSchema.safeParse(body)

  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.message }, { status: 400 })
  }

  const data = parsedBody.data

  const exists = await withDatabaseRetry(async () => {
    return await prisma.movimentacaoProduto.findFirst({ where: { id, userId: user.id } })
  })
  if (!exists) {
    return NextResponse.json({ error: 'Movimentação não encontrada' }, { status: 404 })
  }

  const movimentacao = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.movimentacaoProduto.update({
        where: { id },
        data: {
          produtoId: data.produtoId,
          tipo: data.tipo,
          quantidade: data.quantidade,
          motivo: data.motivo,
          lote: data.lote ?? null,
          dataValidade: data.dataValidade ?? null,
        },
        include: { produto: true }
      })
    })
  })

  await logUserAction(user.id, 'update', 'estoque', id, 'movimentacao_produto', data, requestMeta)

  return NextResponse.json(movimentacao)
})

export const DELETE = withErrorHandler(async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  const user = auth.user!

  const requestMeta = extractRequestMetadata(request)

  const exists = await withDatabaseRetry(async () => {
    return await prisma.movimentacaoProduto.findFirst({ where: { id, userId: user.id } })
  })
  if (!exists) {
    return NextResponse.json({ error: 'Movimentação não encontrada' }, { status: 404 })
  }

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.movimentacaoProduto.delete({ where: { id } })
    })
  })

  await logUserAction(user.id, 'delete', 'estoque', id, 'movimentacao_produto', {}, requestMeta)

  return NextResponse.json({ message: 'Movimentação deletada com sucesso' })
})
