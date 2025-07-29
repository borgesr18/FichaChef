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
        {/* Header com gradiente azul - estilo UXPilot */}
        <div className="uxpilot-header-gradient">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <Warehouse className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Estoque</h1>
                <p className="text-blue-100 mt-1">Controle de estoque e inventário</p>
              </div>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center transition-all duration-300 border border-white/20"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-medium">Nova Movimentação</span>
            </button>
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Entradas Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">{entradasHoje}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Saídas Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">{saidasHoje}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Movimentações</p>
                  <p className="text-2xl font-bold text-gray-900">{currentMovimentacoes.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="uxpilot-card">
          <div className="p-6 border-b border-slate-200">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('insumos')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'insumos'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Package className="h-4 w-4 inline mr-2" />
                Insumos
              </button>
              <button
                onClick={() => setActiveTab('produtos')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'produtos'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ShoppingCart className="h-4 w-4 inline mr-2" />
                Produtos
              </button>
            </div>
          </div>

          <div className="p-6 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder={`Buscar movimentações de ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="uxpilot-input pl-10"
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
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="font-medium">Salvando...</span>
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

