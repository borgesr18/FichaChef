export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: 'insumo' | 'ficha' | 'produto' | 'menu' | 'producao'
  steps: WorkflowStep[]
  defaultData?: Record<string, unknown>
  userRoles: string[]
}

export interface WorkflowStep {
  id: string
  title: string
  description: string
  action: 'navigate' | 'form' | 'api_call' | 'confirmation'
  target?: string
  formFields?: FormField[]
  apiEndpoint?: string
  nextStep?: string
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea' | 'date'
  required?: boolean
  options?: { value: string; label: string }[]
  defaultValue?: unknown
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'quick-insumo-creation',
    name: 'Cadastro Rápido de Insumo',
    description: 'Cria um novo insumo com dados essenciais',
    category: 'insumo',
    userRoles: ['chef', 'gerente'],
    steps: [
      {
        id: 'basic-info',
        title: 'Informações Básicas',
        description: 'Nome, marca e categoria do insumo',
        action: 'form',
        formFields: [
          { name: 'nome', label: 'Nome do Insumo', type: 'text', required: true },
          { name: 'marca', label: 'Marca', type: 'text' },
          { name: 'categoriaId', label: 'Categoria', type: 'select', required: true }
        ],
        nextStep: 'pricing'
      },
      {
        id: 'pricing',
        title: 'Precificação',
        description: 'Peso e preço do insumo',
        action: 'form',
        formFields: [
          { name: 'pesoLiquidoGramas', label: 'Peso (g)', type: 'number', required: true },
          { name: 'precoUnidade', label: 'Preço (R$)', type: 'number', required: true }
        ],
        nextStep: 'confirmation'
      },
      {
        id: 'confirmation',
        title: 'Confirmação',
        description: 'Revisar e salvar insumo',
        action: 'confirmation',
        apiEndpoint: '/api/insumos'
      }
    ]
  },
  {
    id: 'recipe-from-template',
    name: 'Ficha Técnica a partir de Template',
    description: 'Cria ficha técnica usando template pré-definido',
    category: 'ficha',
    userRoles: ['chef', 'cozinheiro'],
    steps: [
      {
        id: 'select-template',
        title: 'Selecionar Template',
        description: 'Escolha um template base',
        action: 'form',
        formFields: [
          { name: 'templateId', label: 'Template', type: 'select', required: true }
        ],
        nextStep: 'customize'
      },
      {
        id: 'customize',
        title: 'Personalizar Receita',
        description: 'Ajustar ingredientes e quantidades',
        action: 'form',
        formFields: [
          { name: 'nome', label: 'Nome da Receita', type: 'text', required: true },
          { name: 'numeroPorcoes', label: 'Número de Porções', type: 'number', required: true }
        ],
        nextStep: 'confirmation'
      }
    ]
  }
]

export function getTemplatesByCategory(category: string, userRole: string): WorkflowTemplate[] {
  return workflowTemplates.filter(template => 
    template.category === category && template.userRoles.includes(userRole)
  )
}

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return workflowTemplates.find(template => template.id === id)
}
