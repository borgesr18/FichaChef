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
import { devInsumos, shouldUseDevData, simulateApiDelay } from '@/lib/dev-data'

export async function GET() {
  try {
    const user = await authenticateUser()
    
    if (!user) {
      return createUnauthorizedResponse()
    }

    // Usar dados de desenvolvimento se necessário
    if (shouldUseDevData()) {
      console.log('🔧 Usando dados de desenvolvimento para insumos')
      await simulateApiDelay()
      return createSuccessResponse(devInsumos)
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
    
    // Em desenvolvimento, retornar dados fake se houver erro no banco
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 Erro no banco, usando dados de desenvolvimento')
      await simulateApiDelay()
      return createSuccessResponse(devInsumos)
    }
    
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

    // Usar dados de desenvolvimento se necessário
    if (shouldUseDevData()) {
      console.log('🔧 Simulando criação de insumo em desenvolvimento')
      await simulateApiDelay()
      const novoInsumo = {
        id: Date.now().toString(),
        ...data,
        userId: user.id,
        categoria: { id: data.categoriaId, nome: 'Categoria Exemplo' },
        unidadeCompra: { id: data.unidadeCompraId, nome: 'Unidade Exemplo', abreviacao: 'un' }
      }
      return createSuccessResponse(novoInsumo, 201)
    }

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
