import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  authenticateUser, 
  createUnauthorizedResponse, 
  createValidationErrorResponse, 
  createServerErrorResponse,
  createSuccessResponse 
} from '@/lib/auth'
import { devProdutos, shouldUseDevData, simulateApiDelay } from '@/lib/dev-data'

export async function GET() {
  try {
    const user = await authenticateUser()
    
    if (!user) {
      return createUnauthorizedResponse()
    }

    // Usar dados de desenvolvimento se necessário
    if (shouldUseDevData()) {
      console.log('🔧 Usando dados de desenvolvimento para produtos')
      await simulateApiDelay()
      return createSuccessResponse(devProdutos)
    }

    const produtos = await prisma.produto.findMany({
      where: { userId: user.id },
      orderBy: { nome: 'asc' }
    })

    return createSuccessResponse(produtos)
  } catch (error) {
    console.error('Error fetching produtos:', error)
    
    // Em desenvolvimento, retornar dados fake se houver erro no banco
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 Erro no banco, usando dados de desenvolvimento')
      await simulateApiDelay()
      return createSuccessResponse(devProdutos)
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
    const { nome, descricao, precoVenda, fichaTecnicaId } = body

    if (!nome || !precoVenda) {
      return createValidationErrorResponse('Campos obrigatórios: nome e preço de venda')
    }

    // Usar dados de desenvolvimento se necessário
    if (shouldUseDevData()) {
      console.log('🔧 Simulando criação de produto em desenvolvimento')
      await simulateApiDelay()
      const novoProduto = {
        id: Date.now().toString(),
        nome,
        descricao: descricao || '',
        precoVenda: parseFloat(precoVenda),
        fichaTecnicaId: fichaTecnicaId || null,
        userId: user.id
      }
      return createSuccessResponse(novoProduto, 201)
    }

    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao: descricao || '',
        precoVenda: parseFloat(precoVenda),
        fichaTecnicaId: fichaTecnicaId || null,
        userId: user.id
      }
    })

    return createSuccessResponse(produto, 201)
  } catch (error) {
    console.error('Error creating produto:', error)
    return createServerErrorResponse()
  }
}

