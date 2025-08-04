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

// ✅ GET - LISTAR INSUMOS (SEGUINDO PADRÃO QUE FUNCIONA)
export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const { searchParams } = new URL(request.url)
  const categoria = searchParams.get('categoria')
  const fornecedor = searchParams.get('fornecedor')

  const where: { userId: string; categoriaId?: string; fornecedorId?: string } = { userId: user.id }
  if (categoria) where.categoriaId = categoria
  if (fornecedor) where.fornecedorId = fornecedor

  const insumos = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.findMany({
        where,
        include: {
          categoria: true,
          unidadeCompra: true,
          fornecedorRel: true,
          tacoAlimento: true
        },
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  return createSuccessResponse(insumos)
})

// ✅ POST - CRIAR INSUMO (SEGUINDO PADRÃO QUE FUNCIONA)
export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const { extractRequestMetadata } = await import('@/lib/permissions')
  const requestMeta = extractRequestMetadata(request)
  const body = await request.json()
  const parsedBody = insumoSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  // ✅ VERIFICAR SE CATEGORIA EXISTE
  const categoria = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.categoriaInsumo.findFirst({
        where: {
          id: data.categoriaId,
          userId: user.id
        }
      })
    })
  })

  if (!categoria) {
    return createNotFoundResponse('Categoria não encontrada')
  }

  // ✅ VERIFICAR SE UNIDADE DE MEDIDA EXISTE
  const unidade = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.unidadeMedida.findFirst({
        where: {
          id: data.unidadeCompraId,
          userId: user.id
        }
      })
    })
  })

  if (!unidade) {
    return createNotFoundResponse('Unidade de medida não encontrada')
  }

  // ✅ VERIFICAR SE FORNECEDOR EXISTE (SE FORNECIDO)
  if (data.fornecedorId) {
    const fornecedor = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.fornecedor.findFirst({
          where: {
            id: data.fornecedorId,
            userId: user.id
          }
        })
      })
    })

    if (!fornecedor) {
      return createNotFoundResponse('Fornecedor não encontrado')
    }
  }

  // ✅ VERIFICAR SE JÁ EXISTE INSUMO COM MESMO NOME
  const existing = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.findFirst({
        where: {
          userId: user.id,
          nome: data.nome
        }
      })
    })
  })

  if (existing) {
    return createValidationErrorResponse('Já existe um insumo com este nome')
  }

  // ✅ CRIAR INSUMO
  const insumo = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.create({
        data: {
          ...data,
          userId: user.id,
        },
        include: {
          categoria: true,
          unidadeCompra: true,
          fornecedorRel: true,
          tacoAlimento: true
        }
      })
    })
  })
  
  await logUserAction(user.id, 'create', 'insumos', insumo.id, 'insumo', data, requestMeta)
  return createSuccessResponse(insumo, 201)
})

// ✅ PUT - ATUALIZAR INSUMO (SEGUINDO PADRÃO QUE FUNCIONA)
export const PUT = withErrorHandler(async function PUT(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const { extractRequestMetadata } = await import('@/lib/permissions')
  const requestMeta = extractRequestMetadata(request)
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return createValidationErrorResponse('ID do insumo é obrigatório')
  }

  const body = await request.json()
  const parsedBody = insumoSchema.partial().safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  // ✅ VERIFICAR SE INSUMO EXISTE E PERTENCE AO USUÁRIO
  const existing = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.findFirst({
        where: {
          id,
          userId: user.id
        }
      })
    })
  })

  if (!existing) {
    return createNotFoundResponse('Insumo não encontrado')
  }

  // ✅ VERIFICAR SE NOME JÁ EXISTE (SE ALTERADO)
  if (data.nome && data.nome !== existing.nome) {
    const nameExists = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.insumo.findFirst({
          where: {
            userId: user.id,
            nome: data.nome,
            id: { not: id }
          }
        })
      })
    })

    if (nameExists) {
      return createValidationErrorResponse('Já existe um insumo com este nome')
    }
  }

  // ✅ ATUALIZAR INSUMO
  const insumo = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.update({
        where: { id },
        data,
        include: {
          categoria: true,
          unidadeCompra: true,
          fornecedorRel: true,
          tacoAlimento: true
        }
      })
    })
  })
  
  await logUserAction(user.id, 'update', 'insumos', insumo.id, 'insumo', data, requestMeta)
  return createSuccessResponse(insumo)
})

// ✅ DELETE - EXCLUIR INSUMO (SEGUINDO PADRÃO QUE FUNCIONA)
export const DELETE = withErrorHandler(async function DELETE(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const { extractRequestMetadata } = await import('@/lib/permissions')
  const requestMeta = extractRequestMetadata(request)
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return createValidationErrorResponse('ID do insumo é obrigatório')
  }

  // ✅ VERIFICAR SE INSUMO EXISTE E PERTENCE AO USUÁRIO
  const existing = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.findFirst({
        where: {
          id,
          userId: user.id
        }
      })
    })
  })

  if (!existing) {
    return createNotFoundResponse('Insumo não encontrado')
  }

  // ✅ VERIFICAR SE INSUMO ESTÁ SENDO USADO EM FICHAS TÉCNICAS
  const ingredientesCount = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.ingrediente.count({
        where: {
          insumoId: id
        }
      })
    })
  })

  if (ingredientesCount > 0) {
    return createValidationErrorResponse('Não é possível excluir insumo que está sendo usado em fichas técnicas')
  }

  // ✅ EXCLUIR INSUMO
  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.delete({
        where: { id }
      })
    })
  })
  
  await logUserAction(user.id, 'delete', 'insumos', id, 'insumo', { id }, requestMeta)
  return createSuccessResponse({ message: 'Insumo excluído com sucesso' })
})
