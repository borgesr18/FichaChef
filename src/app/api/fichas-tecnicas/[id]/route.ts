import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'

export const GET = withErrorHandler(async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const ficha = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.fichaTecnica.findUnique({
        where: { 
          id,
          user_id: user.id
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
    })
  })

  if (!ficha) {
    return NextResponse.json({ error: 'Ficha técnica não encontrada' }, { status: 404 })
  }

  return NextResponse.json(ficha)
})

export const PUT = withErrorHandler(async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

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

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.ingrediente.deleteMany({
        where: { fichaTecnicaId: id }
      })
    })
  })

  const ficha = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.fichaTecnica.update({
        where: { 
          id,
          user_id: user.id
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
    })
  })

  await logUserAction(user.id, 'update', 'fichas-tecnicas', id, 'FichaTecnica', { nome }, request)

  return NextResponse.json(ficha)
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
      return await prisma.fichaTecnica.delete({
        where: { 
          id,
          user_id: user.id
        }
      })
    })
  })

  await logUserAction(user.id, 'delete', 'fichas-tecnicas', id, 'FichaTecnica', {}, request)

  return NextResponse.json({ message: 'Ficha técnica deletada com sucesso' })
})
