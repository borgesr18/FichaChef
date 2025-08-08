import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction, extractRequestMetadata } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'

export const PUT = withErrorHandler(async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  const user = auth.user!

  const requestMeta = extractRequestMetadata(request)
  const body = await request.json()
  const { nome, simbolo, tipo } = body

  if (!nome || !simbolo || !tipo) {
    return NextResponse.json({ 
      error: 'Nome, símbolo e tipo são obrigatórios' 
    }, { status: 400 })
  }

  // Verificar existência vinculada ao usuário
  const existing = await withDatabaseRetry(async () => {
    return await prisma.unidadeMedida.findFirst({ where: { id, userId: user.id } })
  })
  if (!existing) {
    return NextResponse.json({ error: 'Unidade não encontrada' }, { status: 404 })
  }

  const unidade = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.unidadeMedida.update({
        where: { id },
        data: {
          nome,
          simbolo,
          tipo
        }
      })
    })
  })

  await logUserAction(user.id, 'update', 'unidades-medida', id, 'UnidadeMedida', { nome, simbolo, tipo }, requestMeta)

  return NextResponse.json(unidade)
})

export const DELETE = withErrorHandler(async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  const user = auth.user!

  const requestMeta = extractRequestMetadata(request)

  // Verificar existência vinculada ao usuário
  const existing = await withDatabaseRetry(async () => {
    return await prisma.unidadeMedida.findFirst({ where: { id, userId: user.id } })
  })
  if (!existing) {
    return NextResponse.json({ error: 'Unidade não encontrada' }, { status: 404 })
  }

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.unidadeMedida.delete({
        where: { id }
      })
    })
  })

  await logUserAction(user.id, 'delete', 'unidades-medida', id, 'UnidadeMedida', {}, requestMeta)

  return NextResponse.json({ message: 'Unidade deletada com sucesso' })
})
