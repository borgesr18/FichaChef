'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import ModernTable from '@/components/ui/ModernTable'
import { ShoppingCart, Plus, Search, Edit, Trash2, X, Package, TrendingUp, DollarSign, Target } from 'lucide-react'
import { convertFormDataToNumbers } from '@/lib/form-utils'

interface FichaTecnica {
  id: string
  nome: string
}

interface ProdutoFicha {
  id: string
  fichaTecnicaId: string
  quantidade: number
  fichaTecnica: FichaTecnica
}

interface Produto {
  id: string
  nome: string
  descricao: string
  categoria: string
  precoVenda: number
  margemLucro: number
  ativo: boolean
  produtoFichas: ProdutoFicha[]
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    precoVenda: '',
    margemLucro: '',
    ativo: true
  })

  const [fichasAssociadas, setFichasAssociadas] = useState<Array<{
    fichaTecnicaId: string
    quantidade: string
  }>>([])

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
      console.error('Error fetching fichas tecnicas:', error)
    }
  }

  const handleOpenModal = (produto?: Produto) => {
    setEditingProduto(produto || null)
    if (produto) {
      setFormData({
        nome: produto.nome,
        descricao: produto.descricao,
        categoria: produto.categoria,
        precoVenda: produto.precoVenda.toString(),
        margemLucro: produto.margemLucro.toString(),
        ativo: produto.ativo
      })
      setFichasAssociadas(produto.produtoFichas.map(pf => ({
        fichaTecnicaId: pf.fichaTecnicaId,
        quantidade: pf.quantidade.toString()
      })))
    } else {
      setFormData({
        nome: '',
        descricao: '',
        categoria: '',
        precoVenda: '',
        margemLucro: '',
        ativo: true
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingProduto ? `/api/produtos/${editingProduto.id}` : '/api/produtos'
      const method = editingProduto ? 'PUT' : 'POST'

      const convertedData = convertFormDataToNumbers(formData, ['precoVenda', 'margemLucro'])
      const convertedFichas = fichasAssociadas.map(ficha => ({
        fichaTecnicaId: ficha.fichaTecnicaId,
        quantidade: parseFloat(ficha.quantidade) || 0
      }))

      const requestData = {
        ...convertedData,
        produtoFichas: convertedFichas
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
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

  const addFichaAssociada = () => {
    setFichasAssociadas([...fichasAssociadas, { fichaTecnicaId: '', quantidade: '1' }])
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

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header com gradiente azul - estilo UXPilot */}
        <div className="uxpilot-header-gradient">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Produtos</h1>
                <p className="text-blue-100 mt-1">Gestão de produtos e composições</p>
              </div>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center transition-all duration-300 border border-white/20"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-medium">Novo Produto</span>
            </button>
          </div>
        </div>

        {/* Cards de métricas - estilo UXPilot */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl mr-4">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total de Produtos</p>
                  <p className="text-2xl font-bold text-slate-800">{produtos.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl mr-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Preço Médio</p>
                  <p className="text-2xl font-bold text-slate-800">
                    R$ {produtos.length > 0 ? (produtos.reduce((sum, p) => sum + p.precoVenda, 0) / produtos.length).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-xl mr-4">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Margem Média</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {produtos.length > 0 ? (produtos.reduce((sum, p) => sum + p.margemLucro, 0) / produtos.length).toFixed(1) : '0.0'}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl mr-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Com Fichas</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {produtos.filter(p => p.produtoFichas.length > 0).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de produtos */}
        <div className="uxpilot-card">
          <div className="p-6 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="uxpilot-input pl-10"
              />
            </div>
          </div>

          <ModernTable
            columns={[
              { key: 'nome', label: 'Nome', sortable: true },
              { key: 'categoria', label: 'Categoria', sortable: true },
              { key: 'precoVenda', label: 'Preço', sortable: true, align: 'right',
                render: (value) => `R$ ${(value as number).toFixed(2)}` },
              { key: 'margemLucro', label: 'Margem', sortable: true, align: 'right',
                render: (value) => `${(value as number).toFixed(1)}%` },
              { key: 'produtoFichas', label: 'Fichas', sortable: false, align: 'center',
                render: (value) => (value as ProdutoFicha[]).length },
              { key: 'ativo', label: 'Status', sortable: true,
                render: (value) => (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {value ? 'Ativo' : 'Inativo'}
                  </span>
                )},
              { key: 'actions', label: 'Ações', align: 'center',
                render: (_, row) => (
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
              label="Nome"
              value={formData.nome}
              onChange={(value) => setFormData({ ...formData, nome: value })}
              required
              error={error && !formData.nome ? 'Nome é obrigatório' : ''}
            />

            <FloatingLabelInput
              label="Categoria"
              value={formData.categoria}
              onChange={(value) => setFormData({ ...formData, categoria: value })}
              required
              error={error && !formData.categoria ? 'Categoria é obrigatória' : ''}
            />
          </div>

          <FloatingLabelInput
            label="Descrição"
            value={formData.descricao}
            onChange={(value) => setFormData({ ...formData, descricao: value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Preço de Venda"
              type="number"
              step="0.01"
              value={formData.precoVenda}
              onChange={(value) => setFormData({ ...formData, precoVenda: value })}
              required
              error={error && !formData.precoVenda ? 'Preço de venda é obrigatório' : ''}
            />

            <FloatingLabelInput
              label="Margem de Lucro (%)"
              type="number"
              step="0.1"
              value={formData.margemLucro}
              onChange={(value) => setFormData({ ...formData, margemLucro: value })}
              required
              error={error && !formData.margemLucro ? 'Margem de lucro é obrigatória' : ''}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="ativo"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
              Produto ativo
            </label>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Fichas Técnicas Associadas</h4>
              <button
                type="button"
                onClick={addFichaAssociada}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Ficha
              </button>
            </div>

            {fichasAssociadas.map((ficha, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="md:col-span-2">
                  <FloatingLabelSelect
                    label="Ficha Técnica"
                    value={ficha.fichaTecnicaId}
                    onChange={(value) => updateFichaAssociada(index, 'fichaTecnicaId', value)}
                    options={fichasTecnicas.map(ft => ({ value: ft.id, label: ft.nome }))}
                    required
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <FloatingLabelInput
                    label="Quantidade"
                    type="number"
                    step="0.01"
                    value={ficha.quantidade}
                    onChange={(value) => updateFichaAssociada(index, 'quantidade', value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeFichaAssociada(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <X className="h-4 w-4" />
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
