import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

// ✅ SCHEMA DE VALIDAÇÃO CORRIGIDO COM z.coerce
const insumoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  marca: z.string().optional(),
  fornecedor: z.string().optional(),
  categoriaId: z.string().min(1, "Categoria é obrigatória"),
  unidadeCompraId: z.string().min(1, "Unidade de compra é obrigatória"),
  fornecedorId: z.string().optional(),
  
  // ✅ CAMPOS NUMÉRICOS COM z.coerce (RESOLVE "Expected number, received string")
  pesoLiquidoGramas: z.coerce.number().positive("Peso líquido deve ser positivo"),
  precoUnidade: z.coerce.number().positive("Preço por unidade deve ser positivo"),
  
  // ✅ INFORMAÇÕES NUTRICIONAIS OPCIONAIS
  calorias: z.coerce.number().min(0).optional().nullable(),
  proteinas: z.coerce.number().min(0).optional().nullable(),
  carboidratos: z.coerce.number().min(0).optional().nullable(),
  gorduras: z.coerce.number().min(0).optional().nullable(),
  fibras: z.coerce.number().min(0).optional().nullable(),
  sodio: z.coerce.number().min(0).optional().nullable(),
  
  // ✅ CÓDIGO TACO COM z.coerce
  codigoTaco: z.coerce.number().int().positive().optional().nullable(),
  
  fonteDados: z.string().default("manual")
})

const prisma = new PrismaClient()

// ✅ FUNÇÃO PARA CRIAR CLIENTE SUPABASE
async function createSupabaseClient() {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas')
  }
  
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// ✅ FUNÇÃO PARA VERIFICAR AUTENTICAÇÃO
async function verifyAuth() {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('Erro na verificação de autenticação:', error)
    return null
  }
}

// ✅ GET - LISTAR INSUMOS
export async function GET(request: NextRequest) {
  try {
    // ✅ VERIFICAR AUTENTICAÇÃO
    const user = await verifyAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // ✅ BUSCAR INSUMOS DO USUÁRIO
    const insumos = await prisma.insumo.findMany({
      where: {
        userId: user.id
      },
      include: {
        categoria: true,
        unidadeCompra: true,
        fornecedorRel: true,
        tacoAlimento: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(insumos)

  } catch (error) {
    console.error('Erro ao buscar insumos:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar insumos',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// ✅ POST - CRIAR INSUMO
export async function POST(request: NextRequest) {
  try {
    // ✅ VERIFICAR AUTENTICAÇÃO
    const user = await verifyAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // ✅ OBTER DADOS DO CORPO DA REQUISIÇÃO
    const body = await request.json()
    
    // ✅ VALIDAR DADOS COM ZOD (z.coerce resolve conversão automática)
    const validationResult = insumoSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: errors
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // ✅ VERIFICAR SE CATEGORIA EXISTE
    const categoria = await prisma.categoriaInsumo.findFirst({
      where: {
        id: data.categoriaId,
        userId: user.id
      }
    })

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // ✅ VERIFICAR SE UNIDADE DE MEDIDA EXISTE
    const unidade = await prisma.unidadeMedida.findFirst({
      where: {
        id: data.unidadeCompraId,
        userId: user.id
      }
    })

    if (!unidade) {
      return NextResponse.json(
        { error: 'Unidade de medida não encontrada' },
        { status: 404 }
      )
    }

    // ✅ VERIFICAR SE FORNECEDOR EXISTE (SE FORNECIDO)
    if (data.fornecedorId) {
      const fornecedor = await prisma.fornecedor.findFirst({
        where: {
          id: data.fornecedorId,
          userId: user.id
        }
      })

      if (!fornecedor) {
        return NextResponse.json(
          { error: 'Fornecedor não encontrado' },
          { status: 404 }
        )
      }
    }

    // ✅ CRIAR INSUMO
    const insumo = await prisma.insumo.create({
      data: {
        ...data,
        userId: user.id
      },
      include: {
        categoria: true,
        unidadeCompra: true,
        fornecedorRel: true,
        tacoAlimento: true
      }
    })

    return NextResponse.json(insumo, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar insumo:', error)
    
    // ✅ TRATAMENTO ESPECÍFICO DE ERROS DO PRISMA
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Insumo com este nome já existe' },
          { status: 409 }
        )
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Referência inválida (categoria, unidade ou fornecedor)' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Erro ao criar insumo',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// ✅ PUT - ATUALIZAR INSUMO
export async function PUT(request: NextRequest) {
  try {
    // ✅ VERIFICAR AUTENTICAÇÃO
    const user = await verifyAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // ✅ OBTER ID DA URL
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do insumo é obrigatório' },
        { status: 400 }
      )
    }

    // ✅ OBTER DADOS DO CORPO
    const body = await request.json()
    
    // ✅ VALIDAR DADOS
    const validationResult = insumoSchema.partial().safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: errors
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // ✅ VERIFICAR SE INSUMO EXISTE E PERTENCE AO USUÁRIO
    const insumoExistente = await prisma.insumo.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!insumoExistente) {
      return NextResponse.json(
        { error: 'Insumo não encontrado' },
        { status: 404 }
      )
    }

    // ✅ ATUALIZAR INSUMO
    const insumoAtualizado = await prisma.insumo.update({
      where: { id },
      data,
      include: {
        categoria: true,
        unidadeCompra: true,
        fornecedorRel: true,
        tacoAlimento: true
      }
    })

    return NextResponse.json(insumoAtualizado)

  } catch (error) {
    console.error('Erro ao atualizar insumo:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Erro ao atualizar insumo',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// ✅ DELETE - EXCLUIR INSUMO
export async function DELETE(request: NextRequest) {
  try {
    // ✅ VERIFICAR AUTENTICAÇÃO
    const user = await verifyAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // ✅ OBTER ID DA URL
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do insumo é obrigatório' },
        { status: 400 }
      )
    }

    // ✅ VERIFICAR SE INSUMO EXISTE E PERTENCE AO USUÁRIO
    const insumo = await prisma.insumo.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!insumo) {
      return NextResponse.json(
        { error: 'Insumo não encontrado' },
        { status: 404 }
      )
    }

    // ✅ VERIFICAR SE INSUMO ESTÁ SENDO USADO EM FICHAS TÉCNICAS
    const ingredientesCount = await prisma.ingrediente.count({
      where: {
        insumoId: id
      }
    })

    if (ingredientesCount > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível excluir insumo',
          message: 'Este insumo está sendo usado em fichas técnicas'
        },
        { status: 409 }
      )
    }

    // ✅ EXCLUIR INSUMO
    await prisma.insumo.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Insumo excluído com sucesso' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao excluir insumo:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Erro ao excluir insumo',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// ✅ CLEANUP - FECHAR CONEXÃO PRISMA
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
