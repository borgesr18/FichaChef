import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { insumoSchema } from '@/lib/validations'
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
  const user = await authenticateWithPermission('insumos', 'write')

  const body = await request.json()
  
  const validationResult = insumoSchema.safeParse(body)
  
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message).join(', ')
    return createValidationErrorResponse(errors)
  }

  const data = validationResult.data

  const existingInsumo = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.findFirst({
        where: { id, userId: user.id }
      })
    })
  })

  if (!existingInsumo) {
    return createNotFoundResponse('Insumo')
  }

  const insumo = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.update({
        where: { id },
        data,
        include: {
          categoria: true,
          unidadeCompra: true
        }
      })
    })
  })

  await logUserAction(user.id, 'update', 'insumos', id, 'insumo', data, request)

  return createSuccessResponse(insumo)
})

export const DELETE = withErrorHandler(async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await authenticateWithPermission('insumos', 'admin')

  const existingInsumo = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.findFirst({
        where: { id, userId: user.id }
      })
    })
  })

  if (!existingInsumo) {
    return createNotFoundResponse('Insumo')
  }

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.insumo.delete({
        where: { id }
      })
    })
  })

  await logUserAction(user.id, 'delete', 'insumos', id, 'insumo', { nome: existingInsumo.nome }, request)

  return createSuccessResponse({ message: 'Insumo deletado com sucesso' })
})
