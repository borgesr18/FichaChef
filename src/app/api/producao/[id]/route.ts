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

  const exists = await withDatabaseRetry(async () => {
    return await prisma.producao.findFirst({ where: { id, userId: user.id } })
  })
  if (!exists) {
    return NextResponse.json({ error: 'Produção não encontrada' }, { status: 404 })
  }

  const producao = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.producao.update({
        where: { id },
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
    })
  })

  await logUserAction(user.id, 'update', 'producao', id, 'producao', { lote, quantidadeProduzida }, requestMeta)

  return NextResponse.json(producao)
})

export const DELETE = withErrorHandler(async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  const user = auth.user!

  const requestMeta = extractRequestMetadata(request)

  const exists = await withDatabaseRetry(async () => {
    return await prisma.producao.findFirst({ where: { id, userId: user.id } })
  })
  if (!exists) {
    return NextResponse.json({ error: 'Produção não encontrada' }, { status: 404 })
  }

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.producao.delete({
        where: { id }
      })
    })
  })

  await logUserAction(user.id, 'delete', 'producao', id, 'producao', {}, requestMeta)

  return NextResponse.json({ message: 'Produção deletada com sucesso' })
})
