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
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center group">
            <div className="p-2 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl mr-3 group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
              <Package className="h-6 w-6 text-orange-600 transition-transform duration-200 group-hover:rotate-12" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Insumos</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center transition-all duration-300 hover:shadow-lg hover:shadow-orange-200/50 hover:scale-[1.02] backdrop-blur-sm border border-orange-400/20"
          >
            <Plus className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
            <span className="font-medium">Novo Insumo</span>
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300">
          <div className="p-6 border-b border-slate-200/60">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-all duration-200 group-focus-within:text-orange-500 group-focus-within:scale-110" />
              <input
                type="text"
                placeholder="Buscar insumos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-md"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/60">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-800 transition-colors duration-200">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-800 transition-colors duration-200">
                    Marca
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-800 transition-colors duration-200">
                    Categoria
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-800 transition-colors duration-200">
                    Peso Líquido
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-800 transition-colors duration-200">
                    Preço
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-800 transition-colors duration-200">
                    Custo/g
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-800 transition-colors duration-200">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/60 backdrop-blur-sm divide-y divide-slate-200/60">
                {filteredInsumos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-4 animate-pulse">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-110 group">
                          <Package className="h-8 w-8 text-orange-400 animate-bounce group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-slate-600 font-medium text-lg">
                            {searchTerm ? 'Nenhum insumo encontrado.' : 'Nenhum insumo cadastrado.'}
                          </p>
                          {!searchTerm && (
                            <p className="text-slate-500 text-sm animate-pulse">
                              Clique em &quot;Novo Insumo&quot; para começar.
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInsumos.map((insumo, index) => (
                    <tr 
                      key={insumo.id} 
                      className="hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-orange-100/20 hover:shadow-lg transition-all duration-300 group hover:scale-[1.01] hover:-translate-y-0.5"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 group-hover:text-orange-700 transition-all duration-300">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110"></div>
                          <span>{insumo.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 group-hover:text-slate-700 transition-all duration-300">
                        {insumo.marca || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 group-hover:text-slate-700 transition-all duration-300">
                        {insumo.fornecedorRel?.nome || insumo.fornecedor || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 group-hover:text-slate-700 transition-all duration-300">
                        {insumo.categoria.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 group-hover:text-slate-700 transition-all duration-300">
                        <span className="px-2 py-1 bg-slate-100 group-hover:bg-slate-200 rounded-lg text-xs font-medium transition-all duration-300 transform group-hover:scale-105">{insumo.pesoLiquidoGramas}g</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 group-hover:text-slate-700 transition-all duration-300">
                        <span className="px-2 py-1 bg-green-100 group-hover:bg-green-200 text-green-800 group-hover:text-green-900 rounded-lg text-xs font-medium transition-all duration-300 transform group-hover:scale-105">R$ {insumo.precoUnidade.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 group-hover:text-slate-700 transition-all duration-300">
                        <span className="px-2 py-1 bg-blue-100 group-hover:bg-blue-200 text-blue-800 group-hover:text-blue-900 rounded-lg text-xs font-medium transition-all duration-300 transform group-hover:scale-105">R$ {(insumo.precoUnidade / insumo.pesoLiquidoGramas).toFixed(4)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2 opacity-70 group-hover:opacity-100 transition-all duration-300">
                          <button
                            onClick={() => handleOpenModal(insumo)}
                            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-all duration-300 hover:scale-125 hover:shadow-lg hover:rotate-3 transform"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
                          </button>
                          <button
                            onClick={() => handleDelete(insumo.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-125 hover:shadow-lg hover:-rotate-3 transform"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
                          </button>
                        </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-3 group-focus-within:text-orange-600 transition-colors duration-300">
                Nome *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md hover:scale-[1.01] placeholder-slate-400"
                  placeholder="Digite o nome do insumo"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-3 group-focus-within:text-orange-600 transition-colors duration-300">
                Marca
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md hover:scale-[1.01] placeholder-slate-400"
                  placeholder="Digite a marca (opcional)"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-3 group-focus-within:text-orange-600 transition-colors duration-300">
                Fornecedor
              </label>
              <div className="relative">
                <select
                  value={formData.fornecedorId}
                  onChange={(e) => setFormData({ ...formData, fornecedorId: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md hover:scale-[1.01] appearance-none cursor-pointer"
                >
                  <option value="">Selecione um fornecedor</option>
                  {fornecedores.map((fornecedor) => (
                    <option key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <p className="mt-2 text-xs text-slate-500 group-focus-within:text-slate-600 transition-colors duration-300">
                Não encontrou o fornecedor? <a href="/dashboard/fornecedores" className="text-orange-600 hover:text-orange-800 font-medium transition-colors duration-200 hover:underline">Cadastre aqui</a>
              </p>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-3 group-focus-within:text-orange-600 transition-colors duration-300">
                Categoria *
              </label>
              <div className="relative">
                <select
                  value={formData.categoriaId}
                  onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md hover:scale-[1.01] appearance-none cursor-pointer"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
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

          <div className="mt-8 pt-8 border-t border-slate-200/60">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Informações Nutricionais (por 100g)
              </h3>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">Opcional</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-3 group-focus-within:text-orange-600 transition-colors duration-300">
                  <span className="flex items-center space-x-2">
                    <span>Calorias</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">kcal</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.calorias}
                    onChange={(e) => setFormData({ ...formData, calorias: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md hover:scale-[1.01] placeholder-slate-400"
                    placeholder="Ex: 250"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-3 group-focus-within:text-orange-600 transition-colors duration-300">
                  <span className="flex items-center space-x-2">
                    <span>Proteínas</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">g</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.proteinas}
                    onChange={(e) => setFormData({ ...formData, proteinas: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md hover:scale-[1.01] placeholder-slate-400"
                    placeholder="Ex: 15.5"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-3 group-focus-within:text-orange-600 transition-colors duration-300">
                  <span className="flex items-center space-x-2">
                    <span>Carboidratos</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">g</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.carboidratos}
                    onChange={(e) => setFormData({ ...formData, carboidratos: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md hover:scale-[1.01] placeholder-slate-400"
                    placeholder="Ex: 30.2"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
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
              className="group px-6 py-3 text-slate-700 bg-slate-200/80 backdrop-blur-sm rounded-xl hover:bg-slate-300/80 transition-all duration-300 hover:shadow-md hover:scale-[1.02] border border-slate-300/60"
            >
              <span className="font-medium">Cancelar</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-orange-200/50 hover:scale-[1.02] backdrop-blur-sm border border-orange-400/20"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="font-medium">Salvando...</span>
                </div>
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
