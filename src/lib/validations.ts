import { z } from 'zod'

// Schema para Insumo
export const insumoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  marca: z.string().optional(),
  fornecedor: z.string().optional(),
  fornecedorId: z.string().optional(),
  categoriaId: z.string().min(1, 'Categoria é obrigatória'),
  unidadeCompraId: z.string().min(1, 'Unidade de compra é obrigatória'),
  pesoLiquidoGramas: z.coerce.number().positive('Peso deve ser positivo'),
  precoUnidade: z.coerce.number().positive('Preço deve ser positivo'),
  calorias: z.coerce.number().min(0, 'Calorias devem ser positivas').optional(),
  proteinas: z.coerce.number().min(0, 'Proteínas devem ser positivas').optional(),
  carboidratos: z.coerce.number().min(0, 'Carboidratos devem ser positivos').optional(),
  gorduras: z.coerce.number().min(0, 'Gorduras devem ser positivas').optional(),
  fibras: z.coerce.number().min(0, 'Fibras devem ser positivas').optional(),
  sodio: z.coerce.number().min(0, 'Sódio deve ser positivo').optional(),
  codigoTaco: z.coerce.number().int().positive().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  fonteDados: z.enum(['taco', 'manual']).default('manual'),
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

// Schema para Configuração de Alerta
export const configuracaoAlertaSchema = z.object({
  tipo: z.enum(['estoque_baixo', 'validade_proxima', 'custo_alto']),
  itemTipo: z.enum(['insumo', 'produto']),
  itemId: z.string().min(1, 'Item é obrigatório'),
  ativo: z.boolean().default(true),
  limiteEstoqueBaixo: z.number().positive().optional(),
  diasAntesVencimento: z.number().int().positive().optional(),
  margemCustoMaxima: z.number().positive().optional(),
})

export type ConfiguracaoAlertaInput = z.infer<typeof configuracaoAlertaSchema>

// Schema para Notificação
export const notificacaoSchema = z.object({
  tipo: z.enum(['estoque_baixo', 'validade_proxima', 'custo_alto']),
  titulo: z.string().min(1, 'Título é obrigatório'),
  mensagem: z.string().min(1, 'Mensagem é obrigatória'),
  itemTipo: z.enum(['insumo', 'produto']),
  itemId: z.string().min(1, 'Item é obrigatório'),
  itemNome: z.string().min(1, 'Nome do item é obrigatório'),
  prioridade: z.enum(['baixa', 'media', 'alta', 'critica']).default('media'),
  lida: z.boolean().default(false),
  dataLimite: z.date().optional(),
  valorAtual: z.number().optional(),
  valorLimite: z.number().optional(),
})

export type NotificacaoInput = z.infer<typeof notificacaoSchema>

// Schema para Escalabilidade de Receita
export const escalabilidadeReceitaSchema = z.object({
  fichaTecnicaId: z.string().min(1, 'Ficha técnica é obrigatória'),
  porcoeDesejadas: z.number().int().positive('Número de porções deve ser positivo').max(1000, 'Máximo 1000 porções'),
})

export type EscalabilidadeReceitaInput = z.infer<typeof escalabilidadeReceitaSchema>

// Schema para Menu
export const menuSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  descricao: z.string().optional(),
  tipo: z.enum(['cafe_manha', 'almoco', 'jantar', 'lanche']),
  ativo: z.boolean().default(true),
  itens: z.array(z.object({
    produtoId: z.string().min(1, 'Produto é obrigatório'),
    quantidade: z.number().int().positive('Quantidade deve ser positiva'),
    observacoes: z.string().optional(),
  })).min(1, 'Pelo menos um item é obrigatório'),
})

export type MenuInput = z.infer<typeof menuSchema>

// Schema para MenuItem
export const menuItemSchema = z.object({
  menuId: z.string().min(1, 'Menu é obrigatório'),
  produtoId: z.string().min(1, 'Produto é obrigatório'),
  quantidade: z.number().int().positive('Quantidade deve ser positiva'),
  observacoes: z.string().optional(),
})

export type MenuItemInput = z.infer<typeof menuItemSchema>

// Schema para MenuPeriodo
export const menuPeriodoSchema = z.object({
  menuId: z.string().min(1, 'Menu é obrigatório'),
  dataInicio: z.date(),
  dataFim: z.date(),
  tipo: z.enum(['semanal', 'mensal', 'personalizado']),
  ativo: z.boolean().default(true),
  observacoes: z.string().optional(),
})

export type MenuPeriodoInput = z.infer<typeof menuPeriodoSchema>

export const analiseTemporalSchema = z.object({
  insumoId: z.string().min(1, 'Insumo é obrigatório').optional(),
  fornecedorId: z.string().min(1, 'Fornecedor é obrigatório').optional(),
  dataInicio: z.date(),
  dataFim: z.date(),
  periodo: z.enum(['mensal', 'trimestral', 'anual', 'monthly', 'quarterly', 'yearly']).default('mensal'),
  mesesProjecao: z.number().int().min(1).max(24).default(6),
})

export type AnaliseTemporalInput = z.infer<typeof analiseTemporalSchema>

