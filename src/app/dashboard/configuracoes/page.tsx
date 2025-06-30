'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
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
  const [editingItem, setEditingItem] = useState<any>(null)
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
    { id: 'usuarios', label: 'Usuários' },
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
      const response = await fetch('/api/categorias-insumos')
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
      const response = await fetch('/api/categorias-receitas')
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
      const response = await fetch('/api/unidades-medida')
      if (response.ok) {
        const data = await response.json()
        setUnidadesMedida(data)
      }
    } catch (error) {
      console.error('Error fetching unidades medida:', error)
    }
  }

  const handleOpenModal = (item?: any) => {
    setEditingItem(item)
    if (item) {
      setFormData({
        nome: item.nome || '',
        descricao: item.descricao || '',
        simbolo: item.simbolo || '',
        tipo: item.tipo || 'peso'
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
      let body: any = {}

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
    } catch (error) {
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

      const response = await fetch(url, { method: 'DELETE' })

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

  const renderTable = (data: any[], type: string) => {
    if (data.length === 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-500 text-center">Nenhum item cadastrado</p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              {type !== 'unidades-medida' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
              )}
              {type === 'unidades-medida' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Símbolo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                </>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.nome}
                </td>
                {type !== 'unidades-medida' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.descricao || '-'}
                  </td>
                )}
                {type === 'unidades-medida' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.simbolo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.tipo}
                    </td>
                  </>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Settings className="h-6 w-6 text-gray-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Unidade
                  </button>
                </div>
                {renderTable(unidadesMedida, 'unidades-medida')}
              </div>
            )}

            {activeTab === 'usuarios' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Controle de Usuários</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Usuário
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-center">Funcionalidade em desenvolvimento</p>
                </div>
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

          {activeTab !== 'unidades-medida' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          )}

          {activeTab === 'unidades-medida' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Símbolo *
                </label>
                <input
                  type="text"
                  value={formData.simbolo}
                  onChange={(e) => setFormData({ ...formData, simbolo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

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
                  <option value="peso">Peso</option>
                  <option value="volume">Volume</option>
                  <option value="unidade">Unidade</option>
                </select>
              </div>
            </>
          )}

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
