import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry } from '@/lib/database-utils'
import { insumoSchema } from '@/lib/validations'
import { 
  authenticateWithPermission, 
  createValidationErrorResponse, 
  createServerErrorResponse,
  createSuccessResponse,
  createNotFoundResponse
} from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await authenticateWithPermission('insumos', 'write')

    const body = await request.json()
    
    // Validação com Zod
    const validationResult = insumoSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message).join(', ')
      return createValidationErrorResponse(errors)
    }

    const data = validationResult.data

    // Verificar se o insumo existe e pertence ao usuário
    const existingInsumo = await withDatabaseRetry(async () => {
      return await prisma.insumo.findFirst({
        where: { id, userId: user.id }
      })
    })

    if (!existingInsumo) {
      return createNotFoundResponse('Insumo')
    }

    const insumo = await withDatabaseRetry(async () => {
      return await prisma.insumo.update({
        where: { id },
        data,
        include: {
          categoria: true,
          unidadeCompra: true
        }
      })
    })

    await logUserAction(user.id, 'update', 'insumos', id, 'insumo', data, request)

    return createSuccessResponse(insumo)
  } catch (error) {
    console.error('Error updating insumo:', error)
    return createServerErrorResponse()
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await authenticateWithPermission('insumos', 'admin')

    // Verificar se o insumo existe e pertence ao usuário
    const existingInsumo = await withDatabaseRetry(async () => {
      return await prisma.insumo.findFirst({
        where: { id, userId: user.id }
      })
    })

    if (!existingInsumo) {
      return createNotFoundResponse('Insumo')
    }

    await withDatabaseRetry(async () => {
      return await prisma.insumo.delete({
        where: { id }
      })
    })

    await logUserAction(user.id, 'delete', 'insumos', id, 'insumo', { nome: existingInsumo.nome }, request)

    return createSuccessResponse({ message: 'Insumo deletado com sucesso' })
  } catch (error) {
    console.error('Error deleting insumo:', error)
    return createServerErrorResponse()
  }
}
