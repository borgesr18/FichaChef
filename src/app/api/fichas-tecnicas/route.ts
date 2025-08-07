import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// ✅ Interface para resposta de sucesso
interface SuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

// ✅ Função para criar resposta de sucesso
function createSuccessResponse<T>(data: T, status = 200, message?: string): Response {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message })
  }
  
  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

// ✅ Função para criar resposta de erro
function createErrorResponse(message: string, status = 400): Response {
  return new Response(JSON.stringify({
    success: false,
    error: message
  }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

// ✅ Função simplificada de autenticação
async function getAuthenticatedUser(): Promise<{ id: string; email: string } | null> {
  try {
    // Para desenvolvimento, sempre retorna um usuário válido
    // Em produção, você pode implementar a verificação real
    return {
      id: 'temp-user-id',
      email: 'user@example.com'
    }
  } catch (error) {
    console.error('❌ [FICHAS API] Erro na autenticação:', error)
    return null
  }
}

export async function GET(): Promise<Response> {
  console.log('🔍 [FICHAS API] Iniciando GET /api/fichas-tecnicas')
  
  try {
    const user = await getAuthenticatedUser()
    
    if (!user) {
      console.log('❌ [FICHAS API] Usuário não autenticado')
      return createErrorResponse('Não autorizado', 401)
    }
    
    console.log('✅ [FICHAS API] Usuário autenticado:', user.email)
    
    // ✅ Buscar fichas técnicas diretamente no banco
    const fichas = await prisma.fichaTecnica.findMany({
      include: {
        categoria: true,
        ingredientes: {
          include: {
            insumo: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    })
    
    console.log('🔍 [FICHAS API] Fichas encontradas no banco:', fichas.length)
    console.log('🔍 [FICHAS API] Primeira ficha (se existir):', fichas[0]?.nome || 'Nenhuma')
    
    // ✅ Retornar array diretamente (não wrapped em objeto)
    return new Response(JSON.stringify(fichas), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('❌ [FICHAS API] Erro no GET:', error)
    return createErrorResponse('Erro interno do servidor', 500)
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  console.log('🔍 [FICHAS API] Iniciando POST /api/fichas-tecnicas')
  
  try {
    const user = await getAuthenticatedUser()
    
    if (!user) {
      console.log('❌ [FICHAS API] Usuário não autenticado')
      return createErrorResponse('Não autorizado', 401)
    }
    
    const body = await request.json()
    console.log('🔍 [FICHAS API] Dados recebidos:', body)
    
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
    
    // ✅ Validação básica
    if (!nome || !categoriaId || !pesoFinalGramas || !numeroPorcoes) {
      return createErrorResponse('Campos obrigatórios: nome, categoriaId, pesoFinalGramas, numeroPorcoes')
    }
    
    console.log('✅ [FICHAS API] Criando ficha técnica:', nome)
    
    // ✅ Criar ficha técnica
    const novaFicha = await prisma.fichaTecnica.create({
      data: {
        nome,
        categoriaId,
        pesoFinalGramas: Number(pesoFinalGramas),
        numeroPorcoes: Number(numeroPorcoes),
        tempoPreparo: tempoPreparo ? Number(tempoPreparo) : null,
        temperaturaForno: temperaturaForno ? Number(temperaturaForno) : null,
        modoPreparo: modoPreparo || '',
        nivelDificuldade: nivelDificuldade || 'Fácil',
        userId: user.id,
        ingredientes: {
          create: ingredientes?.map((ing: { insumoId: string; quantidadeGramas: number }) => ({
            insumoId: ing.insumoId,
            quantidadeGramas: Number(ing.quantidadeGramas),
          })) || [],
        },
      },
      include: {
        categoria: true,
        ingredientes: {
          include: {
            insumo: true,
          },
        },
      },
    })
    
    console.log('✅ [FICHAS API] Ficha criada com sucesso:', novaFicha.id)
    
    return createSuccessResponse(novaFicha, 201, 'Ficha técnica criada com sucesso')
    
  } catch (error) {
    console.error('❌ [FICHAS API] Erro no POST:', error)
    return createErrorResponse('Erro ao criar ficha técnica', 500)
  }
}

// ✅ CORREÇÕES APLICADAS:
// 🔧 Removido parâmetro 'request' não utilizado do GET
// 🔧 Adicionado tipos explícitos para todas as funções
// 🔧 Mantida funcionalidade completa
// 🔧 Compatível com ESLint strict

