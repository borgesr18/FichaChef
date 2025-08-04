import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { insumoSchema } from '@/lib/validations'
import { 
  createValidationErrorResponse, 
  createSuccessResponse,
  createNotFoundResponse 
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { withErrorHandler } from '@/lib/api-helpers'
import { logUserAction } from '@/lib/permissions'

const getRequestMeta = (request: NextRequest) => ({
  url: request.url,
  method: request.method,
  headers: Object.fromEntries(request.headers.entries())
})

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) return auth.response!
  const user = auth.user!
  const { searchParams } = new URL(request.url)
  const categoria = searchParams.get('categoria')
  const fornecedor = searchParams.get('fornecedor')

  const where: { userId: string; categoriaId?: string; fornecedorId?: string } = { userId: user.id }
  if (categoria) where.categoriaId = categoria
  if (fornecedor) where.fornecedorId = fornecedor

  const insumos = await withConnectionHealthCheck(() => withDatabaseRetry(() =>
    prisma.insumo.findMany({
      where,
      include: { categoria: true, unidadeCompra: true, fornecedorRel: true, tacoAlimento: true },
      orderBy: { createdAt: 'desc' }
    })
  ))

  return createSuccessResponse(insumos)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) return auth.response!
  const user = auth.user!
  const body = await request.json()
  const parsedBody = insumoSchema.safeParse(body)
  if (!parsedBody.success) return createValidationErrorResponse(parsedBody.error.message)
  const data = parsedBody.data

  const categoria = await withConnectionHealthCheck(() => withDatabaseRetry(() =>
    prisma.categoriaInsumo.findFirst({ where: { id: data.categoriaId, userId: user.id } })
  ))
  if (!categoria) return createNotFoundResponse('Categoria não encontrada')

  const unidade = await withConnectionHealthCheck(() => withDatabaseRetry(() =>
    prisma.unidadeMedida.findFirst({ where: { id: data.unidadeCompraId, userId: user.id } })
  ))
  if (!unidade) return createNotFoundResponse('Unidade de medida não encontrada')

  if (data.fornecedorId) {
    const fornecedor = await withConnectionHealthCheck(() => withDatabaseRetry(() =>
      prisma.fornecedor.findFirst({ where: { id: data.fornecedorId, userId: user.id } })
    ))
    if (!fornecedor) return createNotFoundResponse('Fornecedor não encontrado')
  }

  const existing = await withConnectionHealthCheck(() => withDatabaseRetry(() =>
    prisma.insumo.findFirst({ where: { userId: user.id, nome: data.nome } })
  ))
  if (existing) return createValidationErrorResponse('Já existe um insumo com este nome')

  const insumo = await withConnectionHealthCheck(() => withDatabaseRetry(() =>
    prisma.insumo.create({
      data: { ...data, userId: user.id },
      include: { categoria: true, unidadeCompra: true, fornecedorRel: true, tacoAlimento: true }
    })
  ))
    
  await logUserAction(user.id, 'create', 'insumos', insumo.id, 'insumo', data, request)
  return createSuccessResponse(insumo, 201)
})

export const PUT = withErrorHandler(async function PUT(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) return auth.response!
  const user = auth.user!
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return createValidationErrorResponse('ID do insumo é obrigatório')
  const body = await request.json()
  const parsedBody = insumoSchema.partial().safeParse(body)
  if (!parsedBody.success) return createValidationErrorResponse(parsedBody.error.message)
  const data = parsedBody.data

  const existing = await withConnectionHealthCheck(() => withDatabaseRetry(() =>
    prisma.insumo.findFirst({ where: { id, userId: user.id } })
  ))
  if (!existing) return createNotFoundResponse('Insumo não encontrado')

  if (data.nome && data.nome !== existing.nome) {
    const nameExists = await withConnectionHealthCheck(() => withDatabaseRetry(() =>
      prisma.insumo.findFirst({ where: { userId: user.id, nome: data.nome, id: { not: id } } })
    ))
    if (nameExists) return createValidationErrorResponse('Já existe um insumo com este nome')
  }

  const insumo = await withConnectionHealthCheck(() => withDatabaseRetry(() =>
    prisma.insumo.update({
      where: { id },
      data,
      include: { categoria: true, unidadeCompra: true, fornecedorRel: true, tacoAlimento: true }
    })
  ))

  await logUserAction(user.id, 'update', 'insumos', insumo.id, 'insumo', data, getRequestMeta(request))
  return createSuccessResponse(insumo)
})

export const DELETE = withErrorHandler(async function DELETE(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  if (!auth.authenticated) return auth.response!
  const user = auth.user!
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return createValidationErrorResponse('ID do insumo é obrigatório')

  const existing = await withConnectionHealthCheck(() => withDatabaseRetry(() =>
    prisma.insumo.findFirst({ where: { id, userId: user.id } })
  ))
  if (!existing) return createNotFoundResponse('Insumo não encontrado')

  const ingredientesCount = await withConnectionHealthCheck(() => withDatabaseRetry(() =>
    prisma.ingrediente.count({ where: { insumoId: id } })
  ))
  if (ingredientesCount > 0) return createValidationErrorResponse('Não é possível excluir insumo que está sendo usado em fichas técnicas')

  await withConnectionHealthCheck(() => withDatabaseRetry(() =>
    prisma.insumo.delete({ where: { id } })
  ))

  await logUserAction(user.id, 'delete', 'insumos', id, 'insumo', { id }, getRequestMeta(request))
  return createSuccessResponse({ message: 'Insumo excluído com sucesso' })
})


