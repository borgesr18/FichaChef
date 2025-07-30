'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Settings, Plus, Edit, Trash2, Package, FileText, Ruler, BarChart3 } from 'lucide-react'

interface CategoriaInsumo {
  id: string
  nome: string
  descricao?: string
}

interface CategoriaReceita {
  id: string
  nome: string
  descricao?: string
}

interface UnidadeMedida {
  id: string
  nome: string
  simbolo: string
  tipo: string
}

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('categorias-insumos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CategoriaInsumo | CategoriaReceita | UnidadeMedida | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [categoriasInsumos, setCategoriasInsumos] = useState<CategoriaInsumo[]>([])
  const [categoriasReceitas, setCategoriasReceitas] = useState<CategoriaReceita[]>([])
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadeMedida[]>([])

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    simbolo: '',
    tipo: 'peso'
  })

  const tabs = [
    { id: 'categorias-insumos', label: 'Categorias de Insumos', icon: Package },
    { id: 'categorias-receitas', label: 'Categorias de Receitas', icon: FileText },
    { id: 'unidades-medida', label: 'Unidades de Medida', icon: Ruler },
  ]

  useEffect(() => {
    if (activeTab === 'categorias-insumos') {
      fetchCategoriasInsumos()
    } else if (activeTab === 'categorias-receitas') {
      fetchCategoriasReceitas()
    } else if (activeTab === 'unidades-medida') {
      fetchUnidadesMedida()
    }
  }, [activeTab])

  const fetchCategoriasInsumos = async () => {
    try {
      const response = await fetch('/api/categorias-insumos', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setCategoriasInsumos(data)
      }
    } catch (error) {
      console.error('Error fetching categorias insumos:', error)
    }
  }

  const fetchCategoriasReceitas = async () => {
    try {
      const response = await fetch('/api/categorias-receitas', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setCategoriasReceitas(data)
      }
    } catch (error) {
      console.error('Error fetching categorias receitas:', error)
    }
  }

  const fetchUnidadesMedida = async () => {
    try {
      const response = await fetch('/api/unidades-medida', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setUnidadesMedida(data)
      }
    } catch (error) {
      console.error('Error fetching unidades medida:', error)
    }
  }

  const handleOpenModal = (item?: CategoriaInsumo | CategoriaReceita | UnidadeMedida) => {
    setEditingItem(item || null)
    if (item) {
      setFormData({
        nome: item.nome || '',
        descricao: 'descricao' in item ? item.descricao || '' : '',
        simbolo: 'simbolo' in item ? item.simbolo || '' : '',
        tipo: 'tipo' in item ? item.tipo || 'peso' : 'peso'
      })
    } else {
      setFormData({
        nome: '',
        descricao: '',
        simbolo: '',
        tipo: 'peso'
      })
    }
    setIsModalOpen(true)
    setError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let url = ''
      let method = 'POST'
      let body: Record<string, string> = {}

      if (activeTab === 'categorias-insumos') {
        url = editingItem ? `/api/categorias-insumos/${editingItem.id}` : '/api/categorias-insumos'
        method = editingItem ? 'PUT' : 'POST'
        body = { nome: formData.nome, descricao: formData.descricao }
      } else if (activeTab === 'categorias-receitas') {
        url = editingItem ? `/api/categorias-receitas/${editingItem.id}` : '/api/categorias-receitas'
        method = editingItem ? 'PUT' : 'POST'
        body = { nome: formData.nome, descricao: formData.descricao }
      } else if (activeTab === 'unidades-medida') {
        url = editingItem ? `/api/unidades-medida/${editingItem.id}` : '/api/unidades-medida'
        method = editingItem ? 'PUT' : 'POST'
        body = { nome: formData.nome, simbolo: formData.simbolo, tipo: formData.tipo }
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      if (response.ok) {
        handleCloseModal()
        if (activeTab === 'categorias-insumos') {
          fetchCategoriasInsumos()
        } else if (activeTab === 'categorias-receitas') {
          fetchCategoriasReceitas()
        } else if (activeTab === 'unidades-medida') {
          fetchUnidadesMedida()
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar')
      }
    } catch {
      setError('Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return

    try {
      let url = ''
      if (activeTab === 'categorias-insumos') {
        url = `/api/categorias-insumos/${id}`
      } else if (activeTab === 'categorias-receitas') {
        url = `/api/categorias-receitas/${id}`
      } else if (activeTab === 'unidades-medida') {
        url = `/api/unidades-medida/${id}`
      }

      const response = await fetch(url, { 
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        if (activeTab === 'categorias-insumos') {
          fetchCategoriasInsumos()
        } else if (activeTab === 'categorias-receitas') {
          fetchCategoriasReceitas()
        } else if (activeTab === 'unidades-medida') {
          fetchUnidadesMedida()
        }
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  // Calcular estatísticas
  const stats = {
    categoriasInsumos: categoriasInsumos.length,
    categoriasReceitas: categoriasReceitas.length,
    unidadesMedida: unidadesMedida.length,
    totalConfiguracoes: categoriasInsumos.length + categoriasReceitas.length + unidadesMedida.length
  }

  const renderTable = (data: (CategoriaInsumo | CategoriaReceita | UnidadeMedida)[], type: string) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <Settings className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item encontrado</h3>
          <p className="text-gray-600 mb-4">Clique em &quot;Novo&quot; para começar.</p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Criar Primeiro Item
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.nome}</h3>
                
                {type !== 'unidades-medida' && 'descricao' in item && (
                  <p className="text-gray-600 text-sm mb-3">{item.descricao || 'Sem descrição'}</p>
                )}
                
                {type === 'unidades-medida' && 'simbolo' in item && 'tipo' in item && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                      Símbolo: {item.simbolo}
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                      Tipo: {item.tipo}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="text-[#5AC8FA] hover:text-[#1B2E4B] transition-colors p-2 rounded-lg hover:bg-gray-100"
                  title="Editar item"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                  title="Excluir item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading && (categoriasInsumos.length === 0 && categoriasReceitas.length === 0 && unidadesMedida.length === 0)) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5AC8FA]"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent">
                Configurações
              </h1>
              <p className="text-gray-600 mt-1">Gerencie categorias e unidades de medida do sistema</p>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Categorias de Insumos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.categoriasInsumos}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Package className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Categorias de Receitas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.categoriasReceitas}</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Unidades de Medida</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unidadesMedida}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl">
                <Ruler className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total de Configurações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConfiguracoes}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <BarChart3 className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs e Conteúdo */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center ${
                      activeTab === tab.id
                        ? 'border-[#5AC8FA] text-[#5AC8FA]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="p-6">
            {activeTab === 'categorias-insumos' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Categorias de Insumos</h3>
                  <button 
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Nova Categoria
                  </button>
                </div>
                {renderTable(categoriasInsumos, 'categorias-insumos')}
              </div>
            )}

            {activeTab === 'categorias-receitas' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Categorias de Receitas</h3>
                  <button 
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Nova Categoria
                  </button>
                </div>
                {renderTable(categoriasReceitas, 'categorias-receitas')}
              </div>
            )}

            {activeTab === 'unidades-medida' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Unidades de Medida</h3>
                  <button 
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Nova Unidade
                  </button>
                </div>
                {renderTable(unidadesMedida, 'unidades-medida')}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingItem ? 'Editar Item' : 'Novo Item'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
                    required
                  />
                </div>

                {activeTab !== 'unidades-medida' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
                      rows={3}
                    />
                  </div>
                )}

                {activeTab === 'unidades-medida' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Símbolo
                      </label>
                      <input
                        type="text"
                        value={formData.simbolo}
                        onChange={(e) => setFormData({ ...formData, simbolo: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                      </label>
                      <select
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
                        required
                      >
                        <option value="peso">Peso</option>
                        <option value="volume">Volume</option>
                        <option value="unidade">Unidade</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
