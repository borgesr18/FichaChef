'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import ModernTable from '@/components/ui/ModernTable'
import { Warehouse, Plus, Search, TrendingUp, TrendingDown, Package, Edit, Trash2, Download } from 'lucide-react'
import { convertFormDataToNumbers, convertFormDataToDates } from '@/lib/form-utils'

interface MovimentacaoInsumo {
  id: string
  insumoId: string
  tipo: string
  quantidade: number
  motivo: string
  lote?: string
  dataValidade?: string
  createdAt: string
  insumo: { nome: string }
}

interface MovimentacaoProduto {
  id: string
  produtoId: string
  tipo: string
  quantidade: number
  motivo: string
  lote?: string
  dataValidade?: string
  createdAt: string
  produto: { nome: string }
}

interface Insumo {
  id: string
  nome: string
}

interface Produto {
  id: string
  nome: string
}

// Helper moved to module scope to keep stable reference for hooks
const coerceArray = <T,>(data: unknown, keys: string[] = []): T[] => {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object') {
    for (const key of keys) {
      const candidate = (data as Record<string, unknown>)[key]
      if (Array.isArray(candidate)) return candidate as T[]
    }
  }
  return []
}

export default function EstoquePage() {
  const [activeTab, setActiveTab] = useState<'insumos' | 'produtos'>('insumos')
  const [searchTerm, setSearchTerm] = useState('')
  const [movimentacoesInsumos, setMovimentacoesInsumos] = useState<MovimentacaoInsumo[]>([])
  const [movimentacoesProdutos, setMovimentacoesProdutos] = useState<MovimentacaoProduto[]>([])
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMovimentacao, setEditingMovimentacao] = useState<MovimentacaoInsumo | MovimentacaoProduto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<{
    itemId: string
    tipo: string
    quantidade: string
    motivo: string
    lote: string
    dataValidade: string
  }>({
    itemId: '',
    tipo: 'entrada',
    quantidade: '',
    motivo: '',
    lote: '',
    dataValidade: ''
  })

  const fetchMovimentacoesInsumos = useCallback(async () => {
    try {
      const response = await fetch('/api/movimentacoes-estoque')
      if (response.ok) {
        const data = await response.json()
        const arr = coerceArray<MovimentacaoInsumo>(data, ['data', 'movimentacoes', 'items'])
        setMovimentacoesInsumos(arr)
      } else {
        setMovimentacoesInsumos([])
      }
    } catch (error) {
      console.error('Error fetching movimentacoes insumos:', error)
      setMovimentacoesInsumos([])
    }
  }, [])

  const fetchMovimentacoesProdutos = useCallback(async () => {
    try {
      const response = await fetch('/api/movimentacoes-produto')
      if (response.ok) {
        const data = await response.json()
        const arr = coerceArray<MovimentacaoProduto>(data, ['data', 'movimentacoes', 'items'])
        setMovimentacoesProdutos(arr)
      } else {
        setMovimentacoesProdutos([])
      }
    } catch (error) {
      console.error('Error fetching movimentacoes produtos:', error)
      setMovimentacoesProdutos([])
    }
  }, [])

  const fetchInsumos = useCallback(async () => {
    try {
      const response = await fetch('/api/insumos')
      if (response.ok) {
        const data = await response.json()
        setInsumos(coerceArray<Insumo>(data, ['data', 'insumos', 'items']))
      } else {
        setInsumos([])
      }
    } catch (error) {
      console.error('Error fetching insumos:', error)
      setInsumos([])
    }
  }, [])

  const fetchProdutos = useCallback(async () => {
    try {
      const response = await fetch('/api/produtos')
      if (response.ok) {
        const data = await response.json()
        setProdutos(coerceArray<Produto>(data, ['data', 'produtos', 'items']))
      } else {
        setProdutos([])
      }
    } catch (error) {
      console.error('Error fetching produtos:', error)
      setProdutos([])
    }
  }, [])

  useEffect(() => {
    fetchMovimentacoesInsumos()
    fetchMovimentacoesProdutos()
    fetchInsumos()
    fetchProdutos()
  }, [fetchMovimentacoesInsumos, fetchMovimentacoesProdutos, fetchInsumos, fetchProdutos])

  const handleOpenModal = (movimentacao?: MovimentacaoInsumo | MovimentacaoProduto) => {
    setEditingMovimentacao(movimentacao || null)
    if (movimentacao) {
      setFormData({
        itemId: activeTab === 'insumos' ? (movimentacao as MovimentacaoInsumo).insumoId : (movimentacao as MovimentacaoProduto).produtoId,
        tipo: movimentacao.tipo,
        quantidade: movimentacao.quantidade.toString(),
        motivo: movimentacao.motivo,
        lote: movimentacao.lote || '',
        dataValidade: movimentacao.dataValidade?.split('T')[0] || ''
      })
    } else {
      setFormData({
        itemId: '',
        tipo: 'entrada',
        quantidade: '',
        motivo: '',
        lote: '',
        dataValidade: ''
      })
    }
    setIsModalOpen(true)
    setError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingMovimentacao(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const apiPath = activeTab === 'insumos' ? 'movimentacoes-estoque' : 'movimentacoes-produto'
      const itemKey = activeTab === 'insumos' ? 'insumoId' : 'produtoId'
      
      const url = editingMovimentacao ? `/api/${apiPath}/${editingMovimentacao.id}` : `/api/${apiPath}`
      const method = editingMovimentacao ? 'PUT' : 'POST'

      const convertedData = convertFormDataToNumbers(formData, ['quantidade'])
      const finalData = convertFormDataToDates(convertedData, ['dataValidade'])
      
      const requestData = {
        ...finalData,
        [itemKey]: finalData.itemId
      }
      delete requestData.itemId

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        handleCloseModal()
        if (activeTab === 'insumos') {
          fetchMovimentacoesInsumos()
        } else {
          fetchMovimentacoesProdutos()
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar movimentação')
      }
    } catch {
      setError('Erro ao salvar movimentação')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta movimentação?')) return

    try {
      const apiPath = activeTab === 'insumos' ? 'movimentacoes-estoque' : 'movimentacoes-produto'
      const response = await fetch(`/api/${apiPath}/${id}`, { method: 'DELETE' })
      if (response.ok) {
        if (activeTab === 'insumos') {
          fetchMovimentacoesInsumos()
        } else {
          fetchMovimentacoesProdutos()
        }
      }
    } catch (error) {
      console.error('Error deleting movimentacao:', error)
    }
  }

  const currentMovimentacoesUnsafe = activeTab === 'insumos' ? movimentacoesInsumos : movimentacoesProdutos
  const currentMovimentacoes = Array.isArray(currentMovimentacoesUnsafe) ? currentMovimentacoesUnsafe : []
  const currentItemsUnsafe = activeTab === 'insumos' ? insumos : produtos
  const currentItems = Array.isArray(currentItemsUnsafe) ? currentItemsUnsafe : []

  const filteredMovimentacoes = currentMovimentacoes.filter(mov => {
    const itemName = activeTab === 'insumos' 
      ? (mov as MovimentacaoInsumo).insumo.nome 
      : (mov as MovimentacaoProduto).produto.nome
    return itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           mov.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const today = useMemo(() => new Date().toDateString(), [])

  const entradasHoje = currentMovimentacoes.filter(mov => 
    mov.tipo === 'entrada' && 
    new Date(mov.createdAt).toDateString() === today
  ).length
  
  const saidasHoje = currentMovimentacoes.filter(mov => 
    mov.tipo === 'saida' && 
    new Date(mov.createdAt).toDateString() === today
  ).length

  // Funções auxiliares para o design
  const getMovimentacaoIcon = (tipo: string) => {
    return tipo === 'entrada' ? '📦' : '📤'
  }

  const getMovimentacaoGradient = (tipo: string) => {
    return tipo === 'entrada' ? 'from-green-400 to-emerald-500' : 'from-red-400 to-red-500'
  }

  // Estatísticas
  const getStats = () => {
    const totalMovimentacoes = currentMovimentacoes.length
    const totalEntradas = currentMovimentacoes.filter(m => m.tipo === 'entrada').length
    const totalSaidas = currentMovimentacoes.filter(m => m.tipo === 'saida').length
    const itensAtivos = currentItems.length

    return { totalMovimentacoes, totalEntradas, totalSaidas, itensAtivos, entradasHoje, saidasHoje }
  }

  const stats = getStats()

  if (loading && currentMovimentacoes.length === 0) {
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
                Estoque
              </h1>
              <p className="text-gray-600 text-lg">Controle de estoque e inventário</p>
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
                Nova Movimentação
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/20 mb-8 inline-flex">
          <button
            onClick={() => setActiveTab('insumos')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'insumos'
                ? 'bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            Insumos
          </button>
          <button
            onClick={() => setActiveTab('produtos')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'produtos'
                ? 'bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            Produtos
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Buscar Movimentação</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={`Buscar movimentações de ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Entradas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.entradasHoje}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% este mês
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Saídas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.saidasHoje}</p>
                <p className="text-xs text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -5% este mês
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingDown className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Movimentações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMovimentacoes}</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <Package className="h-3 w-3 mr-1" />
                  {stats.totalEntradas} entradas
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
                <p className="text-sm font-medium text-gray-600">{activeTab === 'insumos' ? 'Insumos' : 'Produtos'} Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.itensAtivos}</p>
                <p className="text-xs text-purple-600 flex items-center">
                  <Warehouse className="h-3 w-3 mr-1" />
                  Em estoque
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Warehouse className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Movimentações Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredMovimentacoes.map((movimentacao) => {
            const itemName = activeTab === 'insumos' 
              ? (movimentacao as MovimentacaoInsumo).insumo.nome 
              : (movimentacao as MovimentacaoProduto).produto.nome

            return (
              <div
                key={movimentacao.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Barra colorida por tipo */}
                <div className={`h-2 bg-gradient-to-r ${getMovimentacaoGradient(movimentacao.tipo)}`}></div>
                
                <div className="p-6">
                  {/* Header do card */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getMovimentacaoIcon(movimentacao.tipo)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">{itemName}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(movimentacao.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      movimentacao.tipo === 'entrada' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </div>

                  {/* Informações principais */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quantidade:</span>
                      <span className="font-semibold text-gray-900">{movimentacao.quantidade}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Motivo:</span>
                      <span className="font-medium text-gray-700 truncate ml-2">{movimentacao.motivo}</span>
                    </div>

                    {movimentacao.lote && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Lote:</span>
                        <span className="font-medium text-gray-700">{movimentacao.lote}</span>
                      </div>
                    )}

                    {movimentacao.dataValidade && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Validade:</span>
                        <span className="font-medium text-gray-700">
                          {new Date(movimentacao.dataValidade).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleOpenModal(movimentacao)}
                      className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(movimentacao.id)}
                      className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabela Moderna */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Histórico de Movimentações - {activeTab === 'insumos' ? 'Insumos' : 'Produtos'}
            </h3>
          </div>

          <ModernTable
            columns={[
              { key: 'itemName', label: activeTab === 'insumos' ? 'Insumo' : 'Produto', sortable: true,
                render: (_, row) => activeTab === 'insumos' 
                  ? (row as unknown as MovimentacaoInsumo).insumo.nome 
                  : (row as unknown as MovimentacaoProduto).produto.nome
              },
              { key: 'tipo', label: 'Tipo', sortable: true,
                render: (value) => (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    value === 'entrada' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {value === 'entrada' ? 'Entrada' : 'Saída'}
                  </span>
                )},
              { key: 'quantidade', label: 'Quantidade', sortable: true, align: 'right' },
              { key: 'motivo', label: 'Motivo', sortable: true },
              { key: 'createdAt', label: 'Data', sortable: true,
                render: (value) => new Date(value as string).toLocaleDateString('pt-BR') },
              { key: 'actions', label: 'Ações', align: 'center',
                render: (_, row) => (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(row as unknown as MovimentacaoInsumo | MovimentacaoProduto)}
                      className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id as string)}
                      className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
            ]}
            data={(Array.isArray(filteredMovimentacoes) ? filteredMovimentacoes : []) as unknown as Record<string, unknown>[]}
            searchable={false}
            pagination={true}
            pageSize={10}
            loading={loading}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMovimentacao ? 'Editar Movimentação' : 'Nova Movimentação'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <FloatingLabelSelect
            label={`${activeTab === 'insumos' ? 'Insumo' : 'Produto'}`}
            value={formData.itemId}
            onChange={(value) => setFormData({ ...formData, itemId: value })}
            options={currentItems.map(item => ({ value: item.id, label: item.nome }))}
            required
            error={error && !formData.itemId ? `${activeTab === 'insumos' ? 'Insumo' : 'Produto'} é obrigatório` : ''}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelSelect
              label="Tipo"
              value={formData.tipo}
              onChange={(value) => setFormData({ ...formData, tipo: value })}
              options={[
                { value: 'entrada', label: 'Entrada' },
                { value: 'saida', label: 'Saída' }
              ]}
              required
            />

            <FloatingLabelInput
              label="Quantidade"
              type="number"
              step="0.01"
              value={formData.quantidade}
              onChange={(value) => setFormData({ ...formData, quantidade: value })}
              required
              error={error && !formData.quantidade ? 'Quantidade é obrigatória' : ''}
            />
          </div>

          <FloatingLabelInput
            label="Motivo"
            value={formData.motivo}
            onChange={(value) => setFormData({ ...formData, motivo: value })}
            required
            error={error && !formData.motivo ? 'Motivo é obrigatório' : ''}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Lote"
              value={formData.lote}
              onChange={(value) => setFormData({ ...formData, lote: value })}
            />

            <FloatingLabelInput
              label="Data de Validade"
              type="date"
              value={formData.dataValidade}
              onChange={(value) => setFormData({ ...formData, dataValidade: value })}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium hover:scale-[1.02] transform"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              {editingMovimentacao ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
