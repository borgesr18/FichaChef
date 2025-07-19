// Dados de exemplo para desenvolvimento quando não há banco configurado

export const devInsumos = [
  {
    id: '1',
    nome: 'Farinha de Trigo',
    marca: 'Dona Benta',
    precoUnidade: 4.50,
    pesoLiquidoGramas: 1000,
    categoriaId: '1',
    unidadeCompraId: '1',
    userId: 'dev-user-id',
    categoria: { id: '1', nome: 'Farinhas' },
    unidadeCompra: { id: '1', nome: 'Pacote', abreviacao: 'pct' }
  },
  {
    id: '2',
    nome: 'Açúcar Cristal',
    marca: 'União',
    precoUnidade: 3.20,
    pesoLiquidoGramas: 1000,
    categoriaId: '2',
    unidadeCompraId: '1',
    userId: 'dev-user-id',
    categoria: { id: '2', nome: 'Açúcares' },
    unidadeCompra: { id: '1', nome: 'Pacote', abreviacao: 'pct' }
  },
  {
    id: '3',
    nome: 'Ovos',
    marca: 'Granja Mantiqueira',
    precoUnidade: 8.90,
    pesoLiquidoGramas: 720,
    categoriaId: '3',
    unidadeCompraId: '2',
    userId: 'dev-user-id',
    categoria: { id: '3', nome: 'Proteínas' },
    unidadeCompra: { id: '2', nome: 'Dúzia', abreviacao: 'dz' }
  }
]

export const devFichasTecnicas = [
  {
    id: '1',
    nome: 'Bolo de Chocolate',
    categoriaId: '1',
    pesoFinalGramas: 1200,
    numeroPorcoes: 8,
    tempoPreparo: 60,
    temperaturaForno: 180,
    modoPreparo: 'Misture os ingredientes secos, adicione os líquidos e asse por 40 minutos.',
    nivelDificuldade: 'Médio',
    userId: 'dev-user-id',
    categoria: { nome: 'Bolos' },
    ingredientes: []
  },
  {
    id: '2',
    nome: 'Pão Francês',
    categoriaId: '2',
    pesoFinalGramas: 800,
    numeroPorcoes: 16,
    tempoPreparo: 180,
    temperaturaForno: 220,
    modoPreparo: 'Misture, sove, deixe crescer e asse.',
    nivelDificuldade: 'Difícil',
    userId: 'dev-user-id',
    categoria: { nome: 'Pães' },
    ingredientes: []
  }
]

export const devProducoes = [
  {
    id: '1',
    fichaTecnicaId: '1',
    dataProducao: new Date().toISOString(),
    dataValidade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    quantidadeProduzida: 5,
    lote: 'LOTE-001',
    userId: 'dev-user-id',
    fichaTecnica: { nome: 'Bolo de Chocolate' }
  }
]

export const devProdutos = [
  {
    id: '1',
    nome: 'Bolo de Chocolate Fatia',
    precoVenda: 8.50,
    margemLucro: 0.4, // 40%
    fichaTecnicaId: '1',
    userId: 'dev-user-id'
  }
]

export const devCategorias = [
  { id: '1', nome: 'Bolos', userId: 'dev-user-id' },
  { id: '2', nome: 'Pães', userId: 'dev-user-id' },
  { id: '3', nome: 'Farinhas', userId: 'dev-user-id' },
  { id: '4', nome: 'Açúcares', userId: 'dev-user-id' },
  { id: '5', nome: 'Proteínas', userId: 'dev-user-id' }
]

export const devCategoriasReceitas = [
  { id: '1', nome: 'Bolos', descricao: 'Receitas de bolos diversos', userId: 'dev-user-id' },
  { id: '2', nome: 'Pães', descricao: 'Receitas de pães e massas', userId: 'dev-user-id' },
  { id: '3', nome: 'Doces', descricao: 'Sobremesas e doces', userId: 'dev-user-id' }
]

export const devUnidadesMedida = [
  { id: '1', nome: 'Grama', simbolo: 'g', tipo: 'peso', userId: 'dev-user-id' },
  { id: '2', nome: 'Dúzia', simbolo: 'dz', tipo: 'unidade', userId: 'dev-user-id' },
  { id: '3', nome: 'Quilograma', simbolo: 'kg', tipo: 'peso', userId: 'dev-user-id' }
]

// Função para verificar se deve usar dados de desenvolvimento
export function shouldUseDevData(): boolean {
  if (process.env.NODE_ENV !== 'development') {
    return false
  }
  
  // Verificar flag explícita
  if (process.env.DEV_MODE === 'true') {
    return true
  }
  
  // Verificar se banco está configurado
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl || dbUrl.includes('placeholder') || dbUrl === '') {
    return true
  }
  
  // Verificar se Supabase está configurado
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl.includes('placeholder') || 
      supabaseKey.includes('placeholder') ||
      supabaseUrl === '' || supabaseKey === '') {
    return true
  }
  
  return false
}

// Função para simular delay de API
export function simulateApiDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

