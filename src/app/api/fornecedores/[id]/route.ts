import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fornecedorSchema } from '@/lib/validations'
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
    const validationResult = fornecedorSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message).join(', ')
      return createValidationErrorResponse(errors)
    }

    const data = validationResult.data

    const existingFornecedor = await prisma.fornecedor.findFirst({
      where: { id, userId: user.id }
    })

    if (!existingFornecedor) {
      return createNotFoundResponse('Fornecedor')
    }

    const fornecedor = await prisma.fornecedor.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { insumos: true, precos: true }
        }
      }
    })

    return createSuccessResponse(fornecedor)
  } catch (error) {
    console.error('Error updating fornecedor:', error)
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

    const existingFornecedor = await prisma.fornecedor.findFirst({
      where: { id, userId: user.id }
    })

    if (!existingFornecedor) {
      return createNotFoundResponse('Fornecedor')
    }

    await prisma.fornecedor.delete({
      where: { id }
    })

    return createSuccessResponse({ message: 'Fornecedor deletado com sucesso' })
  } catch (error) {
    console.error('Error deleting fornecedor:', error)
    return createServerErrorResponse()
  }
}
