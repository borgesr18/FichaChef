import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  authenticateUser, 
  createUnauthorizedResponse, 
  createValidationErrorResponse, 
  createServerErrorResponse,
  createSuccessResponse 
} from '@/lib/auth'
import { devFichasTecnicas, shouldUseDevData, simulateApiDelay } from '@/lib/dev-data'

export async function GET() {
  try {
    const user = await authenticateUser()
    
    if (!user) {
      return createUnauthorizedResponse()
    }

    // Usar dados de desenvolvimento se necessário
    if (shouldUseDevData()) {
      console.log('🔧 Usando dados de desenvolvimento para fichas técnicas')
      await simulateApiDelay()
      return createSuccessResponse(devFichasTecnicas)
    }

    const fichas = await prisma.fichaTecnica.findMany({
      where: { userId: user.id },
      include: {
        categoria: true,
        ingredientes: {
          include: {
            insumo: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    })

    return createSuccessResponse(fichas)
  } catch (error) {
    console.error('Error fetching fichas técnicas:', error)
    
    // Em desenvolvimento, retornar dados fake se houver erro no banco
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 Erro no banco, usando dados de desenvolvimento')
      await simulateApiDelay()
      return createSuccessResponse(devFichasTecnicas)
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
    const { 
      nome, 
      categoriaId, 
      pesoFinalGramas, 
      numeroPorcoes, 
      tempoPreparo, 
      temperaturaForno, 
      modoPreparo, 
      nivelDificuldade,
      ingredientes 
    } = body

    if (!nome || !categoriaId || !pesoFinalGramas || !numeroPorcoes || !modoPreparo || !nivelDificuldade) {
      return createValidationErrorResponse('Campos obrigatórios: nome, categoria, peso final, porções, modo de preparo e nível de dificuldade')
    }

    // Usar dados de desenvolvimento se necessário
    if (shouldUseDevData()) {
      console.log('🔧 Simulando criação de ficha técnica em desenvolvimento')
      await simulateApiDelay()
      const novaFicha = {
        id: Date.now().toString(),
        nome,
        categoriaId,
        pesoFinalGramas: parseFloat(pesoFinalGramas),
        numeroPorcoes: parseInt(numeroPorcoes),
        tempoPreparo: tempoPreparo ? parseInt(tempoPreparo) : null,
        temperaturaForno: temperaturaForno ? parseInt(temperaturaForno) : null,
        modoPreparo,
        nivelDificuldade,
        userId: user.id,
        categoria: { nome: 'Categoria Exemplo' },
        ingredientes: []
      }
      return createSuccessResponse(novaFicha, 201)
    }

    const ficha = await prisma.fichaTecnica.create({
      data: {
        nome,
        categoriaId,
        pesoFinalGramas: parseFloat(pesoFinalGramas),
        numeroPorcoes: parseInt(numeroPorcoes),
        tempoPreparo: tempoPreparo ? parseInt(tempoPreparo) : null,
        temperaturaForno: temperaturaForno ? parseInt(temperaturaForno) : null,
        modoPreparo,
        nivelDificuldade,
        userId: user.id,
        ingredientes: {
          create: ingredientes?.map((ing: { insumoId: string; quantidadeGramas: string }) => ({
            insumoId: ing.insumoId,
            quantidadeGramas: parseFloat(ing.quantidadeGramas)
          })) || []
        }
      },
      include: {
        categoria: true,
        ingredientes: {
          include: {
            insumo: true
          }
        }
      }
    })

    return createSuccessResponse(ficha, 201)
  } catch (error) {
    console.error('Error creating ficha técnica:', error)
    return createServerErrorResponse()
  }
}

