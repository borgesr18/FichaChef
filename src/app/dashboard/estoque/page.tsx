'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import ModernTable from '@/components/ui/ModernTable'
import { Warehouse, Plus, Search, Edit, Trash2, Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface EstoqueItem {
  id: string
  insumo: {
    id: string
    nome: string
    unidadeMedida: string
  }
  quantidade: number
  quantidadeMinima: number
  quantidadeMaxima: number
  valorUnitario: number
  dataVencimento?: string
  lote?: string
  localizacao: string
  status: 'normal' | 'baixo' | 'critico' | 'vencido'
  ultimaMovimentacao: string
}

interface MovimentacaoEstoque {
  id: string
  tipo: 'entrada' | 'saida'
  quantidade: number
  motivo: string
  observacoes?: string
  createdAt: string
}

export default function EstoquePage() {
  const [itensEstoque, setItensEstoque] = useState<EstoqueItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMovimentacao, setEditingMovimentacao] = useState<MovimentacaoEstoque | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const [formData, setFormData] = useState({
    insumoId: '',
    tipo: 'entrada' as 'entrada' | 'saida',
    quantidade: '',
    motivo: '',
    observacoes: '',
    valorUnitario: '',
    dataVencimento: '',
    lote: '',
    localizacao: ''
  })

  useEffect(() => {
    fetchEstoque()
  }, [])

  const fetchEstoque = async () => {
    try {
      const response = await fetch('/api/estoque')
      if (response.ok) {
        const data = await response.json()
        setItensEstoque(data)
      }
    } catch (error) {
      console.error('Error fetching estoque:', error)
    }
  }

  const handleOpenModal = (movimentacao?: MovimentacaoEstoque) => {
    if (movimentacao) {
      setEditingMovimentacao(movimentacao)
      setFormData({
        insumoId: '',
        tipo: movimentacao.tipo,
        quantidade: movimentacao.quantidade.toString(),
        motivo: movimentacao.motivo,
        observacoes: movimentacao.observacoes || '',
        valorUnitario: '',
        dataVencimento: '',
        lote: '',
        localizacao: ''
      })
    } else {
      setEditingMovimentacao(null)
      setFormData({
        insumoId: '',
        tipo: 'entrada',
        quantidade: '',
        motivo: '',
        observacoes: '',
        valorUnitario: '',
        dataVencimento: '',
        lote: '',
        localizacao: ''
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
      const url = editingMovimentacao ? `/api/estoque/${editingMovimentacao.id}` : '/api/estoque'
      const method = editingMovimentacao ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantidade: parseFloat(formData.quantidade),
          valorUnitario: formData.valorUnitario ? parseFloat(formData.valorUnitario) : undefined
        })
      })

      if (response.ok) {
        handleCloseModal()
        fetchEstoque()
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
      const response = await fetch(`/api/estoque/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchEstoque()
      }
    } catch (error) {
      console.error('Error deleting movimentacao:', error)
    }
  }

  const filteredItens = itensEstoque.filter(item => {
    const matchesSearch = item.insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.localizacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.lote && item.lote.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filtroStatus === 'todos' || item.status === filtroStatus
    
    return matchesSearch && matchesStatus
  })

  const calcularEstatisticas = () => {
    const total = itensEstoque.length
    const baixo = itensEstoque.filter(item => item.status === 'baixo').length
    const critico = itensEstoque.filter(item => item.status === 'critico').length
    const vencidos = itensEstoque.filter(item => item.status === 'vencido').length
    const valorTotal = itensEstoque.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0)

    return { total, baixo, critico, vencidos, valorTotal }
  }

  const stats = calcularEstatisticas()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800'
      case 'baixo': return 'bg-yellow-100 text-yellow-800'
      case 'critico': return 'bg-red-100 text-red-800'
      case 'vencido': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-4 w-4" />
      case 'baixo': return <AlertTriangle className="h-4 w-4" />
      case 'critico': return <AlertTriangle className="h-4 w-4" />
      case 'vencido': return <AlertTriangle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

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
                <h1 className="text-3xl font-bold text-white">Controle de Estoque</h1>
                <p className="text-blue-100 mt-1">Gestão de inventário e movimentações</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center font-medium hover:scale-[1.02] transform backdrop-blur-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Movimentação
            </button>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Itens</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl mr-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-slate-800">{stats.baixo}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl mr-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Estoque Crítico</p>
                <p className="text-2xl font-bold text-slate-800">{stats.critico}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Valor Total</p>
                <p className="text-2xl font-bold text-slate-800">R$ {stats.valorTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {(stats.critico > 0 || stats.vencidos > 0) && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Alertas do Sistema</h3>
            <div className="space-y-3">
              {stats.critico > 0 && (
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-red-800 text-sm">
                    {stats.critico} {stats.critico === 1 ? 'item com' : 'itens com'} estoque crítico
                  </span>
                </div>
              )}
              {stats.vencidos > 0 && (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-gray-800 text-sm">
                    {stats.vencidos} {stats.vencidos === 1 ? 'item vencido' : 'itens vencidos'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium text-slate-700">Filtrar por status:</span>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="normal">Normal</option>
              <option value="baixo">Estoque Baixo</option>
              <option value="critico">Estoque Crítico</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
        </div>

        {/* Tabela de estoque */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60">
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800">Itens em Estoque</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar itens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <ModernTable
            columns={[
              { key: 'insumo.nome', label: 'Insumo', sortable: true },
              { key: 'quantidade', label: 'Quantidade', sortable: true,
                render: (value: unknown, row: Record<string, unknown>): React.ReactNode => {
                  const item = row as unknown as EstoqueItem
                  return (
                    <span className="font-medium">
                      {value as number} {item.insumo.unidadeMedida}
                    </span>
                  )
                }},
              { key: 'quantidadeMinima', label: 'Mín/Máx', sortable: true,
                render: (value: unknown, row: Record<string, unknown>): React.ReactNode => {
                  const item = row as unknown as EstoqueItem
                  return (
                    <span className="text-sm text-slate-600">
                      {value as number} / {item.quantidadeMaxima}
                    </span>
                  )
                }},
              { key: 'valorUnitario', label: 'Valor Unit.', sortable: true,
                render: (value: unknown): React.ReactNode => (
                  <span className="font-medium">R$ {(value as number).toFixed(2)}</span>
                )},
              { key: 'localizacao', label: 'Localização', sortable: true },
              { key: 'lote', label: 'Lote', sortable: true,
                render: (value: unknown): React.ReactNode => (
                  <span className="text-sm text-slate-600">{(value as string) || '-'}</span>
                )},
              { key: 'status', label: 'Status', sortable: true,
                render: (value: unknown): React.ReactNode => (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusColor(value as string)}`}>
                    {getStatusIcon(value as string)}
                    {value as string}
                  </span>
                )},
              { key: 'actions', label: 'Ações', align: 'center',
                render: (_, row): React.ReactNode => (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleOpenModal()}
                      className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                      title="Nova Movimentação"
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
            data={filteredItens as unknown as Record<string, unknown>[]}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Insumo</label>
              <select
                value={formData.insumoId}
                onChange={(e) => setFormData({ ...formData, insumoId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione o insumo</option>
                {itensEstoque.map(item => (
                  <option key={item.id} value={item.insumo.id}>
                    {item.insumo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tipo de Movimentação</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'entrada' | 'saida' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Quantidade"
              type="number"
              step="0.01"
              value={formData.quantidade}
              onChange={(value) => setFormData({ ...formData, quantidade: value })}
              required
            />

            <FloatingLabelInput
              label="Valor Unitário"
              type="number"
              step="0.01"
              value={formData.valorUnitario}
              onChange={(value) => setFormData({ ...formData, valorUnitario: value })}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Lote"
              value={formData.lote}
              onChange={(value) => setFormData({ ...formData, lote: value })}
              placeholder="Número do lote"
            />

            <FloatingLabelInput
              label="Localização"
              value={formData.localizacao}
              onChange={(value) => setFormData({ ...formData, localizacao: value })}
              placeholder="Ex: Prateleira A1"
              required
            />
          </div>

          <FloatingLabelInput
            label="Motivo"
            value={formData.motivo}
            onChange={(value) => setFormData({ ...formData, motivo: value })}
            placeholder="Motivo da movimentação"
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observações adicionais..."
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
