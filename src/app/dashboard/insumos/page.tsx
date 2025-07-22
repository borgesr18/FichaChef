'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { Package, Plus, Search, Edit, Trash2 } from 'lucide-react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    sodio: ''
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
        sodio: insumo.sodio?.toString() || ''
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
        sodio: ''
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
        fetchInsumos()
      }
    } catch (error) {
      console.error('Error deleting insumo:', error)
    }
  }

  const filteredInsumos = insumos.filter(insumo =>
    insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insumo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insumo.categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Insumos</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Insumo
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar insumos..."
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
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marca
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peso Líquido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo/g
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInsumos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'Nenhum insumo encontrado.' : 'Nenhum insumo cadastrado. Clique em "Novo Insumo" para começar.'}
                    </td>
                  </tr>
                ) : (
                  filteredInsumos.map((insumo) => (
                    <tr key={insumo.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {insumo.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {insumo.marca || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {insumo.fornecedorRel?.nome || insumo.fornecedor || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {insumo.categoria.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {insumo.pesoLiquidoGramas}g
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        R$ {insumo.precoUnidade.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        R$ {(insumo.precoUnidade / insumo.pesoLiquidoGramas).toFixed(4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(insumo)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(insumo.id)}
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
        title={editingInsumo ? 'Editar Insumo' : 'Novo Insumo'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fornecedor
              </label>
              <select
                value={formData.fornecedorId}
                onChange={(e) => setFormData({ ...formData, fornecedorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione um fornecedor</option>
                {fornecedores.map((fornecedor) => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Não encontrou o fornecedor? <a href="/dashboard/fornecedores" className="text-blue-600 hover:text-blue-800">Cadastre aqui</a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formData.categoriaId}
                onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade de Compra *
              </label>
              <select
                value={formData.unidadeCompraId}
                onChange={(e) => setFormData({ ...formData, unidadeCompraId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione uma unidade</option>
                {unidades.map((unidade) => (
                  <option key={unidade.id} value={unidade.id}>
                    {unidade.nome} ({unidade.simbolo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso Líquido (gramas) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.pesoLiquidoGramas}
                onChange={(e) => setFormData({ ...formData, pesoLiquidoGramas: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço da Unidade (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precoUnidade}
                onChange={(e) => setFormData({ ...formData, precoUnidade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informações Nutricionais (por 100g) - Opcional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calorias (kcal)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.calorias}
                  onChange={(e) => setFormData({ ...formData, calorias: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 250"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proteínas (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.proteinas}
                  onChange={(e) => setFormData({ ...formData, proteinas: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 15.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carboidratos (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.carboidratos}
                  onChange={(e) => setFormData({ ...formData, carboidratos: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 30.2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gorduras (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.gorduras}
                  onChange={(e) => setFormData({ ...formData, gorduras: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 8.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fibras (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fibras}
                  onChange={(e) => setFormData({ ...formData, fibras: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 2.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sódio (mg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.sodio}
                  onChange={(e) => setFormData({ ...formData, sodio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 150"
                />
              </div>
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
