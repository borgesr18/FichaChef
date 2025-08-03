import { z } from 'zod'

// ✅ SCHEMA DE VALIDAÇÃO CORRIGIDO PARA INSUMOS
// Resolve "Expected number, received string" usando z.coerce

export const insumoSchema = z.object({
  // ✅ CAMPOS DE TEXTO
  nome: z.string().min(1, "Nome é obrigatório"),
  marca: z.string().optional(),
  fornecedor: z.string().optional(),
  
  // ✅ RELACIONAMENTOS
  categoriaId: z.string().min(1, "Categoria é obrigatória"),
  unidadeCompraId: z.string().min(1, "Unidade de compra é obrigatória"),
  fornecedorId: z.string().optional(),
  
  // ✅ CAMPOS NUMÉRICOS COM z.coerce (RESOLVE O PROBLEMA)
  pesoLiquidoGramas: z.coerce.number().positive("Peso líquido deve ser positivo"),
  precoUnidade: z.coerce.number().positive("Preço por unidade deve ser positivo"),
  
  // ✅ INFORMAÇÕES NUTRICIONAIS OPCIONAIS COM z.coerce
  calorias: z.coerce.number().min(0).optional().nullable(),
  proteinas: z.coerce.number().min(0).optional().nullable(),
  carboidratos: z.coerce.number().min(0).optional().nullable(),
  gorduras: z.coerce.number().min(0).optional().nullable(),
  fibras: z.coerce.number().min(0).optional().nullable(),
  sodio: z.coerce.number().min(0).optional().nullable(),
  
  // ✅ CÓDIGO TACO COM z.coerce
  codigoTaco: z.coerce.number().int().positive().optional().nullable(),
  
  // ✅ OUTROS CAMPOS
  fonteDados: z.string().default("manual"),
  userId: z.string().optional()
})

// ✅ SCHEMA PARA FICHA TÉCNICA
export const fichaTecnicaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  categoriaId: z.string().min(1, "Categoria é obrigatória"),
  
  // ✅ CAMPOS NUMÉRICOS COM z.coerce
  pesoFinalGramas: z.coerce.number().positive("Peso final deve ser positivo"),
  numeroPorcoes: z.coerce.number().int().positive("Número de porções deve ser positivo"),
  tempoPreparo: z.coerce.number().int().min(0).optional().nullable(),
  temperaturaForno: z.coerce.number().int().min(0).optional().nullable(),
  
  // ✅ CAMPOS DE TEXTO
  modoPreparo: z.string().min(1, "Modo de preparo é obrigatório"),
  nivelDificuldade: z.enum(["facil", "medio", "dificil"]),
  
  userId: z.string().optional()
})

// ✅ SCHEMA PARA INGREDIENTE
export const ingredienteSchema = z.object({
  fichaTecnicaId: z.string().min(1, "ID da ficha técnica é obrigatório"),
  insumoId: z.string().min(1, "ID do insumo é obrigatório"),
  
  // ✅ QUANTIDADE COM z.coerce
  quantidadeGramas: z.coerce.number().positive("Quantidade deve ser positiva")
})

// ✅ SCHEMA PARA PRODUTO
export const produtoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  
  // ✅ CAMPOS FINANCEIROS COM z.coerce
  precoVenda: z.coerce.number().positive("Preço de venda deve ser positivo"),
  margemLucro: z.coerce.number().min(0).max(100, "Margem deve estar entre 0 e 100%"),
  
  userId: z.string().optional()
})

// ✅ SCHEMA PARA FORNECEDOR
export const fornecedorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  contato: z.string().optional(),
  observacoes: z.string().optional(),
  ativo: z.boolean().default(true),
  userId: z.string().optional()
})

// ✅ SCHEMA PARA PREÇO DE FORNECEDOR
export const fornecedorPrecoSchema = z.object({
  fornecedorId: z.string().min(1, "ID do fornecedor é obrigatório"),
  insumoId: z.string().min(1, "ID do insumo é obrigatório"),
  
  // ✅ PREÇO COM z.coerce
  preco: z.coerce.number().positive("Preço deve ser positivo"),
  
  dataVigencia: z.string().min(1, "Data de vigência é obrigatória"),
  ativo: z.boolean().default(true),
  observacoes: z.string().optional(),
  userId: z.string().optional()
})

