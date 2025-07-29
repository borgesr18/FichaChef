'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import ModernTable from '@/components/ui/ModernTable'
import { ShoppingBag, Plus, Search, Edit, Trash2, Package, DollarSign, TrendingUp, Star } from 'lucide-react'

interface Produto {
  id: string
  nome: string
  descricao: string
  categoria: string
  preco: number
  custoProducao: number
  margemLucro: number
  tempoPreparoMinutos: number
  porcoes: number
  ativo: boolean
  avaliacao: number
  fichaTecnica?: {
    id: string
    nome: string
  }
  _count: {
    fichasAssociadas: number
  }
  createdAt: string
}

interface FichaAssociada {
  fichaTecnicaId: string
  quantidade: string
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [fichasAssociadas, setFichasAssociadas] = useState<FichaAssociada[]>([])

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    preco: '',
    custoProducao: '',
    tempoPreparoMinutos: '',
    porcoes: '',
    ativo: true,
    avaliacao: 5
  })

  useEffect(() => {
    fetchProdutos()
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

  const handleOpenModal = (produto?: Produto) => {
    if (produto) {
      setEditingProduto(produto)
      setFormData({
        nome: produto.nome,
        descricao: produto.descricao,
        categoria: produto.categoria,
        preco: produto.preco.toString(),
        custoProducao: produto.custoProducao.toString(),
        tempoPreparoMinutos: produto.tempoPreparoMinutos.toString(),
        porcoes: produto.porcoes.toString(),
        ativo: produto.ativo,
        avaliacao: produto.avaliacao
      })
    } else {
      setEditingProduto(null)
      setFormData({
        nome: '',
        descricao: '',
        categoria: '',
        preco: '',
        custoProducao: '',
        tempoPreparoMinutos: '',
        porcoes: '',
        ativo: true,
        avaliacao: 5
      })
      setFichasAssociadas([])
    }
    setIsModalOpen(true)
    setError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduto(null)
    setError('')
  }

  const addFichaAssociada = () => {
    setFichasAssociadas([...fichasAssociadas, { fichaTecnicaId: '', quantidade: '' }])
  }

  const removeFichaAssociada = (index: number) => {
    setFichasAssociadas(fichasAssociadas.filter((_, i) => i !== index))
  }

  const updateFichaAssociada = (index: number, field: string, value: string) => {
    const updated = [...fichasAssociadas]
    updated[index] = { 
      ...updated[index], 
      [field]: value,
      fichaTecnicaId: updated[index]?.fichaTecnicaId || '',
      quantidade: updated[index]?.quantidade || ''
    }
    setFichasAssociadas(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingProduto ? `/api/produtos/${editingProduto.id}` : '/api/produtos'
      const method = editingProduto ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preco: parseFloat(formData.preco),
          custoProducao: parseFloat(formData.custoProducao),
          tempoPreparoMinutos: parseInt(formData.tempoPreparoMinutos),
          porcoes: parseInt(formData.porcoes),
          fichasAssociadas
        })
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

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria = filtroCategoria === 'todas' || produto.categoria === filtroCategoria
    
    return matchesSearch && matchesCategoria
  })

  const calcularEstatisticas = () => {
    const total = produtos.length
    const ativos = produtos.filter(p => p.ativo).length
    const precoMedio = produtos.reduce((acc, p) => acc + p.preco, 0) / total || 0
    const margemMedia = produtos.reduce((acc, p) => acc + p.margemLucro, 0) / total || 0

    return { total, ativos, precoMedio, margemMedia }
  }

  const stats = calcularEstatisticas()

  const categorias = [...new Set(produtos.map(p => p.categoria))].filter(Boolean)

  const renderStars = (avaliacao: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < avaliacao ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header com gradiente azul - estilo UXPilot */}
        <div className="uxpilot-header-gradient">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Produtos</h1>
                <p className="text-blue-100 mt-1">Gestão de produtos finais e cardápio</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center font-medium hover:scale-[1.02] transform backdrop-blur-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Produto
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
                <p className="text-sm font-medium text-slate-600">Total Produtos</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Produtos Ativos</p>
                <p className="text-2xl font-bold text-slate-800">{stats.ativos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl mr-4">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Preço Médio</p>
                <p className="text-2xl font-bold text-slate-800">R$ {stats.precoMedio.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl mr-4">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Margem Média</p>
                <p className="text-2xl font-bold text-slate-800">{stats.margemMedia.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium text-slate-700">Filtrar por categoria:</span>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todas">Todas as categorias</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela de produtos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60">
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800">Lista de Produtos</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <ModernTable
            columns={[
              { key: 'nome', label: 'Nome', sortable: true },
              { key: 'categoria', label: 'Categoria', sortable: true,
                render: (value: unknown): React.ReactNode => (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {value as string}
                  </span>
                )},
              { key: 'preco', label: 'Preço', sortable: true,
                render: (value: unknown): React.ReactNode => (
                  <span className="font-medium text-green-600">R$ {(value as number).toFixed(2)}</span>
                )},
              { key: 'custoProducao', label: 'Custo', sortable: true,
                render: (value: unknown): React.ReactNode => (
                  <span className="font-medium text-red-600">R$ {(value as number).toFixed(2)}</span>
                )},
              { key: 'margemLucro', label: 'Margem', sortable: true,
                render: (value: unknown): React.ReactNode => (
                  <span className={`font-medium ${(value as number) > 30 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {(value as number).toFixed(1)}%
                  </span>
                )},
              { key: 'tempoPreparoMinutos', label: 'Tempo', sortable: true,
                render: (value: unknown): React.ReactNode => (
                  <span className="text-sm text-slate-600">{value as number} min</span>
                )},
              { key: 'porcoes', label: 'Porções', sortable: true, align: 'center' },
              { key: 'avaliacao', label: 'Avaliação', sortable: true,
                render: (value: unknown): React.ReactNode => (
                  <div className="flex items-center space-x-1">
                    {renderStars(value as number)}
                  </div>
                )},
              { key: 'ativo', label: 'Status', sortable: true,
                render: (value: unknown): React.ReactNode => (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {value ? 'Ativo' : 'Inativo'}
                  </span>
                )},
              { key: 'actions', label: 'Ações', align: 'center',
                render: (_, row): React.ReactNode => (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(row as unknown as Produto)}
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
            data={filteredProdutos as unknown as Record<string, unknown>[]}
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
        title={editingProduto ? 'Editar Produto' : 'Novo Produto'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Nome do Produto"
              value={formData.nome}
              onChange={(value) => setFormData({ ...formData, nome: value })}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Categoria</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione a categoria</option>
                <option value="Pratos Principais">Pratos Principais</option>
                <option value="Entradas">Entradas</option>
                <option value="Sobremesas">Sobremesas</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Lanches">Lanches</option>
                <option value="Saladas">Saladas</option>
                <option value="Massas">Massas</option>
                <option value="Carnes">Carnes</option>
                <option value="Peixes">Peixes</option>
                <option value="Vegetariano">Vegetariano</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrição detalhada do produto..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Preço de Venda"
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(value) => setFormData({ ...formData, preco: value })}
              placeholder="0.00"
              required
            />

            <FloatingLabelInput
              label="Custo de Produção"
              type="number"
              step="0.01"
              value={formData.custoProducao}
              onChange={(value) => setFormData({ ...formData, custoProducao: value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Tempo de Preparo (minutos)"
              type="number"
              value={formData.tempoPreparoMinutos}
              onChange={(value) => setFormData({ ...formData, tempoPreparoMinutos: value })}
              required
            />

            <FloatingLabelInput
              label="Número de Porções"
              type="number"
              value={formData.porcoes}
              onChange={(value) => setFormData({ ...formData, porcoes: value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Avaliação</label>
              <select
                value={formData.avaliacao}
                onChange={(e) => setFormData({ ...formData, avaliacao: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 estrelas)</option>
                <option value={4}>⭐⭐⭐⭐ (4 estrelas)</option>
                <option value={3}>⭐⭐⭐ (3 estrelas)</option>
                <option value={2}>⭐⭐ (2 estrelas)</option>
                <option value={1}>⭐ (1 estrela)</option>
              </select>
            </div>

            <div className="flex items-center pt-8">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                Produto ativo no cardápio
              </label>
            </div>
          </div>

          {/* Fichas Técnicas Associadas */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Fichas Técnicas Associadas</h3>
              <button
                type="button"
                onClick={addFichaAssociada}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Adicionar Ficha
              </button>
            </div>

            {fichasAssociadas.map((ficha, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Ficha Técnica</label>
                  <select
                    value={ficha.fichaTecnicaId}
                    onChange={(e) => updateFichaAssociada(index, 'fichaTecnicaId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma ficha</option>
                    {/* Aqui você carregaria as fichas técnicas disponíveis */}
                  </select>
                </div>

                <FloatingLabelInput
                  label="Quantidade"
                  value={ficha.quantidade}
                  onChange={(value) => updateFichaAssociada(index, 'quantidade', value)}
                />

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeFichaAssociada(index)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
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
