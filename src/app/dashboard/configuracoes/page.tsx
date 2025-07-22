'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import ModernTable from '@/components/ui/ModernTable'
import { Settings, Plus, Edit, Trash2 } from 'lucide-react'

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
    { id: 'categorias-insumos', label: 'Categorias de Insumos' },
    { id: 'categorias-receitas', label: 'Categorias de Receitas' },
    { id: 'unidades-medida', label: 'Unidades de Medida' },
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

  const renderTable = (data: (CategoriaInsumo | CategoriaReceita | UnidadeMedida)[], type: string) => {
    const columns = [
      { key: 'nome', label: 'Nome', sortable: true },
      ...(type !== 'unidades-medida' ? [{ key: 'descricao', label: 'Descrição', sortable: true,
        render: (value: unknown) => (value as string) || '-' }] : []),
      ...(type === 'unidades-medida' ? [
        { key: 'simbolo', label: 'Símbolo', sortable: true },
        { key: 'tipo', label: 'Tipo', sortable: true }
      ] : []),
      { key: 'actions', label: 'Ações', align: 'center' as const,
        render: (_: unknown, row: Record<string, unknown>) => (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => handleOpenModal(data.find(item => item.id === row.id))}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(row.id as string)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
    ]

    const tableData = data.map(item => ({
      id: item.id,
      nome: item.nome,
      ...(type !== 'unidades-medida' && 'descricao' in item ? { descricao: item.descricao } : {}),
      ...(type === 'unidades-medida' && 'simbolo' in item ? { simbolo: item.simbolo } : {}),
      ...(type === 'unidades-medida' && 'tipo' in item ? { tipo: item.tipo } : {})
    }))

    return (
      <ModernTable
        columns={columns}
        data={tableData}
        searchable={true}
        pagination={true}
        pageSize={10}
        loading={loading}
      />
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mr-3 transform transition-transform duration-200 hover:scale-110">
            <Settings className="h-6 w-6 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Configurações</h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300">
          <div className="border-b border-slate-200/60">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'categorias-insumos' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Categorias de Insumos</h3>
                  <button 
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
                  >
                    <Plus className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                    Nova Categoria
                  </button>
                </div>
                {renderTable(categoriasInsumos, 'categorias-insumos')}
              </div>
            )}

            {activeTab === 'categorias-receitas' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Categorias de Receitas</h3>
                  <button 
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
                  >
                    <Plus className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                    Nova Categoria
                  </button>
                </div>
                {renderTable(categoriasReceitas, 'categorias-receitas')}
              </div>
            )}

            {activeTab === 'unidades-medida' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Unidades de Medida</h3>
                  <button 
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
                  >
                    <Plus className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                    Nova Unidade
                  </button>
                </div>
                {renderTable(unidadesMedida, 'unidades-medida')}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar Item' : 'Novo Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <FloatingLabelInput
            label="Nome"
            value={formData.nome}
            onChange={(value) => setFormData({ ...formData, nome: value })}
            required
          />

          {activeTab !== 'unidades-medida' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:bg-white/80"
                rows={3}
              />
            </div>
          )}

          {activeTab === 'unidades-medida' && (
            <>
              <FloatingLabelInput
                label="Símbolo"
                value={formData.simbolo}
                onChange={(value) => setFormData({ ...formData, simbolo: value })}
                required
              />

              <FloatingLabelSelect
                label="Tipo"
                value={formData.tipo}
                onChange={(value) => setFormData({ ...formData, tipo: value })}
                options={[
                  { value: 'peso', label: 'Peso' },
                  { value: 'volume', label: 'Volume' },
                  { value: 'unidade', label: 'Unidade' }
                ]}
                required
              />
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-3 text-slate-700 bg-slate-200 rounded-xl hover:bg-slate-300 transition-all duration-200 hover:scale-105"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
