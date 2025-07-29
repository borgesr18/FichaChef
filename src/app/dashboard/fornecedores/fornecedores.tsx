'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import ModernTable from '@/components/ui/ModernTable'
import { Truck, Plus, Search, Edit, Trash2, Package, Users, MapPin, Phone } from 'lucide-react'

interface Fornecedor {
  id: string
  nome: string
  contato: string
  telefone: string
  email: string
  endereco: string
  ativo: boolean
  _count: {
    insumos: number
    precos: number
  }
}

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    contato: '',
    telefone: '',
    email: '',
    endereco: '',
    ativo: true
  })

  useEffect(() => {
    fetchFornecedores()
  }, [])

  const fetchFornecedores = async () => {
    try {
      const response = await fetch('/api/fornecedores')
      if (response.ok) {
        const data = await response.json()
        setFornecedores(data)
      }
    } catch (error) {
      console.error('Error fetching fornecedores:', error)
    }
  }

  const handleOpenModal = (fornecedor?: Fornecedor) => {
    setEditingFornecedor(fornecedor || null)
    if (fornecedor) {
      setFormData({
        nome: fornecedor.nome,
        contato: fornecedor.contato,
        telefone: fornecedor.telefone,
        email: fornecedor.email,
        endereco: fornecedor.endereco,
        ativo: fornecedor.ativo
      })
    } else {
      setFormData({
        nome: '',
        contato: '',
        telefone: '',
        email: '',
        endereco: '',
        ativo: true
      })
    }
    setIsModalOpen(true)
    setError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingFornecedor(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingFornecedor ? `/api/fornecedores/${editingFornecedor.id}` : '/api/fornecedores'
      const method = editingFornecedor ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        handleCloseModal()
        fetchFornecedores()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar fornecedor')
      }
    } catch {
      setError('Erro ao salvar fornecedor')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return

    try {
      const response = await fetch(`/api/fornecedores/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchFornecedores()
      }
    } catch (error) {
      console.error('Error deleting fornecedor:', error)
    }
  }

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.contato.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header com gradiente azul - estilo UXPilot */}
        <div className="uxpilot-header-gradient">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Fornecedores</h1>
                <p className="text-blue-100 mt-1">Gestão de fornecedores e parcerias</p>
              </div>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center transition-all duration-300 border border-white/20"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-medium">Novo Fornecedor</span>
            </button>
          </div>
        </div>

        {/* Cards de métricas - estilo UXPilot */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl mr-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Fornecedores</p>
                  <p className="text-2xl font-bold text-slate-800">{fornecedores.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl mr-4">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Fornecedores Ativos</p>
                  <p className="text-2xl font-bold text-slate-800">{fornecedores.filter(f => f.ativo).length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-xl mr-4">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Insumos</p>
                  <p className="text-2xl font-bold text-slate-800">{fornecedores.reduce((sum, f) => sum + f._count.insumos, 0)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl mr-4">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Preços Cadastrados</p>
                  <p className="text-2xl font-bold text-slate-800">{fornecedores.reduce((sum, f) => sum + f._count.precos, 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de fornecedores */}
        <div className="uxpilot-card">
          <div className="p-6 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="uxpilot-input pl-10"
              />
            </div>
          </div>

          <ModernTable
            columns={[
              { key: 'nome', label: 'Nome', sortable: true },
              { key: 'contato', label: 'Contato', sortable: true },
              { key: 'telefone', label: 'Telefone', sortable: true,
                render: (value) => value || '-' },
              { key: 'email', label: 'Email', sortable: true,
                render: (value) => value || '-' },
              { key: 'ativo', label: 'Status', sortable: true,
                render: (value) => (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {value ? 'Ativo' : 'Inativo'}
                  </span>
                )},
              { key: '_count.insumos', label: 'Insumos', sortable: true, align: 'center',
                render: (_, row) => (row as unknown as Fornecedor)._count.insumos },
              { key: 'actions', label: 'Ações', align: 'center',
                render: (_, row) => (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(row as unknown as Fornecedor)}
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
            data={filteredFornecedores as unknown as Record<string, unknown>[]}
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
        title={editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
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
              label="Contato"
              value={formData.contato}
              onChange={(value) => setFormData({ ...formData, contato: value })}
              required
              error={error && !formData.contato ? 'Contato é obrigatório' : ''}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Telefone"
              value={formData.telefone}
              onChange={(value) => setFormData({ ...formData, telefone: value })}
            />

            <FloatingLabelInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
            />
          </div>

          <FloatingLabelInput
            label="Endereço"
            value={formData.endereco}
            onChange={(value) => setFormData({ ...formData, endereco: value })}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="ativo"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
              Fornecedor ativo
            </label>
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

