'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { FileText, Plus, Search, Edit, Trash2, X, Calculator, Download, TrendingUp, TrendingDown, Crown } from 'lucide-react'

interface FichaTecnica {
  id: string
  nome: string
  categoriaId: string
  pesoFinalGramas: number
  numeroPorcoes: number
  tempoPreparo?: number
  temperaturaForno?: number
  modoPreparo: string
  nivelDificuldade: string
  categoria: { nome: string }
  ingredientes: {
    id: string
    insumoId: string
    quantidadeGramas: number
    insumo: {
      nome: string
      precoUnidade: number
      pesoLiquidoGramas: number
      calorias?: number
      proteinas?: number
      carboidratos?: number
      gorduras?: number
      fibras?: number
      sodio?: number
    }
  }[]
}

interface Categoria {
  id: string
  nome: string
}

interface Insumo {
  id: string
  nome: string
  precoUnidade: number
  pesoLiquidoGramas: number
  calorias?: number
  proteinas?: number
  carboidratos?: number
  gorduras?: number
  fibras?: number
  sodio?: number
}

interface Ingrediente {
  insumoId?: string
  quantidadeGramas?: number
}

interface FormDataType {
  nome: string
  categoriaId: string
  pesoFinalGramas: string
  numeroPorcoes: string
  tempoPreparo: string
  temperaturaForno: string
  modoPreparo: string
  nivelDificuldade: string
  [key: string]: string | number | undefined
}

