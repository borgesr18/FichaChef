'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import TacoSearchModal from '@/components/ui/TacoSearchModal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import { useNotifications } from '@/components/ui/NotificationSystem'
import { Package, Plus, Search, Edit, Trash2, Download, TrendingUp, TrendingDown, Crown, DollarSign } from 'lucide-react'

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

// ✅ CORREÇÃO: Interface para dados TACO
interface TacoData {
  descricao?: string
  energia?: number
  proteina?: number
  carboidrato?: number
  lipideos?: number
  fibra?: number
  sodio?: number
  codigo?: number
}

export default function InsumosPage() {
  // ✅ CORREÇÃO 1: Estados sempre inicializados como arrays
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState('')
  const [selectedFornecedor, setSelectedFornecedor] = useState('')
  const [sortOrder, setSortOrder] = useState('recent')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTacoModalOpen, setIsTacoModalOpen] = useState(false)
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { addNotification } = useNotifications()

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

  // ✅ CORREÇÃO 2: Funções fetch com tratamento robusto
  const fetchInsumos = async () => {
    try {
      const response = await fetch('/api/insumos')
      if (response.ok) {
        const data = await response.json()
        
        // ✅ TRATAMENTO ROBUSTO DE DIFERENTES FORMATOS
        let insumosData: Insumo[] = []
        
        if (Array.isArray(data)) {
          insumosData = data
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.data)) {
            insumosData = data.data
          } else if (Array.isArray(data.insumos)) {
            insumosData = data.insumos
          }
        }
        
        setInsumos(Array.isArray(insumosData) ? insumosData : [])
      }
    } catch (error) {
      console.error('Error fetching insumos:', error)
      setInsumos([])
    }
  }

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias-insumos')
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

  const fetchUnidades = async () => {
    try {
      const response = await fetch('/api/unidades-medida')
      if (response.ok) {
        const data = await response.json()
        
        let unidadesData: UnidadeMedida[] = []
        if (Array.isArray(data)) {
          unidadesData = data
        } else if (data && Array.isArray(data.data)) {
          unidadesData = data.data
        }
        
        setUnidades(Array.isArray(unidadesData) ? unidadesData : [])
      }
    } catch (error) {
      console.error('Error fetching unidades:', error)
      setUnidades([])
    }
  }

  const fetchFornecedores = async () => {
    try {
      const response = await fetch('/api/fornecedores')
      if (response.ok) {
        const data = await response.json()
        
        let fornecedoresData: Fornecedor[] = []
        if (Array.isArray(data)) {
          fornecedoresData = data
        } else if (data && Array.isArray(data.data)) {
          fornecedoresData = data.data
        }
        
        // ✅ FILTRAR APENAS ATIVOS COM VERIFICAÇÃO DE ARRAY
        const fornecedoresAtivos = Array.isArray(fornecedoresData) 
          ? fornecedoresData.filter((f: Fornecedor) => f.ativo)
          : []
          
        setFornecedores(fornecedoresAtivos)
      }
    } catch (error) {
      console.error('Error fetching fornecedores:', error)
      setFornecedores([])
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
      // ✅ CORREÇÃO: Função convertFormDataToNumbers com 2 argumentos
      const numericFields = [
        'pesoLiquidoGramas', 
        'precoUnidade', 
        'calorias', 
        'proteinas', 
        'carboidratos', 
        'gorduras', 
        'fibras', 
        'sodio', 
        'codigoTaco'
      ]
      
      // Função simples para converter campos numéricos
      const processedData = { ...formData }
      numericFields.forEach(field => {
        if (processedData[field] !== undefined && processedData[field] !== '' && processedData[field] !== null) {
          const numValue = parseFloat(String(processedData[field]))
          if (!isNaN(numValue) && numValue > 0) {
            processedData[field] = numValue
          } else {
            delete processedData[field]
          }
        } else {
          delete processedData[field]
        }
      })
      
      const url = editingInsumo ? `/api/insumos/${editingInsumo.id}` : '/api/insumos'
      const method = editingInsumo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData)
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          title: editingInsumo ? 'Insumo atualizado' : 'Insumo criado',
          message: `${formData.nome} foi ${editingInsumo ? 'atualizado' : 'criado'} com sucesso!`
        })
        handleCloseModal()
        fetchInsumos()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar insumo')
      }
    } catch {
      setError('Erro ao salvar insumo')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este insumo?')) return

    try {
      const response = await fetch(`/api/insumos/${id}`, { method: 'DELETE' })
      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Insumo excluído',
          message: 'Insumo foi excluído com sucesso!'
        })
        fetchInsumos()
      }
    } catch (error) {
      console.error('Error deleting insumo:', error)
    }
  }

  // ✅ CORREÇÃO: Função handleTacoSelect com tipagem correta
  const handleTacoSelect = (tacoData: TacoData) => {
    setFormData({
      ...formData,
      nome: tacoData.descricao || '',
      calorias: tacoData.energia?.toString() || '',
      proteinas: tacoData.proteina?.toString() || '',
      carboidratos: tacoData.carboidrato?.toString() || '',
      gorduras: tacoData.lipideos?.toString() || '',
      fibras: tacoData.fibra?.toString() || '',
      sodio: tacoData.sodio?.toString() || '',
      codigoTaco: tacoData.codigo?.toString() || '',
      fonteDados: 'taco'
    })
    setIsTacoModalOpen(false)
  }

  // ✅ CORREÇÃO 3: Filtros com verificação de array
  const filteredInsumos = Array.isArray(insumos) 
    ? insumos.filter(insumo => {
        const matchesSearch = insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          insumo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          insumo.categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesCategoria = selectedCategoria === '' || insumo.categoriaId === selectedCategoria
        const matchesFornecedor = selectedFornecedor === '' || insumo.fornecedorId === selectedFornecedor
        
        return matchesSearch && matchesCategoria && matchesFornecedor
      })
    : []

  const sortedInsumos = [...filteredInsumos].sort((a, b) => {
    switch (sortOrder) {
      case 'name':
        return a.nome.localeCompare(b.nome)
      case 'price':
        return b.precoUnidade - a.precoUnidade
      case 'category':
        return a.categoria.nome.localeCompare(b.categoria.nome)
      default:
        return 0
    }
  })

  // Estatísticas
  const getStats = () => {
    const totalInsumos = insumos.length
    const valorTotalEstoque = insumos.reduce((sum, insumo) => sum + insumo.precoUnidade, 0)
    const precoMedio = totalInsumos > 0 ? valorTotalEstoque / totalInsumos : 0
    const categoriasUnicas = new Set(insumos.map(insumo => insumo.categoriaId)).size

    return { totalInsumos, valorTotalEstoque, precoMedio, categoriasUnicas }
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
              <p className="text-gray-600 text-lg">Gestão de ingredientes e matérias-primas</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Buscar Insumo</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Nome, marca ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Categoria</label>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">Todas as categorias</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
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
                {fornecedores.map((fornecedor) => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome}
                  </option>
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
                <option value="price">Maior preço</option>
                <option value="category">Categoria A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Insumos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInsumos}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% este mês
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
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">R$ {stats.valorTotalEstoque.toFixed(2)}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Estoque atual
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
                <p className="text-sm font-medium text-gray-600">Preço Médio</p>
                <p className="text-2xl font-bold text-gray-900">R$ {stats.precoMedio.toFixed(2)}</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -3% vs mês anterior
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
                <p className="text-sm font-medium text-gray-600">Categorias</p>
                <p className="text-2xl font-bold text-gray-900">{stats.categoriasUnicas}</p>
                <p className="text-xs text-purple-600 flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  Tipos diferentes
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Insumos Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedInsumos.map((insumo) => (
            <div key={insumo.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-400 to-purple-600"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                      📦
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-gray-900">{insumo.nome}</h3>
                      {insumo.marca && (
                        <p className="text-sm text-gray-600">{insumo.marca}</p>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {insumo.categoria.nome}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(insumo)}
                      className="p-2 text-gray-400 hover:text-[#1B2E4B] hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(insumo.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Informações do produto */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Preço por unidade:</span>
                    <span className="font-semibold text-green-600">R$ {insumo.precoUnidade.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Peso líquido:</span>
                    <span className="font-semibold">{insumo.pesoLiquidoGramas}g</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Unidade:</span>
                    <span className="font-semibold">{insumo.unidadeCompra.nome}</span>
                  </div>
                  {insumo.fornecedorRel && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Fornecedor:</span>
                      <span className="font-semibold">{insumo.fornecedorRel.nome}</span>
                    </div>
                  )}
                </div>

                {/* Informações nutricionais */}
                {(insumo.calorias || insumo.proteinas || insumo.carboidratos || insumo.gorduras) && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Informações Nutricionais (100g)</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {insumo.calorias && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Calorias:</span>
                          <span className="font-medium">{insumo.calorias} kcal</span>
                        </div>
                      )}
                      {insumo.proteinas && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Proteínas:</span>
                          <span className="font-medium">{insumo.proteinas}g</span>
                        </div>
                      )}
                      {insumo.carboidratos && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Carboidratos:</span>
                          <span className="font-medium">{insumo.carboidratos}g</span>
                        </div>
                      )}
                      {insumo.gorduras && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gorduras:</span>
                          <span className="font-medium">{insumo.gorduras}g</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal para criar/editar insumo */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingInsumo ? 'Editar Insumo' : 'Novo Insumo'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
              <button
                type="button"
                onClick={() => setIsTacoModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Buscar na Tabela TACO
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FloatingLabelInput
                label="Nome *"
                value={formData.nome}
                onChange={(value) => setFormData({ ...formData, nome: value })}
                required
              />
              <FloatingLabelInput
                label="Marca"
                value={formData.marca}
                onChange={(value) => setFormData({ ...formData, marca: value })}
              />
              <FloatingLabelSelect
                label="Categoria *"
                value={formData.categoriaId}
                onChange={(value) => setFormData({ ...formData, categoriaId: value })}
                options={categorias.map(cat => ({ value: cat.id, label: cat.nome }))}
                required
              />
              <FloatingLabelSelect
                label="Unidade de Compra *"
                value={formData.unidadeCompraId}
                onChange={(value) => setFormData({ ...formData, unidadeCompraId: value })}
                options={unidades.map(un => ({ value: un.id, label: `${un.nome} (${un.simbolo})` }))}
                required
              />
              <FloatingLabelInput
                label="Peso Líquido (gramas) *"
                type="number"
                value={formData.pesoLiquidoGramas}
                onChange={(value) => setFormData({ ...formData, pesoLiquidoGramas: value })}
                required
              />
              <FloatingLabelInput
                label="Preço por Unidade *"
                type="number"
                step="0.01"
                value={formData.precoUnidade}
                onChange={(value) => setFormData({ ...formData, precoUnidade: value })}
                required
              />
              <FloatingLabelSelect
                label="Fornecedor"
                value={formData.fornecedorId}
                onChange={(value) => setFormData({ ...formData, fornecedorId: value })}
                options={[
                  { value: '', label: 'Selecione um fornecedor' },
                  ...fornecedores.map(forn => ({ value: forn.id, label: forn.nome }))
                ]}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Informações Nutricionais (por 100g)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FloatingLabelInput
                  label="Calorias (kcal)"
                  type="number"
                  step="0.1"
                  value={formData.calorias}
                  onChange={(value) => setFormData({ ...formData, calorias: value })}
                />
                <FloatingLabelInput
                  label="Proteínas (g)"
                  type="number"
                  step="0.1"
                  value={formData.proteinas}
                  onChange={(value) => setFormData({ ...formData, proteinas: value })}
                />
                <FloatingLabelInput
                  label="Carboidratos (g)"
                  type="number"
                  step="0.1"
                  value={formData.carboidratos}
                  onChange={(value) => setFormData({ ...formData, carboidratos: value })}
                />
                <FloatingLabelInput
                  label="Gorduras (g)"
                  type="number"
                  step="0.1"
                  value={formData.gorduras}
                  onChange={(value) => setFormData({ ...formData, gorduras: value })}
                />
                <FloatingLabelInput
                  label="Fibras (g)"
                  type="number"
                  step="0.1"
                  value={formData.fibras}
                  onChange={(value) => setFormData({ ...formData, fibras: value })}
                />
                <FloatingLabelInput
                  label="Sódio (mg)"
                  type="number"
                  step="0.1"
                  value={formData.sodio}
                  onChange={(value) => setFormData({ ...formData, sodio: value })}
                />
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
                {loading ? 'Salvando...' : (editingInsumo ? 'Atualizar' : 'Criar')}
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

// 🎯 CORREÇÃO FINAL:
// ✅ Removido import da função convertFormDataToNumbers
// ✅ Implementada conversão inline dos campos numéricos
// ✅ Mantidas todas as outras correções anteriores

