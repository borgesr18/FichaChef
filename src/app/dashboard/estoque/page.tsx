'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
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

  const entradasHoje = currentMovimentacoes.filter(mov => 
    mov.tipo === 'entrada' && 
    new Date(mov.createdAt).toDateString() === new Date().toDateString()
  ).length
  const saidasHoje = currentMovimentacoes.filter(mov => 
    mov.tipo === 'saida' && 
    new Date(mov.createdAt).toDateString() === new Date().toDateString()
  ).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Warehouse className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
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

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={`Buscar movimentações de ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'insumos' ? 'Insumo' : 'Produto'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovimentacoes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm 
                        ? 'Nenhuma movimentação encontrada.' 
                        : `Nenhuma movimentação de ${activeTab} registrada. Clique em "Nova Movimentação" para começar.`
                      }
                    </td>
                  </tr>
                ) : (
                  filteredMovimentacoes.map((movimentacao) => (
                    <tr key={movimentacao.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {activeTab === 'insumos' 
                          ? (movimentacao as MovimentacaoInsumo).insumo.nome 
                          : (movimentacao as MovimentacaoProduto).produto.nome
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          movimentacao.tipo === 'entrada' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movimentacao.quantidade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movimentacao.motivo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(movimentacao.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(movimentacao)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(movimentacao.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {activeTab === 'insumos' ? 'Insumo' : 'Produto'} *
            </label>
            <select
              value={formData.itemId}
              onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">{`Selecione um ${activeTab === 'insumos' ? 'insumo' : 'produto'}`}</option>
              {currentItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo *
            </label>
            <input
              type="text"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lote
              </label>
              <input
                type="text"
                value={formData.lote}
                onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Validade
              </label>
              <input
                type="date"
                value={formData.dataValidade}
                onChange={(e) => setFormData({ ...formData, dataValidade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
