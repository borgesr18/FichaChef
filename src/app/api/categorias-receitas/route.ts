import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  authenticateUser, 
  createUnauthorizedResponse, 
  createValidationErrorResponse, 
  createServerErrorResponse,
  createSuccessResponse 
} from '@/lib/auth'
import { devCategoriasReceitas, shouldUseDevData, simulateApiDelay } from '@/lib/dev-data'

export async function GET() {
  try {
    const user = await authenticateUser()
    
    if (!user) {
      return createUnauthorizedResponse()
    }

    // Usar dados de desenvolvimento se necessário
    if (shouldUseDevData()) {
      console.log('🔧 Usando dados de desenvolvimento para categorias de receitas')
      await simulateApiDelay()
      return createSuccessResponse(devCategoriasReceitas)
    }

    const categorias = await prisma.categoriaReceita.findMany({
      where: { userId: user.id },
      orderBy: { nome: 'asc' }
    })

    return createSuccessResponse(categorias)
  } catch (error) {
    console.error('Error fetching categorias receitas:', error)
    
    // Em desenvolvimento, retornar dados fake se houver erro no banco
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 Erro no banco, usando dados de desenvolvimento')
      await simulateApiDelay()
      return createSuccessResponse(devCategoriasReceitas)
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
    const { nome, descricao } = body

    if (!nome) {
      return createValidationErrorResponse('Nome é obrigatório')
    }

    // Usar dados de desenvolvimento se necessário
    if (shouldUseDevData()) {
      console.log('🔧 Simulando criação de categoria de receita em desenvolvimento')
      await simulateApiDelay()
      const novaCategoria = {
        id: Date.now().toString(),
        nome,
        descricao: descricao || '',
        userId: user.id
      }
      return createSuccessResponse(novaCategoria, 201)
    }

    const categoria = await prisma.categoriaReceita.create({
      data: {
        nome,
        descricao,
        userId: user.id
      }
    })

    return createSuccessResponse(categoria, 201)
  } catch (error) {
    console.error('Error creating categoria receita:', error)
    return createServerErrorResponse()
  }
}

