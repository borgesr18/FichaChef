import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { fornecedorSchema } from '@/lib/validations'
import { 
  authenticateWithPermission, 
  createValidationErrorResponse,
  createSuccessResponse,
  createNotFoundResponse
} from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'

export const PUT = withErrorHandler(async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await authenticateWithPermission('fornecedores', 'write')

  const body = await request.json()
  const validationResult = fornecedorSchema.safeParse(body)
  
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message).join(', ')
    return createValidationErrorResponse(errors)
  }

  const data = validationResult.data

  const existingFornecedor = await withDatabaseRetry(async () => {
    return await prisma.fornecedor.findFirst({
      where: { id, userId: user.id }
    })
  })

  if (!existingFornecedor) {
    return createNotFoundResponse('Fornecedor')
  }

  const fornecedor = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.fornecedor.update({
        where: { id },
        data,
        include: {
          _count: {
            select: { insumos: true, precos: true }
          }
        }
      })
    })
  })

  await logUserAction(user.id, 'update', 'fornecedores', id, 'fornecedor', data, request)

  return createSuccessResponse(fornecedor)
})

export const DELETE = withErrorHandler(async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await authenticateWithPermission('fornecedores', 'admin')

  const existingFornecedor = await withDatabaseRetry(async () => {
    return await prisma.fornecedor.findFirst({
      where: { id, userId: user.id }
    })
  })

  if (!existingFornecedor) {
    return createNotFoundResponse('Fornecedor')
  }

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.fornecedor.delete({
        where: { id }
      })
    })
  })

  await logUserAction(user.id, 'delete', 'fornecedores', id, 'fornecedor', { nome: existingFornecedor.nome }, request)

  return createSuccessResponse({ message: 'Fornecedor deletado com sucesso' })
})