// ✅ SCHEMA PARA MOVIMENTAÇÃO DE ESTOQUE
export const movimentacaoEstoqueSchema = z.object({
  insumoId: z.string().min(1, "ID do insumo é obrigatório"),
  tipo: z.enum(["entrada", "saida", "ajuste"]),
  
  // ✅ QUANTIDADE COM z.coerce
  quantidade: z.coerce.number().positive("Quantidade deve ser positiva"),
  
  motivo: z.string().min(1, "Motivo é obrigatório"),
  lote: z.string().optional(),
  dataValidade: z.string().optional(),
  userId: z.string().optional()
})

// ✅ SCHEMA PARA PRODUÇÃO
export const producaoSchema = z.object({
  fichaTecnicaId: z.string().min(1, "ID da ficha técnica é obrigatório"),
  dataProducao: z.string().min(1, "Data de produção é obrigatória"),
  dataValidade: z.string().min(1, "Data de validade é obrigatória"),
  
  // ✅ QUANTIDADE COM z.coerce
  quantidadeProduzida: z.coerce.number().positive("Quantidade produzida deve ser positiva"),
  
  lote: z.string().min(1, "Lote é obrigatório"),
  userId: z.string().optional()
})

// ✅ SCHEMA PARA MENU
export const menuSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  tipo: z.enum(["cafe_manha", "almoco", "jantar", "lanche"]),
  ativo: z.boolean().default(true),
  userId: z.string().optional()
})

// ✅ SCHEMA PARA ITEM DO MENU
export const menuItemSchema = z.object({
  menuId: z.string().min(1, "ID do menu é obrigatório"),
  produtoId: z.string().min(1, "ID do produto é obrigatório"),
  
  // ✅ QUANTIDADE COM z.coerce
  quantidade: z.coerce.number().int().positive("Quantidade deve ser positiva"),
  
  observacoes: z.string().optional()
})

// ✅ SCHEMA PARA CONFIGURAÇÃO DE ALERTA
export const configuracaoAlertaSchema = z.object({
  tipo: z.enum(["estoque_baixo", "validade_proxima", "custo_alto"]),
  itemTipo: z.enum(["insumo", "produto"]),
  itemId: z.string().min(1, "ID do item é obrigatório"),
  ativo: z.boolean().default(true),
  
  // ✅ CAMPOS NUMÉRICOS OPCIONAIS COM z.coerce
  limiteEstoqueBaixo: z.coerce.number().min(0).optional().nullable(),
  diasAntesVencimento: z.coerce.number().int().min(0).optional().nullable(),
  margemCustoMaxima: z.coerce.number().min(0).max(100).optional().nullable(),
  
  userId: z.string().optional()
})

// ✅ TIPOS TYPESCRIPT DERIVADOS DOS SCHEMAS
export type InsumoInput = z.infer<typeof insumoSchema>
export type FichaTecnicaInput = z.infer<typeof fichaTecnicaSchema>
export type IngredienteInput = z.infer<typeof ingredienteSchema>
export type ProdutoInput = z.infer<typeof produtoSchema>
export type FornecedorInput = z.infer<typeof fornecedorSchema>
export type FornecedorPrecoInput = z.infer<typeof fornecedorPrecoSchema>
export type MovimentacaoEstoqueInput = z.infer<typeof movimentacaoEstoqueSchema>
export type ProducaoInput = z.infer<typeof producaoSchema>
export type MenuInput = z.infer<typeof menuSchema>
export type MenuItemInput = z.infer<typeof menuItemSchema>
export type ConfiguracaoAlertaInput = z.infer<typeof configuracaoAlertaSchema>

// ✅ FUNÇÃO HELPER PARA VALIDAÇÃO COM TRATAMENTO DE ERRO
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      )
      return { success: false, errors }
    }
    return { success: false, errors: ['Erro de validação desconhecido'] }
  }
}

// ✅ FUNÇÃO HELPER PARA VALIDAÇÃO SEGURA (SAFE PARSE)
export function safeValidateSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  error?: z.ZodError
} {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, error: result.error }
  }
}
