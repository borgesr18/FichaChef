'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { FileText, Plus, Search, Edit, Trash2, X, Calculator, Download, Filter, TrendingUp, TrendingDown, Crown } from 'lucide-react'
import { convertFormDataToNumbers } from '@/lib/form-utils'
import { calculateTotalNutrition, calculateNutritionPerPortion, calculateNutritionPer100g, formatNutritionalValue } from '@/lib/nutritional-utils'

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
  insumoId: string
  quantidadeGramas: number
}

export default function FichasTecnicasPage() {
  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingFicha, setEditingFicha] = useState<FichaTecnica | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [sortOrder, setSortOrder] = useState('recent')

  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    categoriaId: '',
    pesoFinalGramas: '',
    numeroPorcoes: '',
    tempoPreparo: '',
    temperaturaForno: '',
    modoPreparo: '',
    nivelDificuldade: 'Básico'
  })
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [fichasRes, categoriasRes, insumosRes] = await Promise.all([
        fetch('/api/fichas-tecnicas'),
        fetch('/api/categorias'),
        fetch('/api/insumos')
      ])

      if (fichasRes.ok) {
        const fichasData = await fichasRes.json()
        setFichasTecnicas(fichasData)
      }

      if (categoriasRes.ok) {
        const categoriasData = await categoriasRes.json()
        setCategorias(categoriasData)
      }

      if (insumosRes.ok) {
        const insumosData = await insumosRes.json()
        setInsumos(insumosData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateFichaCost = (ficha: FichaTecnica) => {
    return ficha.ingredientes.reduce((total, ingrediente) => {
      const custoIngrediente = (ingrediente.quantidadeGramas / ingrediente.insumo.pesoLiquidoGramas) * ingrediente.insumo.precoUnidade
      return total + custoIngrediente
    }, 0)
  }

  const calculateSuggestedPrice = (cost: number) => {
    return cost * 2.5 // Margem de 150%
  }

  const calculateMargin = (cost: number, price: number) => {
    return ((price - cost) / price) * 100
  }

  const getStats = () => {
    const totalFichas = fichasTecnicas.length
    const costs = fichasTecnicas.map(calculateFichaCost)
    const avgCost = costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0
    const margins = costs.map(cost => calculateMargin(cost, calculateSuggestedPrice(cost)))
    const avgMargin = margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0
    const topMargin = margins.length > 0 ? Math.max(...margins) : 0

    return { totalFichas, avgCost, avgMargin, topMargin }
  }

  const filteredFichas = fichasTecnicas.filter(ficha => {
    const matchesSearch = ficha.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || ficha.categoria.nome === selectedCategory
    const matchesLevel = !selectedLevel || ficha.nivelDificuldade === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  const sortedFichas = [...filteredFichas].sort((a, b) => {
    switch (sortOrder) {
      case 'name':
        return a.nome.localeCompare(b.nome)
      case 'cost':
        return calculateFichaCost(a) - calculateFichaCost(b)
      case 'margin':
        const marginA = calculateMargin(calculateFichaCost(a), calculateSuggestedPrice(calculateFichaCost(a)))
        const marginB = calculateMargin(calculateFichaCost(b), calculateSuggestedPrice(calculateFichaCost(b)))
        return marginB - marginA
      default:
        return 0
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const numericData = convertFormDataToNumbers(formData, [
        'pesoFinalGramas', 'numeroPorcoes', 'tempoPreparo', 'temperaturaForno'
      ])

      const payload = {
        ...numericData,
        ingredientes: ingredientes.map(ing => ({
          insumoId: ing.insumoId,
          quantidadeGramas: Number(ing.quantidadeGramas)
        }))
      }

      const url = editingFicha ? `/api/fichas-tecnicas/${editingFicha.id}` : '/api/fichas-tecnicas'
      const method = editingFicha ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await loadData()
        resetForm()
        setModalOpen(false)
      }
    } catch (error) {
      console.error('Erro ao salvar ficha técnica:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      categoriaId: '',
      pesoFinalGramas: '',
      numeroPorcoes: '',
      tempoPreparo: '',
      temperaturaForno: '',
      modoPreparo: '',
      nivelDificuldade: 'Básico'
    })
    setIngredientes([])
    setEditingFicha(null)
  }

  const handleEdit = (ficha: FichaTecnica) => {
    setEditingFicha(ficha)
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
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ficha técnica?')) {
      try {
        const response = await fetch(`/api/fichas-tecnicas/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          await loadData()
        }
      } catch (error) {
        console.error('Erro ao excluir ficha técnica:', error)
      }
    }
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
      case 'básico': return 'from-green-400 to-green-600'
      case 'intermediário': return 'from-yellow-400 to-orange-400'
      case 'avançado': return 'from-red-400 to-red-600'
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

  const stats = getStats()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2E4B]"></div>
        </div>
      </DashboardLayout>
    )
  }

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
              <button className="bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-xl hover:bg-white transition-all duration-200 shadow-lg border border-white/50 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <button
                onClick={() => {
                  resetForm()
                  setModalOpen(true)
                }}
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
                <option value="Básico">Básico</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
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
                <option value="margin">Maior margem</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total de Fichas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFichas}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% este mês
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
                <p className="text-xs text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -3% este mês
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
                <p className="text-2xl font-bold text-gray-900">{stats.avgMargin.toFixed(0)}%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5% este mês
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Top Margem</p>
                <p className="text-2xl font-bold text-gray-900">{stats.topMargin.toFixed(0)}%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  Melhor receita
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Fichas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedFichas.map((ficha) => {
            const cost = calculateFichaCost(ficha)
            const suggestedPrice = calculateSuggestedPrice(cost)
            const margin = calculateMargin(cost, suggestedPrice)

            return (
              <div key={ficha.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${getCategoryGradient(ficha.categoria.nome)}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-14 h-14 bg-gradient-to-r ${getCategoryGradient(ficha.categoria.nome)} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <span className="text-white text-xl">{getCategoryIcon(ficha.categoria.nome)}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{ficha.nome}</h3>
                        <p className="text-sm text-gray-500">Atualizada recentemente</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(ficha)}
                        className="p-2 text-gray-400 hover:text-[#1B2E4B] hover:bg-white/50 rounded-lg transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-[#5AC8FA] hover:bg-white/50 rounded-lg transition-all">
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ficha.id)}
                        className="p-2 text-gray-400 hover:text-[#E74C3C] hover:bg-white/50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">{ficha.modoPreparo.substring(0, 100)}...</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Categoria</p>
                      <p className="font-semibold text-gray-900">{ficha.categoria.nome}</p>
                    </div>
                    <div className="bg-white/50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Peso final</p>
                      <p className="font-semibold text-gray-900">{ficha.pesoFinalGramas}g</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Dificuldade:</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getDifficultyColor(ficha.nivelDificuldade)} text-white shadow-md`}>
                      {ficha.nivelDificuldade}
                    </span>
                  </div>
                  
                  <div className="bg-white/50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Custo total:</span>
                      <span className="text-xl font-bold text-gray-900">R$ {cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Preço sugerido:</span>
                      <span className="text-xl font-bold text-[#2ECC71]">R$ {suggestedPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Margem de lucro:</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-[#2ECC71] to-green-400 text-white shadow-md">
                        {margin.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {sortedFichas.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma ficha técnica encontrada</h3>
            <p className="text-gray-500 mb-6">Crie sua primeira ficha técnica para começar</p>
            <button
              onClick={() => {
                resetForm()
                setModalOpen(true)
              }}
              className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Criar Primeira Ficha
            </button>
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingFicha ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Receita</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={formData.categoriaId}
                  onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Peso Final (gramas)</label>
                <input
                  type="number"
                  value={formData.pesoFinalGramas}
                  onChange={(e) => setFormData({ ...formData, pesoFinalGramas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Porções</label>
                <input
                  type="number"
                  value={formData.numeroPorcoes}
                  onChange={(e) => setFormData({ ...formData, numeroPorcoes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tempo de Preparo (min)</label>
                <input
                  type="number"
                  value={formData.tempoPreparo}
                  onChange={(e) => setFormData({ ...formData, tempoPreparo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Dificuldade</label>
                <select
                  value={formData.nivelDificuldade}
                  onChange={(e) => setFormData({ ...formData, nivelDificuldade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                >
                  <option value="Básico">Básico</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modo de Preparo</label>
              <textarea
                value={formData.modoPreparo}
                onChange={(e) => setFormData({ ...formData, modoPreparo: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                required
              />
            </div>

            {/* Ingredientes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Ingredientes</label>
                <button
                  type="button"
                  onClick={addIngrediente}
                  className="bg-[#5AC8FA] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#5AC8FA]/90 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </button>
              </div>

              <div className="space-y-3">
                {ingredientes.map((ingrediente, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <select
                      value={ingrediente.insumoId}
                      onChange={(e) => updateIngrediente(index, 'insumoId', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                      required
                    >
                      <option value="">Selecione um insumo</option>
                      {insumos.map(insumo => (
                        <option key={insumo.id} value={insumo.id}>{insumo.nome}</option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      placeholder="Quantidade (g)"
                      value={ingrediente.quantidadeGramas}
                      onChange={(e) => updateIngrediente(index, 'quantidadeGramas', Number(e.target.value))}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent"
                      required
                    />
                    
                    <button
                      type="button"
                      onClick={() => removeIngrediente(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                {editingFicha ? 'Atualizar' : 'Criar'} Ficha
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
