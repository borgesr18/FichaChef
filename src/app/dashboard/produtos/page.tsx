'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import { ShoppingCart, Plus, Search, Edit, Trash2, X, Package, TrendingUp, DollarSign, Target, Download, Crown, TrendingDown } from 'lucide-react'
import { convertFormDataToNumbers } from '@/lib/form-utils'

interface FichaTecnica {
  id: string
  nome: string
  pesoFinalGramas: number
  ingredientes: {
    quantidadeGramas: number
    insumo: {
      precoUnidade: number
      pesoLiquidoGramas: number
    }
  }[]
}

interface ProdutoFicha {
  fichaTecnicaId: string
  quantidadeGramas: number | string
}

interface Produto {
  id: string
  nome: string
  precoVenda: number
  margemLucro: number
  produtoFichas: {
    quantidadeGramas: number
    fichaTecnica: FichaTecnica
  }[]
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Estados para filtros
  const [sortOrder, setSortOrder] = useState('recent')

  const [formData, setFormData] = useState({
    nome: '',
    precoVenda: '',
    margemLucro: ''
  })

  const [produtoFichas, setProdutoFichas] = useState<ProdutoFicha[]>([])

  useEffect(() => {
    fetchProdutos()
    fetchFichasTecnicas()
  }, [])

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos')
      if (response.ok) {
        const data = await response.json()
        setProdutos(data)
      }
    } catch (error) {
      console.error('Error fetching produtos:', error)
    }
  }

  const fetchFichasTecnicas = async () => {
    try {
      const response = await fetch('/api/fichas-tecnicas')
      if (response.ok) {
        const data = await response.json()
        setFichasTecnicas(data)
      }
    } catch (error) {
      console.error('Error fetching fichas técnicas:', error)
    }
  }

  const handleOpenModal = (produto?: Produto) => {
    if (produto) {
      setEditingProduto(produto)
      setFormData({
        nome: produto.nome,
        precoVenda: produto.precoVenda.toString(),
        margemLucro: produto.margemLucro.toString()
      })
      setProdutoFichas(produto.produtoFichas.map(f => ({
        fichaTecnicaId: f.fichaTecnica.id,
        quantidadeGramas: f.quantidadeGramas
      })))
    } else {
      setEditingProduto(null)
      setFormData({
        nome: '',
        precoVenda: '',
        margemLucro: ''
      })
      setProdutoFichas([])
    }
    setIsModalOpen(true)
    setError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduto(null)
    setError('')
  }

  const addProdutoFicha = () => {
    setProdutoFichas([...produtoFichas, { fichaTecnicaId: '', quantidadeGramas: '' }])
  }

  const removeProdutoFicha = (index: number) => {
    setProdutoFichas(produtoFichas.filter((_, i) => i !== index))
  }

  const updateProdutoFicha = (index: number, field: keyof ProdutoFicha, value: string | number) => {
    const updated = [...produtoFichas]
    const current = updated[index] || { fichaTecnicaId: '', quantidadeGramas: '' }
    updated[index] = {
      ...current,
      [field]: value,
    }
    setProdutoFichas(updated)
  }

  const calculateProdutoCusto = () => {
    return produtoFichas.reduce((total, produtoFicha) => {
      const ficha = fichasTecnicas.find(f => f.id === produtoFicha.fichaTecnicaId)
      if (ficha && produtoFicha.quantidadeGramas) {
        const fichaCusto = ficha.ingredientes.reduce((fichaTotal, ing) => {
          const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
          return fichaTotal + (custoPorGrama * ing.quantidadeGramas)
        }, 0)
        const custoPorGramaFicha = fichaCusto / ficha.pesoFinalGramas
        const quantidade = typeof produtoFicha.quantidadeGramas === 'string' ? parseFloat(produtoFicha.quantidadeGramas) || 0 : produtoFicha.quantidadeGramas
        return total + (custoPorGramaFicha * quantidade)
      }
      return total
    }, 0)
  }

  const calculateProdutoPeso = () => {
    return produtoFichas.reduce((total, produtoFicha) => {
      const quantidade = typeof produtoFicha.quantidadeGramas === 'string' ? parseFloat(produtoFicha.quantidadeGramas) || 0 : produtoFicha.quantidadeGramas
      return total + (quantidade || 0)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingProduto ? `/api/produtos/${editingProduto.id}` : '/api/produtos'
      const method = editingProduto ? 'PUT' : 'POST'

      const convertedFormData = convertFormDataToNumbers(formData, ['precoVenda', 'margemLucro'])

      const dataToSend = {
        ...convertedFormData,
        fichas: produtoFichas
          .filter(f => f.fichaTecnicaId && (typeof f.quantidadeGramas === 'string' ? parseFloat(f.quantidadeGramas) > 0 : (f.quantidadeGramas || 0) > 0))
          .map(f => ({
            fichaTecnicaId: f.fichaTecnicaId,
            quantidadeGramas: typeof f.quantidadeGramas === 'string' ? parseFloat(f.quantidadeGramas) || 0 : f.quantidadeGramas
          }))
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (response.ok) {
        handleCloseModal()
        fetchProdutos()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar produto')
      }
    } catch {
      setError('Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const response = await fetch(`/api/produtos/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchProdutos()
      }
    } catch (error) {
      console.error('Error deleting produto:', error)
    }
  }

  // Funções auxiliares para o design
  const getProductIcon = (nome: string) => {
    const nomeLower = nome.toLowerCase()
    if (nomeLower.includes('pizza')) return '🍕'
    if (nomeLower.includes('hambur')) return '🍔'
    if (nomeLower.includes('sanduí') || nomeLower.includes('sandw')) return '🥪'
    if (nomeLower.includes('salada')) return '🥗'
    if (nomeLower.includes('sopa')) return '🍲'
    if (nomeLower.includes('massa') || nomeLower.includes('macarr')) return '🍝'
    if (nomeLower.includes('frango') || nomeLower.includes('chicken')) return '🍗'
    if (nomeLower.includes('carne') || nomeLower.includes('beef')) return '🥩'
    if (nomeLower.includes('peixe') || nomeLower.includes('fish')) return '🐟'
    if (nomeLower.includes('sobremesa') || nomeLower.includes('doce')) return '🍰'
    if (nomeLower.includes('bebida') || nomeLower.includes('suco')) return '🥤'
    return '🍽️'
  }

  const getProductGradient = (nome: string) => {
    const nomeLower = nome.toLowerCase()
    if (nomeLower.includes('pizza')) return 'from-red-400 to-orange-500'
    if (nomeLower.includes('hambur')) return 'from-yellow-400 to-red-500'
    if (nomeLower.includes('sanduí') || nomeLower.includes('sandw')) return 'from-amber-400 to-orange-500'
    if (nomeLower.includes('salada')) return 'from-green-400 to-emerald-500'
    if (nomeLower.includes('sopa')) return 'from-orange-400 to-red-400'
    if (nomeLower.includes('massa') || nomeLower.includes('macarr')) return 'from-yellow-400 to-orange-400'
    if (nomeLower.includes('frango') || nomeLower.includes('chicken')) return 'from-amber-400 to-yellow-500'
    if (nomeLower.includes('carne') || nomeLower.includes('beef')) return 'from-red-500 to-red-600'
    if (nomeLower.includes('peixe') || nomeLower.includes('fish')) return 'from-blue-400 to-cyan-500'
    if (nomeLower.includes('sobremesa') || nomeLower.includes('doce')) return 'from-pink-400 to-purple-500'
    if (nomeLower.includes('bebida') || nomeLower.includes('suco')) return 'from-blue-400 to-blue-600'
    return 'from-gray-400 to-gray-600'
  }

  // Filtros e ordenação
  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const sortedProdutos = [...filteredProdutos].sort((a, b) => {
    switch (sortOrder) {
      case 'name':
        return a.nome.localeCompare(b.nome)
      case 'price':
        return a.precoVenda - b.precoVenda
      case 'margin':
        return a.margemLucro - b.margemLucro
      default:
        return 0
    }
  })

  // Estatísticas
  const getStats = () => {
    const totalProdutos = produtos.length
    const avgPrice = produtos.length > 0 ? produtos.reduce((sum, produto) => sum + produto.precoVenda, 0) / produtos.length : 0
    const avgMargin = produtos.length > 0 ? produtos.reduce((sum, produto) => sum + produto.margemLucro, 0) / produtos.length : 0
    const comFichas = produtos.filter(p => p.produtoFichas.length > 0).length

    return { totalProdutos, avgPrice, avgMargin, comFichas }
  }

  const stats = getStats()

  if (loading && produtos.length === 0) {
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
                Produtos
              </h1>
              <p className="text-gray-600 text-lg">Gerencie produtos finais e composições</p>
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
                Novo Produto
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Buscar Produto</label>
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
              <label className="block text-sm font-semibold text-gray-700">Ordenar</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="recent">Mais recentes</option>
                <option value="name">Nome A-Z</option>
                <option value="price">Menor preço</option>
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
                <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProdutos}</p>
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
                <p className="text-sm font-medium text-gray-600">Preço Médio</p>
                <p className="text-2xl font-bold text-gray-900">R$ {stats.avgPrice.toFixed(2)}</p>
                <p className="text-xs text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -3% este mês
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
                <p className="text-sm font-medium text-gray-600">Margem Média</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgMargin.toFixed(1)}%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5% este mês
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Com Fichas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.comFichas}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  Produtos completos
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Produtos Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedProdutos.map((produto) => {
            const custoTotal = produto.produtoFichas.reduce((total, produtoFicha) => {
              const fichaCusto = produtoFicha.fichaTecnica.ingredientes.reduce((fichaTotal, ing) => {
                const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
                return fichaTotal + (custoPorGrama * ing.quantidadeGramas)
              }, 0)
              const custoPorGramaFicha = fichaCusto / produtoFicha.fichaTecnica.pesoFinalGramas
              return total + (custoPorGramaFicha * produtoFicha.quantidadeGramas)
            }, 0)

            const pesoTotal = produto.produtoFichas.reduce((total, f) => total + f.quantidadeGramas, 0)

            return (
              <div key={produto.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${getProductGradient(produto.nome)}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-14 h-14 bg-gradient-to-r ${getProductGradient(produto.nome)} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <span className="text-white text-xl">{getProductIcon(produto.nome)}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{produto.nome}</h3>
                        <p className="text-sm text-gray-500">{produto.produtoFichas.length} fichas técnicas</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(produto)}
                        className="p-2 text-gray-400 hover:text-[#1B2E4B] hover:bg-white/50 rounded-lg transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(produto.id)}
                        className="p-2 text-gray-400 hover:text-[#E74C3C] hover:bg-white/50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Peso Total</p>
                      <p className="font-semibold text-gray-900">{pesoTotal}g</p>
                    </div>
                    <div className="bg-white/50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Margem</p>
                      <p className="font-semibold text-gray-900">{produto.margemLucro}%</p>
                    </div>
                  </div>

                  {produto.produtoFichas.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Fichas Técnicas:</p>
                      <div className="space-y-1">
                        {produto.produtoFichas.slice(0, 3).map((f, index) => (
                          <div key={index} className="text-xs bg-white/50 rounded-lg px-3 py-2 flex justify-between">
                            <span className="font-medium">{f.fichaTecnica.nome}</span>
                            <span className="text-gray-500">{f.quantidadeGramas}g</span>
                          </div>
                        ))}
                        {produto.produtoFichas.length > 3 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            +{produto.produtoFichas.length - 3} fichas
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white/50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Custo produção:</span>
                      <span className="text-lg font-bold text-[#2ECC71]">R$ {custoTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Preço de venda:</span>
                      <span className="text-xl font-bold text-[#1B2E4B]">R$ {produto.precoVenda.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Lucro estimado:</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md">
                        R$ {(produto.precoVenda - custoTotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {sortedProdutos.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500 mb-6">Cadastre seu primeiro produto para começar</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Cadastrar Primeiro Produto
            </button>
          </div>
        )}

        {/* Modal de Criação/Edição */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingProduto ? 'Editar Produto' : 'Novo Produto'}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FloatingLabelInput
                label="Nome do Produto"
                value={formData.nome}
                onChange={(value) => setFormData({ ...formData, nome: value })}
                required
                error={error && !formData.nome ? 'Nome é obrigatório' : ''}
              />

              <FloatingLabelInput
                label="Preço de Venda (R$)"
                type="number"
                step="0.01"
                value={formData.precoVenda}
                onChange={(value) => setFormData({ ...formData, precoVenda: value })}
                required
                error={error && !formData.precoVenda ? 'Preço é obrigatório' : ''}
              />

              <FloatingLabelInput
                label="Margem de Lucro (%)"
                type="number"
                step="0.01"
                value={formData.margemLucro}
                onChange={(value) => setFormData({ ...formData, margemLucro: value })}
                required
                error={error && !formData.margemLucro ? 'Margem é obrigatória' : ''}
              />
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200/60">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                  <h3 className="text-lg font-bold text-slate-800">Fichas Técnicas</h3>
                  <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Composição do produto</span>
                </div>
                <button
                  type="button"
                  onClick={addProdutoFicha}
                  className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Ficha</span>
                </button>
              </div>

              {produtoFichas.map((produtoFicha, index) => (
                <div key={index} className="flex items-center space-x-3 mb-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="flex-1">
                    <FloatingLabelSelect
                      label="Ficha Técnica"
                      value={produtoFicha.fichaTecnicaId}
                      onChange={(value) => updateProdutoFicha(index, 'fichaTecnicaId', value)}
                      options={fichasTecnicas.map(ficha => ({ 
                        value: ficha.id, 
                        label: `${ficha.nome} (${ficha.pesoFinalGramas}g)` 
                      }))}
                      required
                    />
                  </div>
                  <div className="w-32">
                    <FloatingLabelInput
                      label="Quantidade (g)"
                      type="number"
                      step="0.01"
                      value={typeof produtoFicha.quantidadeGramas === 'number' ? String(produtoFicha.quantidadeGramas) : (produtoFicha.quantidadeGramas || '')}
                      onChange={(value) => updateProdutoFicha(index, 'quantidadeGramas', value)}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProdutoFicha(index)}
                    className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-110"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}

              {produtoFichas.length === 0 && (
                <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">
                  Nenhuma ficha técnica adicionada. Clique em &quot;Adicionar Ficha&quot; para começar.
                </p>
              )}
            </div>

            {produtoFichas.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-4">Resumo do Produto</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/70 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Peso Total:</span>
                    <span className="ml-2 font-bold text-gray-900">{calculateProdutoPeso()}g</span>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Custo Total:</span>
                    <span className="ml-2 font-bold text-green-600">R$ {calculateProdutoCusto().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200/60">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 font-medium hover:scale-[1.02] transform"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span className="font-medium">{editingProduto ? 'Atualizar' : 'Criar'} Produto</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
