import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  authenticateUser, 
  createUnauthorizedResponse, 
  createValidationErrorResponse, 
  createServerErrorResponse,
  createSuccessResponse 
} from '@/lib/auth'
import { devProducoes, shouldUseDevData, simulateApiDelay } from '@/lib/dev-data'

export async function GET() {
  try {
    const user = await authenticateUser()
    
    if (!user) {
      return createUnauthorizedResponse()
    }

    // Usar dados de desenvolvimento se necessário
    if (shouldUseDevData()) {
      console.log('🔧 Usando dados de desenvolvimento para produção')
      await simulateApiDelay()
      return createSuccessResponse(devProducoes)
    }

    const producoes = await prisma.producao.findMany({
      where: { userId: user.id },
      include: {
        fichaTecnica: true
      },
      orderBy: { dataProducao: 'desc' }
    })

    return createSuccessResponse(producoes)
  } catch (error) {
    console.error('Error fetching produções:', error)
    
    // Em desenvolvimento, retornar dados fake se houver erro no banco
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 Erro no banco, usando dados de desenvolvimento')
      await simulateApiDelay()
      return createSuccessResponse(devProducoes)
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
    const { fichaTecnicaId, dataProducao, dataValidade, quantidadeProduzida, lote } = body

    if (!fichaTecnicaId || !dataProducao || !quantidadeProduzida) {
      return createValidationErrorResponse('Campos obrigatórios: ficha técnica, data de produção e quantidade')
    }

    // Usar dados de desenvolvimento se necessário
    if (shouldUseDevData()) {
      console.log('🔧 Simulando criação de produção em desenvolvimento')
      await simulateApiDelay()
      const novaProducao = {
        id: Date.now().toString(),
        fichaTecnicaId,
        dataProducao,
        dataValidade: dataValidade || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        quantidadeProduzida: parseInt(quantidadeProduzida),
        lote: lote || `LOTE-${Date.now()}`,
        userId: user.id,
        fichaTecnica: { nome: 'Ficha Exemplo' }
      }
      return createSuccessResponse(novaProducao, 201)
    }

    const producao = await prisma.producao.create({
      data: {
        fichaTecnicaId,
        dataProducao: new Date(dataProducao),
        dataValidade: new Date(dataValidade || Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias se não especificado
        quantidadeProduzida: parseInt(quantidadeProduzida),
        lote: lote || `LOTE-${Date.now()}`,
        userId: user.id
      },
      include: {
        fichaTecnica: true
      }
    })

    return createSuccessResponse(producao, 201)
  } catch (error) {
    console.error('Error creating produção:', error)
    return createServerErrorResponse()
  }
}

