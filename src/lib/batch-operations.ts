export interface BatchOperation {
  id: string
  name: string
  description: string
  module: string
  action: 'update' | 'delete' | 'export' | 'duplicate'
  fields?: BatchField[]
  confirmationMessage?: string
}

export interface BatchField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'boolean'
  options?: { value: string; label: string }[]
}

export const batchOperations: BatchOperation[] = [
  {
    id: 'bulk-update-supplier',
    name: 'Atualizar Fornecedor em Lote',
    description: 'Alterar fornecedor de múltiplos insumos',
    module: 'insumos',
    action: 'update',
    fields: [
      {
        name: 'fornecedorId',
        label: 'Novo Fornecedor',
        type: 'select'
      }
    ],
    confirmationMessage: 'Deseja atualizar o fornecedor dos {count} insumos selecionados?'
  },
  {
    id: 'bulk-update-category',
    name: 'Atualizar Categoria em Lote',
    description: 'Alterar categoria de múltiplos insumos',
    module: 'insumos',
    action: 'update',
    fields: [
      {
        name: 'categoriaId',
        label: 'Nova Categoria',
        type: 'select'
      }
    ]
  },
  {
    id: 'bulk-export-fichas',
    name: 'Exportar Fichas Técnicas',
    description: 'Exportar múltiplas fichas técnicas para PDF',
    module: 'fichas-tecnicas',
    action: 'export',
    fields: [
      {
        name: 'format',
        label: 'Formato',
        type: 'select',
        options: [
          { value: 'pdf', label: 'PDF' },
          { value: 'excel', label: 'Excel' }
        ]
      },
      {
        name: 'includeNutrition',
        label: 'Incluir Informações Nutricionais',
        type: 'boolean'
      }
    ]
  },
  {
    id: 'bulk-duplicate-products',
    name: 'Duplicar Produtos',
    description: 'Criar cópias de produtos selecionados',
    module: 'produtos',
    action: 'duplicate',
    fields: [
      {
        name: 'namePrefix',
        label: 'Prefixo do Nome',
        type: 'text'
      }
    ]
  }
]

export async function executeBatchOperation(
  operationId: string,
  selectedIds: string[],
  fieldValues: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
  const operation = batchOperations.find(op => op.id === operationId)
  if (!operation) {
    return { success: false, message: 'Operação não encontrada' }
  }

  try {
    const response = await fetch(`/api/batch-operations/${operationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selectedIds,
        fieldValues,
        module: operation.module
      })
    })

    if (response.ok) {
      const result = await response.json()
      return { success: true, message: result.message || 'Operação concluída com sucesso' }
    } else {
      return { success: false, message: 'Erro ao executar operação' }
    }
  } catch {
    return { success: false, message: 'Erro de conexão' }
  }
}
