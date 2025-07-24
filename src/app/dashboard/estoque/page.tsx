'use client'

import React, { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import ModernTable from '@/components/ui/ModernTable'
import { Warehouse, Plus, Search, TrendingUp, TrendingDown, AlertTriangle, Package, ShoppingCart, Edit, Trash2 } from 'lucide-react'
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

  useEffect(() => {
    fetchMovimentacoesInsumos()
    fetchMovimentacoesProdutos()
    fetchInsumos()
    fetchProdutos()
  }, [])

  const fetchMovimentacoesInsumos = async () => {
    try {
      const response = await fetch('/api/movimentacoes-estoque')
      if (response.ok) {
        const data = await response.json()
        setMovimentacoesInsumos(data)
      }
    } catch (error) {
      console.error('Error fetching movimentacoes insumos:', error)
    }
  }

  const fetchMovimentacoesProdutos = async () => {
    try {
      const response = await fetch('/api/movimentacoes-produto')
      if (response.ok) {
        const data = await response.json()
        setMovimentacoesProdutos(data)
      }
    } catch (error) {
      console.error('Error fetching movimentacoes produtos:', error)
    }
  }

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

  const currentMovimentacoes = activeTab === 'insumos' ? movimentacoesInsumos : movimentacoesProdutos
  const currentItems = activeTab === 'insumos' ? insumos : produtos

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mr-3 transform transition-transform duration-200 hover:scale-110">
              <Warehouse className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Estoque</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
          >
            <Plus className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:rotate-90" />
            Nova Movimentação
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('insumos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'insumos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              Insumos
            </button>
            <button
              onClick={() => setActiveTab('produtos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'produtos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShoppingCart className="h-4 w-4 inline mr-2" />
              Produtos
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Warehouse className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Itens</p>
                <p className="text-2xl font-bold text-gray-900">{currentItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entradas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{entradasHoje}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saídas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{saidasHoje}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Movimentações</p>
                <p className="text-2xl font-bold text-gray-900">{currentMovimentacoes.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300">
          <div className="p-6 border-b border-slate-200/60">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-all duration-200 group-focus-within:text-orange-500 group-focus-within:scale-110" />
              <input
                type="text"
                placeholder={`Buscar movimentações de ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-md"
              />
            </div>
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
            data={filteredMovimentacoes as unknown as Record<string, unknown>[]}
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
                <span className="font-medium">Salvar</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
