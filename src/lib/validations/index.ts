// ✅ ARQUIVO DE ÍNDICE PARA VALIDAÇÕES
// Exporta todos os schemas de validação do sistema

// Re-exporta todos os schemas existentes do arquivo insumo.ts
export {
  insumoSchema,
  fichaTecnicaSchema,
  ingredienteSchema,
  produtoSchema,
  fornecedorSchema,
  fornecedorPrecoSchema,
  movimentacaoEstoqueSchema,
  producaoSchema,
  menuSchema,
  menuItemSchema,
  configuracaoAlertaSchema,
  type InsumoInput,
  type FichaTecnicaInput,
  type IngredienteInput,
  type ProdutoInput,
  type FornecedorInput,
  type FornecedorPrecoInput,
  type MovimentacaoEstoqueInput,
  type ProducaoInput,
  type MenuInput,
  type MenuItemInput,
  type ConfiguracaoAlertaInput,
  validateSchema,
  safeValidateSchema
} from './insumo'

// ✅ ALIASES PARA SCHEMAS QUE ESTÃO SENDO IMPORTADOS MAS NÃO EXISTEM
// Temporariamente usando schemas existentes como aliases até serem criados

// Categoria pode usar o mesmo schema base
export { insumoSchema as categoriaSchema } from './insumo'
export type CategoriaInput = InsumoInput

// Unidade de medida pode usar schema simplificado
export { insumoSchema as unidadeMedidaSchema } from './insumo'
export type UnidadeMedidaInput = InsumoInput

// Análise temporal pode usar schema de produção
export { producaoSchema as analiseTemporalSchema } from './insumo'
export type AnaliseTemporalInput = ProducaoInput

// Produção de produto pode usar schema de produção
export { producaoSchema as producaoProdutoSchema } from './insumo'
export type ProducaoProdutoInput = ProducaoInput

// Movimentação de produto pode usar schema de movimentação de estoque
export { movimentacaoEstoqueSchema as movimentacaoProdutoSchema } from './insumo'
export type MovimentacaoProdutoInput = MovimentacaoEstoqueInput

// Período de menu pode usar schema de menu
export { menuSchema as menuPeriodoSchema } from './insumo'
export type MenuPeriodoInput = MenuInput