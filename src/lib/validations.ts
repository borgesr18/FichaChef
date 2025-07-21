import { z } from 'zod'

// Schema para Insumo
export const insumoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  marca: z.string().optional(),
  fornecedor: z.string().optional(),
  fornecedorId: z.string().optional(),
  categoriaId: z.string().min(1, 'Categoria é obrigatória'),
  unidadeCompraId: z.string().min(1, 'Unidade de compra é obrigatória'),
  pesoLiquidoGramas: z.number().positive('Peso deve ser positivo'),
  precoUnidade: z.number().positive('Preço deve ser positivo'),
})

export type InsumoInput = z.infer<typeof insumoSchema>

// Schema para Ficha Técnica
export const fichaTecnicaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  categoriaId: z.string().min(1, 'Categoria é obrigatória'),
  pesoFinalGramas: z.number().positive('Peso final deve ser positivo'),
  numeroPorcoes: z.number().int().positive('Número de porções deve ser positivo'),
  tempoPreparo: z.number().int().positive().optional(),
  temperaturaForno: z.number().int().positive().optional(),
  modoPreparo: z.string().min(10, 'Modo de preparo deve ter pelo menos 10 caracteres'),
  nivelDificuldade: z.enum(['Fácil', 'Médio', 'Difícil']),
  ingredientes: z.array(z.object({
    insumoId: z.string().min(1, 'Insumo é obrigatório'),
    quantidadeGramas: z.number().positive('Quantidade deve ser positiva'),
  })).min(1, 'Pelo menos um ingrediente é obrigatório'),
})

export type FichaTecnicaInput = z.infer<typeof fichaTecnicaSchema>

// Schema para Categoria
export const categoriaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  descricao: z.string().optional(),
})

export type CategoriaInput = z.infer<typeof categoriaSchema>

// Schema para Unidade de Medida
export const unidadeMedidaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(30, 'Nome muito longo'),
  simbolo: z.string().min(1, 'Símbolo é obrigatório').max(10, 'Símbolo muito longo'),
  tipo: z.enum(['peso', 'volume', 'unidade']),
})

export type UnidadeMedidaInput = z.infer<typeof unidadeMedidaSchema>

// Schema para Produção
export const producaoSchema = z.object({
  fichaTecnicaId: z.string().min(1, 'Ficha técnica é obrigatória'),
  dataProducao: z.date(),
  dataValidade: z.date(),
  quantidadeProduzida: z.number().positive('Quantidade deve ser positiva'),
  lote: z.string().min(1, 'Lote é obrigatório').max(20, 'Lote muito longo'),
})

export type ProducaoInput = z.infer<typeof producaoSchema>

// Schema para Movimentação de Estoque
export const movimentacaoEstoqueSchema = z.object({
  insumoId: z.string().min(1, 'Insumo é obrigatório'),
  tipo: z.enum(['entrada', 'saida']),
  quantidade: z.number().positive('Quantidade deve ser positiva'),
  motivo: z.string().min(1, 'Motivo é obrigatório').max(100, 'Motivo muito longo'),
  lote: z.string().optional(),
  dataValidade: z.date().optional(),
})

export type MovimentacaoEstoqueInput = z.infer<typeof movimentacaoEstoqueSchema>

// Schema para Produto
export const produtoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  precoVenda: z.number().positive('Preço de venda deve ser positivo'),
  margemLucro: z.number().min(0, 'Margem de lucro deve ser positiva'),
  fichas: z.array(z.object({
    fichaTecnicaId: z.string().min(1, 'Ficha técnica é obrigatória'),
    quantidadeGramas: z.number().positive('Quantidade deve ser positiva'),
  })).min(1, 'Pelo menos uma ficha técnica é obrigatória'),
})

export type ProdutoInput = z.infer<typeof produtoSchema>

// Schema para Movimentação de Produto
export const movimentacaoProdutoSchema = z.object({
  produtoId: z.string().min(1, 'Produto é obrigatório'),
  tipo: z.enum(['entrada', 'saida']),
  quantidade: z.number().positive('Quantidade deve ser positiva'),
  motivo: z.string().min(1, 'Motivo é obrigatório').max(100, 'Motivo muito longo'),
  lote: z.string().optional(),
  dataValidade: z.date().optional(),
})

export type MovimentacaoProdutoInput = z.infer<typeof movimentacaoProdutoSchema>

// Schema para Produção de Produto
export const producaoProdutoSchema = z.object({
  produtoId: z.string().min(1, 'Produto é obrigatório'),
  dataProducao: z.date(),
  dataValidade: z.date(),
  quantidadeProduzida: z.number().positive('Quantidade deve ser positiva'),
  lote: z.string().min(1, 'Lote é obrigatório').max(20, 'Lote muito longo'),
})

export type ProducaoProdutoInput = z.infer<typeof producaoProdutoSchema>

// Schema para Fornecedor
export const fornecedorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  contato: z.string().optional(),
  observacoes: z.string().optional(),
  ativo: z.boolean().default(true),
})

export type FornecedorInput = z.infer<typeof fornecedorSchema>

// Schema para Preço de Fornecedor
export const fornecedorPrecoSchema = z.object({
  fornecedorId: z.string().min(1, 'Fornecedor é obrigatório'),
  insumoId: z.string().min(1, 'Insumo é obrigatório'),
  preco: z.number().positive('Preço deve ser positivo'),
  dataVigencia: z.date(),
  ativo: z.boolean().default(true),
  observacoes: z.string().optional(),
})

export type FornecedorPrecoInput = z.infer<typeof fornecedorPrecoSchema>

