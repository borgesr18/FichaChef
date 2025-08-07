'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { FileText, Plus, Search, Edit, Trash2, Calculator, TrendingUp, TrendingDown } from 'lucide-react'

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

  // Estados para filtros
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [sortOrder, setSortOrder] = useState('recent')

  const [formData, setFormData] = useState({
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

  const fetchFichas = async () => {
    try {
      const response = await fetch('/api/fichas-tecnicas')
      if (response.ok) {
        const data = await response.json()
        setFichas(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching fichas:', error)
      setFichas([])
    }
  }

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias-receitas')
      if (response.ok) {
        const data = await response.json()
        setCategorias(Array.isArray(data) ? data : [])
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
        setInsumos(Array.isArray(data) ? data : [])
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

  const convertFormDataToNumbers = (data: FormDataType, fields: string[]) => {
    const converted = { ...data }
    fields.forEach(field => {
      if (converted[field] && converted[field] !== '') {
        const num = parseFloat(String(converted[field]))
        if (!isNaN(num)) {
          converted[field] = num
        }
      }
    })
    return converted
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingFicha ? `/api/fichas-tecnicas/${editingFicha.id}` : '/api/fichas-tecnicas'
      const method = editingFicha ? 'PUT' : 'POST'

      const convertedFormData = convertFormDataToNumbers(formData, ['pesoFinalGramas', 'numeroPorcoes', 'tempoPreparo', 'temperaturaForno'])

      const dataToSend = {
        ...convertedFormData,
        ingredientes: ingredientes
          .filter(ing => ing.insumoId && ing.quantidadeGramas && ing.quantidadeGramas > 0)
          .map(ing => ({
            insumoId: ing.insumoId,
            quantidadeGramas: typeof ing.quantidadeGramas === 'string' ? parseFloat(ing.quantidadeGramas) || 0 : ing.quantidadeGramas
          }))
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (response.ok) {
        handleCloseModal()
        fetchFichas()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar ficha técnica')
      }
    } catch {
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
        fetchFichas()
      }
    } catch (error) {
      console.error('Error deleting ficha:', error)
    }
  }

  // Funções auxiliares para o design
  const getCategoryIcon = (categoria: string | null | undefined) => {
    if (!categoria || typeof categoria !== 'string') {
      return '🍽️'
    }
    
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

  // Filtros e ordenação
  const filteredFichas = Array.isArray(fichas) ? fichas.filter(ficha => {
    const matchesSearch = ficha.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ficha.categoria?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || (ficha.categoria?.nome === selectedCategory)
    const matchesLevel = !selectedLevel || ficha.nivelDificuldade === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  }) : []

  const sortedFichas = [...filteredFichas].sort((a, b) => {
    switch (sortOrder) {
      case 'name':
        return a.nome.localeCompare(b.nome)
      case 'cost':
        const costA = Array.isArray(a.ingredientes) ? a.ingredientes.reduce((total, ing) => {
          const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
          return total + (custoPorGrama * ing.quantidadeGramas)
        }, 0) : 0
        const costB = Array.isArray(b.ingredientes) ? b.ingredientes.reduce((total, ing) => {
          const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
          return total + (custoPorGrama * ing.quantidadeGramas)
        }, 0) : 0
        return costA - costB
      default:
        return 0
    }
  })

  // Estatísticas
  const getStats = () => {
    const totalFichas = fichas.length
    const costs = fichas.map(ficha => 
      Array.isArray(ficha.ingredientes) ? ficha.ingredientes.reduce((total, ing) => {
        const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
        return total + (custoPorGrama * ing.quantidadeGramas)
      }, 0) : 0
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
            </div>
            
            <div className="flex items-center space-x-3">
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Receitas</p>
                <p className="text-3xl font-bold text-[#1B2E4B]">{stats.totalFichas}</p>
              </div>
              <div className="bg-gradient-to-br from-[#1B2E4B] to-[#5AC8FA] p-3 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custo Médio</p>
                <p className="text-3xl font-bold text-[#1B2E4B]">R$ {stats.avgCost.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-3 rounded-xl">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Margem Média</p>
                <p className="text-3xl font-bold text-[#1B2E4B]">{stats.avgMargin.toFixed(0)}%</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Melhor Margem</p>
                <p className="text-3xl font-bold text-[#1B2E4B]">{stats.topMargin.toFixed(0)}%</p>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Fichas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedFichas.map((ficha) => {
            const custoTotal = Array.isArray(ficha.ingredientes) ? ficha.ingredientes.reduce((total, ing) => {
              const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
              return total + (custoPorGrama * ing.quantidadeGramas)
            }, 0) : 0
            const precoSugerido = custoTotal * 2.5
            const margemLucro = precoSugerido > 0 ? ((precoSugerido - custoTotal) / precoSugerido) * 100 : 0

            return (
              <div key={ficha.id} className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${getCategoryGradient(ficha.categoria?.nome || '')} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl">{getCategoryIcon(ficha.categoria?.nome)}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenScalingModal(ficha)}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                          title="Escalar receita"
                        >
                          <Calculator className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(ficha)}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ficha.id)}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{ficha.nome}</h3>
                    <p className="text-white/80">{ficha.categoria?.nome || 'Sem categoria'}</p>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#1B2E4B]">{ficha.numeroPorcoes}</p>
                      <p className="text-sm text-gray-600">Porções</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#1B2E4B]">{ficha.pesoFinalGramas}g</p>
                      <p className="text-sm text-gray-600">Peso Final</p>
                    </div>
                  </div>

                  {ficha.tempoPreparo && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tempo de Preparo</span>
                        <span className="font-semibold text-[#1B2E4B]">{ficha.tempoPreparo} min</span>
                      </div>
                    </div>
                  )}

                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getDifficultyColor(ficha.nivelDificuldade)} text-white mb-6`}>
                    {ficha.nivelDificuldade}
                  </div>

                  {/* Ingredientes */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Ingredientes ({Array.isArray(ficha.ingredientes) ? ficha.ingredientes.length : 0})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {Array.isArray(ficha.ingredientes) && ficha.ingredientes.slice(0, 3).map((ing, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{ing.insumo.nome}</span>
                          <span className="font-medium">{ing.quantidadeGramas}g</span>
                        </div>
                      ))}
                      {Array.isArray(ficha.ingredientes) && ficha.ingredientes.length > 3 && (
                        <p className="text-xs text-gray-500">+{ficha.ingredientes.length - 3} mais...</p>
                      )}
                    </div>
                  </div>

                  {/* Custos */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Custo Total</span>
                      <span className="font-bold text-red-600">R$ {custoTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preço Sugerido</span>
                      <span className="font-bold text-green-600">R$ {precoSugerido.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Margem de Lucro</span>
                      <div className="flex items-center space-x-1">
                        {margemLucro >= 50 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className={`font-bold ${margemLucro >= 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {margemLucro.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {sortedFichas.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma ficha técnica encontrada</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory || selectedLevel 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece criando sua primeira ficha técnica'}
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Criar Primeira Ficha
            </button>
          </div>
        )}

        {/* Modal de Nova/Editar Ficha */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          title={editingFicha ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Receita *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.categoriaId}
                  onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso Final (gramas) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.pesoFinalGramas}
                  onChange={(e) => setFormData({ ...formData, pesoFinalGramas: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Porções *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.numeroPorcoes}
                  onChange={(e) => setFormData({ ...formData, numeroPorcoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempo de Preparo (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.tempoPreparo}
                  onChange={(e) => setFormData({ ...formData, tempoPreparo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura do Forno (°C)
                </label>
                <input
                  type="number"
                  min="50"
                  max="300"
                  value={formData.temperaturaForno}
                  onChange={(e) => setFormData({ ...formData, temperaturaForno: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de Dificuldade
                </label>
                <select
                  value={formData.nivelDificuldade}
                  onChange={(e) => setFormData({ ...formData, nivelDificuldade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                >
                  <option value="Fácil">Fácil</option>
                  <option value="Médio">Médio</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modo de Preparo
              </label>
              <textarea
                rows={4}
                value={formData.modoPreparo}
                onChange={(e) => setFormData({ ...formData, modoPreparo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                placeholder="Descreva o modo de preparo da receita..."
              />
            </div>

            {/* Ingredientes */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Ingredientes
                </label>
                <button
                  type="button"
                  onClick={addIngrediente}
                  className="bg-[#5AC8FA] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#4A9FE7] transition-colors"
                >
                  + Adicionar
                </button>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {ingredientes.map((ingrediente, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                    <select
                      value={ingrediente.insumoId || ''}
                      onChange={(e) => updateIngrediente(index, 'insumoId', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                    >
                      <option value="">Selecione um insumo</option>
                      {insumos.map(insumo => (
                        <option key={insumo.id} value={insumo.id}>{insumo.nome}</option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      placeholder="Quantidade (g)"
                      min="0"
                      step="0.1"
                      value={ingrediente.quantidadeGramas || ''}
                      onChange={(e) => updateIngrediente(index, 'quantidadeGramas', parseFloat(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                    />
                    
                    <button
                      type="button"
                      onClick={() => removeIngrediente(index)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#5AC8FA] text-white rounded-lg hover:bg-[#4A9FE7] transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : (editingFicha ? 'Atualizar' : 'Criar')} Ficha Técnica
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Escalonamento */}
        <Modal 
          isOpen={isScalingModalOpen} 
          onClose={handleCloseScalingModal}
          title="Escalar Receita"
        >
          <div className="space-y-6">
            {scalingFicha && (
              <>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {scalingFicha.nome}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Receita original: {scalingFicha.numeroPorcoes} porções, {scalingFicha.pesoFinalGramas}g
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Porções Desejado
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={targetPortions}
                    onChange={(e) => setTargetPortions(e.target.value)}
                    onBlur={calculateScaling}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                  />
                </div>

                {scaledData && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Resultado do Escalonamento:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Peso Total:</span>
                        <span className="font-medium">{scaledData.pesoTotal.toFixed(0)}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Custo Total:</span>
                        <span className="font-medium text-red-600">R$ {scaledData.custoTotal.toFixed(2)}</span>
                      </div>
                      {scaledData.tempoPreparoEscalado && (
                        <div className="flex justify-between">
                          <span>Tempo Estimado:</span>
                          <span className="font-medium">{scaledData.tempoPreparoEscalado} min</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">Ingredientes Escalonados:</h5>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {scaledData.ingredientes.map((ing, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{ing.insumo.nome}</span>
                            <span className="font-medium">{ing.quantidadeGramas.toFixed(1)}g</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseScalingModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={calculateScaling}
                    className="px-4 py-2 bg-[#5AC8FA] text-white rounded-lg hover:bg-[#4A9FE7] transition-colors"
                  >
                    Recalcular
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

