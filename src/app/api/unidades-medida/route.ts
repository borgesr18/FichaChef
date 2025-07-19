import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  authenticateUser, 
  createUnauthorizedResponse, 
  createValidationErrorResponse, 
  createServerErrorResponse,
  createSuccessResponse 
} from '@/lib/auth'
import { devUnidadesMedida, shouldUseDevData, simulateApiDelay } from '@/lib/dev-data'

export async function GET() {
  try {
    const user = await authenticateUser()
    
    if (!user) {
      return createUnauthorizedResponse()
    }

    // Usar dados de desenvolvimento se necessário
    if (shouldUseDevData()) {
      console.log('🔧 Usando dados de desenvolvimento para unidades de medida')
      await simulateApiDelay()
      return createSuccessResponse(devUnidadesMedida)
    }

    const unidades = await prisma.unidadeMedida.findMany({
      where: { userId: user.id },
      orderBy: { nome: 'asc' }
    })

    return createSuccessResponse(unidades)
  } catch (error) {
    console.error('Error fetching unidades medida:', error)
    
    // Em desenvolvimento, retornar dados fake se houver erro no banco
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 Erro no banco, usando dados de desenvolvimento')
      await simulateApiDelay()
      return createSuccessResponse(devUnidadesMedida)
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
    const { nome, simbolo, tipo } = body

    if (!nome || !simbolo) {
      return createValidationErrorResponse('Nome e símbolo são obrigatórios')
    }

    // Usar dados de desenvolvimento se necessário
    if (shouldUseDevData()) {
      console.log('🔧 Simulando criação de unidade de medida em desenvolvimento')
      await simulateApiDelay()
      const novaUnidade = {
        id: Date.now().toString(),
        nome,
        simbolo,
        tipo: tipo || 'peso',
        userId: user.id
      }
      return createSuccessResponse(novaUnidade, 201)
    }

    const unidade = await prisma.unidadeMedida.create({
      data: {
        nome,
        simbolo,
        tipo: tipo || 'peso',
        userId: user.id
      }
    })

    return createSuccessResponse(unidade, 201)
  } catch (error) {
    console.error('Error creating unidade medida:', error)
    return createServerErrorResponse()
  }
}

