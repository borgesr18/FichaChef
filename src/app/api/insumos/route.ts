import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { insumoSchema } from '@/lib/validations'
import { 
  authenticateUser, 
  createUnauthorizedResponse, 
  createValidationErrorResponse, 
  createServerErrorResponse,
  createSuccessResponse 
} from '@/lib/auth'

export async function GET() {
  try {
    const user = await authenticateUser()
    
    if (!user) {
      return createUnauthorizedResponse()
    }

    const insumos = await prisma.insumo.findMany({
      where: { userId: user.id },
      include: {
        categoria: true,
        unidadeCompra: true
      },
      orderBy: { nome: 'asc' }
    })

    return createSuccessResponse(insumos)
  } catch (error) {
    console.error('Error fetching insumos:', error)
    return createServerErrorResponse()
  }
}

export async function POST(request: NextRequest) {
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

    const insumo = await prisma.insumo.create({
      data: {
        ...data,
        userId: user.id
      },
      include: {
        categoria: true,
        unidadeCompra: true
      }
    })

    return createSuccessResponse(insumo, 201)
  } catch (error) {
    console.error('Error creating insumo:', error)
    return createServerErrorResponse()
  }
}
