'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import TacoSearchModal from '@/components/ui/TacoSearchModal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import { useNotifications } from '@/components/ui/NotificationSystem'
import { Package, Plus, Search, Edit, Trash2, Download, TrendingUp, TrendingDown, Crown, DollarSign } from 'lucide-react'
import { convertFormDataToNumbers } from '@/lib/form-utils'

interface Insumo {
  id: string
  nome: string
  marca?: string
  fornecedor?: string
  fornecedorId?: string
  categoriaId: string
  unidadeCompraId: string
  pesoLiquidoGramas: number
  precoUnidade: number
  calorias?: number
  proteinas?: number
  carboidratos?: number
  gorduras?: number
  fibras?: number
  sodio?: number
  codigoTaco?: number
  fonteDados?: string
  categoria: { nome: string }
  unidadeCompra: { nome: string; simbolo: string }
  fornecedorRel?: { nome: string }
}

interface Categoria {
  id: string
  nome: string
}

interface UnidadeMedida {
  id: string
  nome: string
  simbolo: string
}

interface Fornecedor {
  id: string
  nome: string
  ativo: boolean
}

export default function InsumosPage() {
  const { addNotification } = useNotifications()
  const [searchTerm, setSearchTerm] = useState('')
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isTacoModalOpen, setIsTacoModalOpen] = useState(false)

  // Estados para filtros
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedFornecedor, setSelectedFornecedor] = useState('')
  const [sortOrder, setSortOrder] = useState('recent')

  const [formData, setFormData] = useState({
    nome: '',
    marca: '',
    fornecedor: '',
    fornecedorId: '',
    categoriaId: '',
    unidadeCompraId: '',
    pesoLiquidoGramas: '',
    precoUnidade: '',
    calorias: '',
    proteinas: '',
    carboidratos: '',
    gorduras: '',
    fibras: '',
    sodio: '',
    codigoTaco: '',
    fonteDados: 'manual'
  })

  useEffect(() => {
    fetchInsumos()
    fetchCategorias()
    fetchUnidades()
    fetchFornecedores()
  }, [])

  const fetchInsumos = async () => {
    try {
      const response = await fetch('/api/insumos')
      if (response.ok) {
        const data = await response.json()
        setInsumos(data)
      }
    } catch (error) {
      console.error('Error fetching insumos:', error)
    }
  }

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias-insumos')
      if (response.ok) {
        const data = await response.json()
        setCategorias(data)
      }
    } catch (error) {
      console.error('Error fetching categorias:', error)
    }
  }

  const fetchUnidades = async () => {
    try {
      const response = await fetch('/api/unidades-medida')
      if (response.ok) {
        const data = await response.json()
        setUnidades(data)
      }
    } catch (error) {
      console.error('Error fetching unidades:', error)
    }
  }

  const fetchFornecedores = async () => {
    try {
      const response = await fetch('/api/fornecedores')
      if (response.ok) {
        const data = await response.json()
        setFornecedores(data.filter((f: Fornecedor) => f.ativo))
      }
    } catch (error) {
      console.error('Error fetching fornecedores:', error)
    }
  }

  const handleOpenModal = (insumo?: Insumo) => {
    setEditingInsumo(insumo || null)
    if (insumo) {
      setFormData({
        nome: insumo.nome,
        marca: insumo.marca || '',
        fornecedor: insumo.fornecedor || '',
        fornecedorId: insumo.fornecedorId || '',
        categoriaId: insumo.categoriaId,
        unidadeCompraId: insumo.unidadeCompraId,
        pesoLiquidoGramas: insumo.pesoLiquidoGramas.toString(),
        precoUnidade: insumo.precoUnidade.toString(),
        calorias: insumo.calorias?.toString() || '',
        proteinas: insumo.proteinas?.toString() || '',
        carboidratos: insumo.carboidratos?.toString() || '',
        gorduras: insumo.gorduras?.toString() || '',
        fibras: insumo.fibras?.toString() || '',
        sodio: insumo.sodio?.toString() || '',
        codigoTaco: insumo.codigoTaco?.toString() || '',
        fonteDados: insumo.fonteDados || 'manual'
      })
    } else {
      setFormData({
        nome: '',
        marca: '',
        fornecedor: '',
        fornecedorId: '',
        categoriaId: '',
        unidadeCompraId: '',
        pesoLiquidoGramas: '',
        precoUnidade: '',
        calorias: '',
        proteinas: '',
        carboidratos: '',
        gorduras: '',
        fibras: '',
        sodio: '',
        codigoTaco: '',
        fonteDados: 'manual'
      })
    }
    setIsModalOpen(true)
    setError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingInsumo(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingInsumo ? `/api/insumos/${editingInsumo.id}` : '/api/insumos'
      const method = editingInsumo ? 'PUT' : 'POST'

      const convertedData = convertFormDataToNumbers(formData, [
        'pesoLiquidoGramas', 
        'precoUnidade',
        'calorias',
        'proteinas', 
        'carboidratos',
        'gorduras',
        'fibras',
        'sodio'
      ])

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(convertedData)
      })

      if (response.ok) {
        handleCloseModal()
        fetchInsumos()
        addNotification({
          type: 'success',
          title: 'Sucesso!',
          message: editingInsumo ? 'Insumo atualizado com sucesso' : 'Insumo criado com sucesso',
          duration: 3000
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar insumo')
        addNotification({
          type: 'error',
          title: 'Erro',
          message: 'Falha ao salvar insumo',
          duration: 5000
        })
      }
    } catch {
      setError('Erro ao salvar insumo')
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Falha ao salvar insumo',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTacoSelect = (alimento: { id: number; energyKcal?: number; proteinG?: number; carbohydrateG?: number; lipidG?: number; fiberG?: number; sodiumMg?: number }) => {
    setFormData(prev => ({
      ...prev,
      calorias: alimento.energyKcal?.toString() || '',
      proteinas: alimento.proteinG?.toString() || '',
      carboidratos: alimento.carbohydrateG?.toString() || '',
      gorduras: alimento.lipidG?.toString() || '',
      fibras: alimento.fiberG?.toString() || '',
      sodio: alimento.sodiumMg?.toString() || '',
      codigoTaco: alimento.id.toString(),
      fonteDados: 'taco'
    }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este insumo?')) return

    try {
      const response = await fetch(`/api/insumos/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchInsumos()
        addNotification({
          type: 'success',
          title: 'Sucesso!',
          message: 'Insumo excluído com sucesso',
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Error deleting insumo:', error)
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Falha ao excluir insumo',
        duration: 5000
      })
    }
  }

  // Funções auxiliares para o design
  const getCategoryIcon = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'carnes': return '🥩'
      case 'vegetais': return '🥬'
      case 'frutas': return '🍎'
      case 'laticínios': return '🥛'
      case 'grãos': return '🌾'
      case 'temperos': return '🧄'
      case 'óleos': return '🫒'
      default: return '📦'
    }
  }

  const getCategoryGradient = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'carnes': return 'from-red-400 to-red-600'
      case 'vegetais': return 'from-green-400 to-emerald-500'
      case 'frutas': return 'from-orange-400 to-red-500'
      case 'laticínios': return 'from-blue-400 to-blue-600'
      case 'grãos': return 'from-yellow-400 to-orange-500'
      case 'temperos': return 'from-purple-400 to-purple-600'
      case 'óleos': return 'from-amber-400 to-yellow-500'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  // Filtros e ordenação
  const filteredInsumos = insumos.filter(insumo => {
    const matchesSearch = insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insumo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insumo.categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || insumo.categoria.nome === selectedCategory
    const matchesFornecedor = !selectedFornecedor || insumo.fornecedorRel?.nome === selectedFornecedor
    return matchesSearch && matchesCategory && matchesFornecedor
  })

  const sortedInsumos = [...filteredInsumos].sort((a, b) => {
    switch (sortOrder) {
      case 'name':
        return a.nome.localeCompare(b.nome)
      case 'price':
        return a.precoUnidade - b.precoUnidade
      case 'cost_per_gram':
        const costA = a.precoUnidade / a.pesoLiquidoGramas
        const costB = b.precoUnidade / b.pesoLiquidoGramas
        return costA - costB
      default:
        return 0
    }
  })

  // Estatísticas
  const getStats = () => {
    const totalInsumos = insumos.length
    const avgPrice = insumos.length > 0 ? insumos.reduce((sum, insumo) => sum + insumo.precoUnidade, 0) / insumos.length : 0
    const costs = insumos.map(insumo => insumo.precoUnidade / insumo.pesoLiquidoGramas)
    const avgCostPerGram = costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0
    const mostExpensive = costs.length > 0 ? Math.max(...costs) : 0

    return { totalInsumos, avgPrice, avgCostPerGram, mostExpensive }
  }

  const stats = getStats()

  if (loading && insumos.length === 0) {
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
                Insumos
              </h1>
              <p className="text-gray-600 text-lg">Gerencie ingredientes e matérias-primas</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-xl hover:bg-white transition-all duration-200 shadow-lg border border-white/50 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Insumo
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Buscar Insumo</label>
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
              <label className="block text-sm font-semibold text-gray-700">Fornecedor</label>
              <select
                value={selectedFornecedor}
                onChange={(e) => setSelectedFornecedor(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">Todos os fornecedores</option>
                {fornecedores.map(fornecedor => (
                  <option key={fornecedor.id} value={fornecedor.nome}>{fornecedor.nome}</option>
                ))}
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
                <option value="price">Menor preço</option>
                <option value="cost_per_gram">Menor custo/g</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total de Insumos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInsumos}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% este mês
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Preço Médio</p>
                <p className="text-2xl font-bold text-gray-900">R$ {stats.avgPrice.toFixed(2)}</p>
                <p className="text-xs text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -2% este mês
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Custo/g Médio</p>
                <p className="text-2xl font-bold text-gray-900">R$ {stats.avgCostPerGram.toFixed(4)}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +1% este mês
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">g</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Mais Caro/g</p>
                <p className="text-2xl font-bold text-gray-900">R$ {stats.mostExpensive.toFixed(4)}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  Insumo premium
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Insumos Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedInsumos.map((insumo) => {
            const costPerGram = insumo.precoUnidade / insumo.pesoLiquidoGramas

            return (
              <div key={insumo.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${getCategoryGradient(insumo.categoria.nome)}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-14 h-14 bg-gradient-to-r ${getCategoryGradient(insumo.categoria.nome)} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <span className="text-white text-xl">{getCategoryIcon(insumo.categoria.nome)}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{insumo.nome}</h3>
                        <p className="text-sm text-gray-500">{insumo.marca || 'Sem marca'}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(insumo)}
                        className="p-2 text-gray-400 hover:text-[#1B2E4B] hover:bg-white/50 rounded-lg transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(insumo.id)}
                        className="p-2 text-gray-400 hover:text-[#E74C3C] hover:bg-white/50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Categoria</p>
                      <p className="font-semibold text-gray-900">{insumo.categoria.nome}</p>
                    </div>
                    <div className="bg-white/50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Peso</p>
                      <p className="font-semibold text-gray-900">{insumo.pesoLiquidoGramas}g</p>
                    </div>
                  </div>

                  {insumo.fornecedorRel && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">Fornecedor:</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md">
                        {insumo.fornecedorRel.nome}
                      </span>
                    </div>
                  )}
                  
                  <div className="bg-white/50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Preço unitário:</span>
                      <span className="text-xl font-bold text-gray-900">R$ {insumo.precoUnidade.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Unidade:</span>
                      <span className="text-lg font-bold text-[#5AC8FA]">{insumo.unidadeCompra.simbolo}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Custo por grama:</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-[#2ECC71] to-green-400 text-white shadow-md">
                        R$ {costPerGram.toFixed(4)}/g
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {sortedInsumos.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum insumo encontrado</h3>
            <p className="text-gray-500 mb-6">Cadastre seu primeiro insumo para começar</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Cadastrar Primeiro Insumo
            </button>
          </div>
        )}

        {/* Modal de Criação/Edição */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingInsumo ? 'Editar Insumo' : 'Novo Insumo'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FloatingLabelInput
                label="Nome do Insumo"
                value={formData.nome}
                onChange={(value) => setFormData({ ...formData, nome: value })}
                required
                error={error && !formData.nome ? 'Nome é obrigatório' : ''}
              />

              <FloatingLabelInput
                label="Marca"
                value={formData.marca}
                onChange={(value) => setFormData({ ...formData, marca: value })}
              />

              <FloatingLabelSelect
                label="Fornecedor"
                value={formData.fornecedorId}
                onChange={(value) => setFormData({ ...formData, fornecedorId: value })}
                options={fornecedores.map(fornecedor => ({ value: fornecedor.id, label: fornecedor.nome }))}
              />

              <FloatingLabelSelect
                label="Categoria"
                value={formData.categoriaId}
                onChange={(value) => setFormData({ ...formData, categoriaId: value })}
                options={categorias.map(categoria => ({ value: categoria.id, label: categoria.nome }))}
                required
                error={error && !formData.categoriaId ? 'Categoria é obrigatória' : ''}
              />

              <FloatingLabelSelect
                label="Unidade de Compra"
                value={formData.unidadeCompraId}
                onChange={(value) => setFormData({ ...formData, unidadeCompraId: value })}
                options={unidades.map(unidade => ({ value: unidade.id, label: `${unidade.nome} (${unidade.simbolo})` }))}
                required
                error={error && !formData.unidadeCompraId ? 'Unidade é obrigatória' : ''}
              />

              <FloatingLabelInput
                label="Peso Líquido (gramas)"
                type="number"
                value={formData.pesoLiquidoGramas}
                onChange={(value) => setFormData({ ...formData, pesoLiquidoGramas: value })}
                required
                error={error && !formData.pesoLiquidoGramas ? 'Peso é obrigatório' : ''}
              />

              <FloatingLabelInput
                label="Preço por Unidade (R$)"
                type="number"
                step="0.01"
                value={formData.precoUnidade}
                onChange={(value) => setFormData({ ...formData, precoUnidade: value })}
                required
                error={error && !formData.precoUnidade ? 'Preço é obrigatório' : ''}
              />
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200/60">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
                  <h3 className="text-lg font-bold text-slate-800">Informações Nutricionais (por 100g)</h3>
                  <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Opcional</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTacoModalOpen(true)}
                  className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Buscar TACO</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FloatingLabelInput
                  label="Calorias (kcal)"
                  type="number"
                  step="0.01"
                  value={formData.calorias}
                  onChange={(value) => setFormData({ ...formData, calorias: value })}
                />

                <FloatingLabelInput
                  label="Proteínas (g)"
                  type="number"
                  step="0.01"
                  value={formData.proteinas}
                  onChange={(value) => setFormData({ ...formData, proteinas: value })}
                />

                <FloatingLabelInput
                  label="Carboidratos (g)"
                  type="number"
                  step="0.01"
                  value={formData.carboidratos}
                  onChange={(value) => setFormData({ ...formData, carboidratos: value })}
                />

                <FloatingLabelInput
                  label="Gorduras (g)"
                  type="number"
                  step="0.01"
                  value={formData.gorduras}
                  onChange={(value) => setFormData({ ...formData, gorduras: value })}
                />

                <FloatingLabelInput
                  label="Fibras (g)"
                  type="number"
                  step="0.01"
                  value={formData.fibras}
                  onChange={(value) => setFormData({ ...formData, fibras: value })}
                />

                <FloatingLabelInput
                  label="Sódio (mg)"
                  type="number"
                  step="0.01"
                  value={formData.sodio}
                  onChange={(value) => setFormData({ ...formData, sodio: value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : (editingInsumo ? 'Atualizar' : 'Criar')} Insumo
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal TACO */}
        <TacoSearchModal
          isOpen={isTacoModalOpen}
          onClose={() => setIsTacoModalOpen(false)}
          onSelect={handleTacoSelect}
        />
      </div>
    </DashboardLayout>
  )
}
