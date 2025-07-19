import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { insumoSchema } from '@/lib/validations'
import { 
  authenticateUser, 
  createUnauthorizedResponse, 
  createValidationErrorResponse, 
  createServerErrorResponse,
  createSuccessResponse,
  createNotFoundResponse
} from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await authenticateUser()
    
    if (!user) {
      return createUnauthorizedResponse()
    }

    const body = await request.json()
    
    // Validação com Zod
    const validationResult = insumoSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message).join(', ')
      return createValidationErrorResponse(errors)
    }

    const data = validationResult.data

    // Verificar se o insumo existe e pertence ao usuário
    const existingInsumo = await prisma.insumo.findFirst({
      where: { id, userId: user.id }
    })

    if (!existingInsumo) {
      return createNotFoundResponse('Insumo')
    }

    const insumo = await prisma.insumo.update({
      where: { id },
      data,
      include: {
        categoria: true,
        unidadeCompra: true
      }
    })

    return createSuccessResponse(insumo)
  } catch (error) {
    console.error('Error updating insumo:', error)
    return createServerErrorResponse()
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await authenticateUser()
    
    if (!user) {
      return createUnauthorizedResponse()
    }

    // Verificar se o insumo existe e pertence ao usuário
    const existingInsumo = await prisma.insumo.findFirst({
      where: { id, userId: user.id }
    })

    if (!existingInsumo) {
      return createNotFoundResponse('Insumo')
    }

    await prisma.insumo.delete({
      where: { id }
    })

    return createSuccessResponse({ message: 'Insumo deletado com sucesso' })
  } catch (error) {
    console.error('Error deleting insumo:', error)
    return createServerErrorResponse()
  }
}