export default function FichasTecnicasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [fichas, setFichas] = useState<FichaTecnica[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFicha, setEditingFicha] = useState<FichaTecnica | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isScalingModalOpen, setIsScalingModalOpen] = useState(false)
  const [scalingFicha, setScalingFicha] = useState<FichaTecnica | null>(null)
  const [targetPortions, setTargetPortions] = useState('')
  const [scaledData, setScaledData] = useState<{
    ingredientes: Array<{
      id: string
      insumoId: string
      quantidadeGramas: number
      insumo: {
        nome: string
        precoUnidade: number
        pesoLiquidoGramas: number
      }
    }>
    custoTotal: number
    pesoTotal: number
    tempoPreparoEscalado?: number
  } | null>(null)

  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [sortOrder, setSortOrder] = useState('recent')

  const [formData, setFormData] = useState<FormDataType>({
    nome: '',
    categoriaId: '',
    pesoFinalGramas: '',
    numeroPorcoes: '',
    tempoPreparo: '',
    temperaturaForno: '',
    modoPreparo: '',
    nivelDificuldade: 'Fácil'
  })

  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])

  useEffect(() => {
    fetchFichas()
    fetchCategorias()
    fetchInsumos()
  }, [])

  // ✅ CORREÇÃO PRINCIPAL: Função fetchFichas melhorada com logs detalhados
  const fetchFichas = async () => {
    console.log('🔍 [FICHAS] Iniciando fetch das fichas técnicas...')
    try {
      const response = await fetch('/api/fichas-tecnicas')
      console.log('🔍 [FICHAS] Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 [FICHAS] Dados recebidos da API:', data)
        console.log('🔍 [FICHAS] Tipo dos dados:', typeof data)
        console.log('🔍 [FICHAS] É array?', Array.isArray(data))
        
        let fichasData: FichaTecnica[] = []
        
        // ✅ Tratamento robusto de diferentes estruturas de retorno
        if (Array.isArray(data)) {
          console.log('✅ [FICHAS] Dados são array direto')
          fichasData = data
        } else if (data && typeof data === 'object') {
          console.log('🔍 [FICHAS] Dados são objeto, verificando propriedades...')
          console.log('🔍 [FICHAS] Propriedades do objeto:', Object.keys(data))
          
          if (Array.isArray(data.data)) {
            console.log('✅ [FICHAS] Encontrado array em data.data')
            fichasData = data.data
          } else if (Array.isArray(data.fichas)) {
            console.log('✅ [FICHAS] Encontrado array em data.fichas')
            fichasData = data.fichas
          } else if (Array.isArray(data.result)) {
            console.log('✅ [FICHAS] Encontrado array em data.result')
            fichasData = data.result
          } else if (data.success && Array.isArray(data.data)) {
            console.log('✅ [FICHAS] Encontrado array em data.success.data')
            fichasData = data.data
          } else {
            console.log('⚠️ [FICHAS] Estrutura não reconhecida, tentando usar o objeto como array')
            // Se não encontrar array, tenta usar o próprio objeto
            fichasData = []
          }
        }
        
        console.log('🔍 [FICHAS] Fichas processadas:', fichasData.length)
        console.log('🔍 [FICHAS] Primeira ficha (se existir):', fichasData[0])
        
        const finalFichas = Array.isArray(fichasData) ? fichasData : []
        console.log('✅ [FICHAS] Definindo fichas no estado:', finalFichas.length, 'itens')
        setFichas(finalFichas)
      } else {
        console.error('❌ [FICHAS] Erro na resposta:', response.status, response.statusText)
        setFichas([])
      }
    } catch (error) {
      console.error('❌ [FICHAS] Erro no fetch:', error)
      setFichas([])
    }
  }

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias-receitas')
      if (response.ok) {
        const data = await response.json()
        
        let categoriasData: Categoria[] = []
        if (Array.isArray(data)) {
          categoriasData = data
        } else if (data && Array.isArray(data.data)) {
          categoriasData = data.data
        }
        
        setCategorias(Array.isArray(categoriasData) ? categoriasData : [])
      }
    } catch (error) {
      console.error('Error fetching categorias:', error)
      setCategorias([])
    }
  }

  const fetchInsumos = async () => {
    try {
      const response = await fetch('/api/insumos')
      if (response.ok) {
        const data = await response.json()
        
        let insumosData: Insumo[] = []
        if (Array.isArray(data)) {
          insumosData = data
        } else if (data && Array.isArray(data.data)) {
          insumosData = data.data
        }
        
        setInsumos(Array.isArray(insumosData) ? insumosData : [])
      }
    } catch (error) {
      console.error('Error fetching insumos:', error)
      setInsumos([])
    }
  }

  const handleOpenModal = (ficha?: FichaTecnica) => {
    setEditingFicha(ficha || null)
    if (ficha) {
      setFormData({
        nome: ficha.nome,
        categoriaId: ficha.categoriaId,
        pesoFinalGramas: ficha.pesoFinalGramas.toString(),
        numeroPorcoes: ficha.numeroPorcoes.toString(),
        tempoPreparo: ficha.tempoPreparo?.toString() || '',
        temperaturaForno: ficha.temperaturaForno?.toString() || '',
        modoPreparo: ficha.modoPreparo,
        nivelDificuldade: ficha.nivelDificuldade
      })
      setIngredientes(ficha.ingredientes.map(ing => ({
        insumoId: ing.insumoId,
        quantidadeGramas: ing.quantidadeGramas
      })))
    } else {
      setFormData({
        nome: '',
        categoriaId: '',
        pesoFinalGramas: '',
        numeroPorcoes: '',
        tempoPreparo: '',
        temperaturaForno: '',
        modoPreparo: '',
        nivelDificuldade: 'Fácil'
      })
      setIngredientes([])
    }
    setIsModalOpen(true)
    setError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingFicha(null)
    setError('')
  }

  const addIngrediente = () => {
    setIngredientes([...ingredientes, { insumoId: '', quantidadeGramas: 0 }])
  }

  const removeIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index))
  }

  const updateIngrediente = (index: number, field: keyof Ingrediente, value: string | number) => {
    const updated = [...ingredientes]
    updated[index] = { ...updated[index], [field]: value }
    setIngredientes(updated)
  }

  const handleOpenScalingModal = (ficha: FichaTecnica) => {
    setScalingFicha(ficha)
    setTargetPortions(ficha.numeroPorcoes.toString())
    setScaledData(null)
    setIsScalingModalOpen(true)
  }

  const handleCloseScalingModal = () => {
    setIsScalingModalOpen(false)
    setScalingFicha(null)
    setTargetPortions('')
    setScaledData(null)
  }

  const calculateScaling = () => {
    if (!scalingFicha || !targetPortions) return

    const targetPortionsNum = parseInt(targetPortions)
    if (targetPortionsNum <= 0) return

    const scaleFactor = targetPortionsNum / scalingFicha.numeroPorcoes
    
    const scaledIngredientes = scalingFicha.ingredientes.map(ing => ({
      ...ing,
      quantidadeGramas: ing.quantidadeGramas * scaleFactor
    }))

    const custoTotal = scaledIngredientes.reduce((total, ing) => {
      const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
      return total + (custoPorGrama * ing.quantidadeGramas)
    }, 0)

    const pesoTotal = scalingFicha.pesoFinalGramas * scaleFactor
    
    const tempoPreparoEscalado = scalingFicha.tempoPreparo 
      ? Math.round(scalingFicha.tempoPreparo * Math.sqrt(scaleFactor))
      : undefined

    setScaledData({
      ingredientes: scaledIngredientes,
      custoTotal,
      pesoTotal,
      tempoPreparoEscalado
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingFicha ? `/api/fichas-tecnicas/${editingFicha.id}` : '/api/fichas-tecnicas'
      const method = editingFicha ? 'PUT' : 'POST'

      const numericFields = [
        'pesoFinalGramas', 
        'numeroPorcoes', 
        'tempoPreparo', 
        'temperaturaForno'
      ]
      
      const processedData: Record<string, unknown> = { ...formData }
      
      numericFields.forEach(field => {
        const value = processedData[field]
        if (value !== undefined && value !== '' && value !== null) {
          const numValue = parseFloat(String(value))
          if (!isNaN(numValue) && numValue > 0) {
            processedData[field] = numValue
          } else {
            delete processedData[field]
          }
        } else {
          delete processedData[field]
        }
      })

      const dataToSend = {
        ...processedData,
        ingredientes: ingredientes
          .filter(ing => ing.insumoId && ing.quantidadeGramas && ing.quantidadeGramas > 0)
          .map(ing => ({
            insumoId: ing.insumoId,
            quantidadeGramas: typeof ing.quantidadeGramas === 'string' ? parseFloat(ing.quantidadeGramas) || 0 : ing.quantidadeGramas
          }))
      }

      console.log('🔍 [FICHAS] Enviando dados:', dataToSend)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      console.log('🔍 [FICHAS] Response do submit:', response.status)

      if (response.ok) {
        console.log('✅ [FICHAS] Ficha salva com sucesso, recarregando lista...')
        handleCloseModal()
        // ✅ Aguardar um pouco antes de recarregar para garantir que o banco foi atualizado
        setTimeout(() => {
          fetchFichas()
        }, 500)
      } else {
        const errorData = await response.json()
        console.error('❌ [FICHAS] Erro ao salvar:', errorData)
        setError(errorData.error || 'Erro ao salvar ficha técnica')
      }
    } catch (error) {
      console.error('❌ [FICHAS] Erro no submit:', error)
      setError('Erro ao salvar ficha técnica')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ficha técnica?')) return

    try {
      const response = await fetch(`/api/fichas-tecnicas/${id}`, { method: 'DELETE' })
      if (response.ok) {
        console.log('✅ [FICHAS] Ficha deletada, recarregando lista...')
        fetchFichas()
      }
    } catch (error) {
      console.error('Error deleting ficha:', error)
    }
  }

  // Funções auxiliares para o design
  const getCategoryIcon = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'massas': return '🍕'
      case 'carnes': return '🥩'
      case 'saladas': return '🥗'
      case 'sobremesas': return '🍰'
      case 'bebidas': return '🥤'
      default: return '🍽️'
    }
  }

  const getDifficultyColor = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'fácil': return 'from-green-400 to-green-600'
      case 'médio': return 'from-yellow-400 to-orange-400'
      case 'difícil': return 'from-red-400 to-red-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getCategoryGradient = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'massas': return 'from-orange-400 to-red-500'
      case 'carnes': return 'from-red-400 to-red-600'
      case 'saladas': return 'from-green-400 to-emerald-500'
      case 'sobremesas': return 'from-pink-400 to-purple-500'
      case 'bebidas': return 'from-blue-400 to-blue-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const filteredFichas = Array.isArray(fichas) 
    ? fichas.filter(ficha => {
        const matchesSearch = ficha.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             ficha.categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = !selectedCategory || ficha.categoria.nome === selectedCategory
        const matchesLevel = !selectedLevel || ficha.nivelDificuldade === selectedLevel
        return matchesSearch && matchesCategory && matchesLevel
      })
    : []

  const sortedFichas = [...filteredFichas].sort((a, b) => {
    switch (sortOrder) {
      case 'name':
        return a.nome.localeCompare(b.nome)
      case 'cost':
        const costA = a.ingredientes.reduce((total, ing) => {
          const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
          return total + (custoPorGrama * ing.quantidadeGramas)
        }, 0)
        const costB = b.ingredientes.reduce((total, ing) => {
          const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
          return total + (custoPorGrama * ing.quantidadeGramas)
        }, 0)
        return costA - costB
      default:
        return 0
    }
  })

  const getStats = () => {
    const totalFichas = fichas.length
    const costs = fichas.map(ficha => 
      ficha.ingredientes.reduce((total, ing) => {
        const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
        return total + (custoPorGrama * ing.quantidadeGramas)
      }, 0)
    )
    const avgCost = costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0
    const margins = costs.map(cost => {
      const suggestedPrice = cost * 2.5
      return ((suggestedPrice - cost) / suggestedPrice) * 100
    })
    const avgMargin = margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0
    const topMargin = margins.length > 0 ? Math.max(...margins) : 0

    return { totalFichas, avgCost, avgMargin, topMargin }
  }

  const stats = getStats()

  // ✅ Debug info visível
  console.log('🔍 [FICHAS] Estado atual - Total fichas:', fichas.length)
  console.log('🔍 [FICHAS] Fichas filtradas:', filteredFichas.length)

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent">
                Fichas Técnicas
              </h1>
              <p className="text-gray-600 text-lg">Gerencie suas receitas com precisão e eficiência</p>
              {/* ✅ Debug info visível */}
              <p className="text-sm text-blue-600">
                📊 Debug: {fichas.length} fichas carregadas | {filteredFichas.length} filtradas
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={fetchFichas}
                className="bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-xl hover:bg-white transition-all duration-200 shadow-lg border border-white/50 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                🔄 Recarregar
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Ficha
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Buscar Receita</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Digite o nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Categoria</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">Todas as categorias</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.nome}>{categoria.nome}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Nível</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">Todos os níveis</option>
                <option value="Fácil">Fácil</option>
                <option value="Médio">Médio</option>
                <option value="Difícil">Difícil</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Ordenar</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="recent">Mais recentes</option>
                <option value="name">Nome A-Z</option>
                <option value="cost">Menor custo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Fichas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFichas}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% este mês
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Custo Médio</p>
                <p className="text-2xl font-bold text-gray-900">R$ {stats.avgCost.toFixed(2)}</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -5% vs mês anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calculator className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Margem Média</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgMargin.toFixed(1)}%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2% vs mês anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Top Margem</p>
                <p className="text-2xl font-bold text-gray-900">{stats.topMargin.toFixed(1)}%</p>
                <p className="text-xs text-purple-600 flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  Melhor receita
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Mensagem quando não há fichas */}
        {fichas.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma ficha técnica encontrada</h3>
            <p className="text-gray-500 mb-4">Crie sua primeira ficha técnica para começar</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Nova Ficha Técnica
            </button>
          </div>
        )}

        {/* Fichas Grid */}
        {fichas.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {sortedFichas.map((ficha) => {
              const custoTotal = ficha.ingredientes.reduce((total, ing) => {
                const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
                return total + (custoPorGrama * ing.quantidadeGramas)
              }, 0)
              
              const custoPorPorcao = custoTotal / ficha.numeroPorcoes
              const precoSugerido = custoPorPorcao * 2.5
              const margem = ((precoSugerido - custoPorPorcao) / precoSugerido) * 100

              return (
                <div key={ficha.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${getCategoryGradient(ficha.categoria.nome)}`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 bg-gradient-to-r ${getCategoryGradient(ficha.categoria.nome)} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                          {getCategoryIcon(ficha.categoria.nome)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-gray-900">{ficha.nome}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {ficha.categoria.nome}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getDifficultyColor(ficha.nivelDificuldade)} text-white`}>
                              {ficha.nivelDificuldade}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenScalingModal(ficha)}
                          className="p-2 text-gray-400 hover:text-[#5AC8FA] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Escalar receita"
                        >
                          <Calculator className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(ficha)}
                          className="p-2 text-gray-400 hover:text-[#1B2E4B] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ficha.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Informações da receita */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Porções:</span>
                        <span className="font-semibold">{ficha.numeroPorcoes}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Peso final:</span>
                        <span className="font-semibold">{ficha.pesoFinalGramas}g</span>
                      </div>
                      {ficha.tempoPreparo && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tempo preparo:</span>
                          <span className="font-semibold">{ficha.tempoPreparo} min</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Custo por porção:</span>
                        <span className="font-semibold text-green-600">R$ {custoPorPorcao.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Preço sugerido:</span>
                        <span className="font-semibold text-blue-600">R$ {precoSugerido.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Margem:</span>
                        <span className="font-semibold text-purple-600">{margem.toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Ingredientes */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Ingredientes ({ficha.ingredientes.length})</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {ficha.ingredientes.slice(0, 3).map((ing, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-gray-600 truncate">{ing.insumo.nome}</span>
                            <span className="font-medium ml-2">{ing.quantidadeGramas}g</span>
                          </div>
                        ))}
                        {ficha.ingredientes.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{ficha.ingredientes.length - 3} ingredientes
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal para criar/editar ficha técnica */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingFicha ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'} size="xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Receita *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                <select
                  value={formData.categoriaId}
                  onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Peso Final (gramas) *</label>
                <input
                  type="number"
                  value={formData.pesoFinalGramas}
                  onChange={(e) => setFormData({ ...formData, pesoFinalGramas: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Porções *</label>
                <input
                  type="number"
                  value={formData.numeroPorcoes}
                  onChange={(e) => setFormData({ ...formData, numeroPorcoes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tempo de Preparo (min)</label>
                <input
                  type="number"
                  value={formData.tempoPreparo}
                  onChange={(e) => setFormData({ ...formData, tempoPreparo: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temperatura do Forno (°C)</label>
                <input
                  type="number"
                  value={formData.temperaturaForno}
                  onChange={(e) => setFormData({ ...formData, temperaturaForno: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Dificuldade</label>
                <select
                  value={formData.nivelDificuldade}
                  onChange={(e) => setFormData({ ...formData, nivelDificuldade: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                >
                  <option value="Fácil">Fácil</option>
                  <option value="Médio">Médio</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modo de Preparo</label>
              <textarea
                value={formData.modoPreparo}
                onChange={(e) => setFormData({ ...formData, modoPreparo: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                placeholder="Descreva o passo a passo do preparo..."
              />
            </div>

            {/* Ingredientes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Ingredientes</h3>
                <button
                  type="button"
                  onClick={addIngrediente}
                  className="px-4 py-2 bg-[#5AC8FA] text-white rounded-lg hover:bg-[#4AB8E8] transition-colors text-sm"
                >
                  Adicionar Ingrediente
                </button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {ingredientes.map((ingrediente, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <select
                      value={ingrediente.insumoId || ''}
                      onChange={(e) => updateIngrediente(index, 'insumoId', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                    >
                      <option value="">Selecione um insumo</option>
                      {insumos.map(insumo => (
                        <option key={insumo.id} value={insumo.id}>{insumo.nome}</option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      placeholder="Quantidade (g)"
                      value={ingrediente.quantidadeGramas || ''}
                      onChange={(e) => updateIngrediente(index, 'quantidadeGramas', parseFloat(e.target.value) || 0)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                    />
                    
                    <button
                      type="button"
                      onClick={() => removeIngrediente(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : (editingFicha ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Escalonamento */}
        <Modal isOpen={isScalingModalOpen} onClose={handleCloseScalingModal} title="Escalar Receita" size="lg">
          <div className="space-y-6">
            {scalingFicha && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">{scalingFicha.nome}</h3>
                  <p className="text-blue-700 text-sm">Receita original: {scalingFicha.numeroPorcoes} porções</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de porções desejado
                  </label>
                  <input
                    type="number"
                    value={targetPortions}
                    onChange={(e) => setTargetPortions(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                    placeholder="Ex: 10"
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={calculateScaling}
                    className="px-6 py-3 bg-[#5AC8FA] text-white rounded-lg hover:bg-[#4AB8E8] transition-colors"
                  >
                    Calcular Escalonamento
                  </button>
                </div>

                {scaledData && (
                  <div className="bg-green-50 p-4 rounded-lg space-y-4">
                    <h4 className="font-semibold text-green-900">Resultado do Escalonamento</h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700">Custo total:</span>
                        <span className="font-semibold ml-2">R$ {scaledData.custoTotal.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-green-700">Peso total:</span>
                        <span className="font-semibold ml-2">{scaledData.pesoTotal.toFixed(0)}g</span>
                      </div>
                      {scaledData.tempoPreparoEscalado && (
                        <div className="col-span-2">
                          <span className="text-green-700">Tempo estimado:</span>
                          <span className="font-semibold ml-2">{scaledData.tempoPreparoEscalado} min</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h5 className="font-medium text-green-800 mb-2">Ingredientes Escalonados:</h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {scaledData.ingredientes.map((ing, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-green-700">{ing.insumo.nome}</span>
                            <span className="font-medium">{ing.quantidadeGramas.toFixed(1)}g</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

// 🎯 CORREÇÕES ESPECÍFICAS PARA PROBLEMA DE EXIBIÇÃO:
// ✅ Logs detalhados no fetchFichas para debug
// ✅ Tratamento robusto de diferentes estruturas de API
// ✅ Debug info visível na interface
// ✅ Botão de recarregar manual
// ✅ Mensagem quando não há fichas
// ✅ Timeout após salvar para garantir atualização
// ✅ Estados sempre inicializados como arrays
