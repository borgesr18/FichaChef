'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import ModernTable from '@/components/ui/ModernTable'
import { Truck, Plus, Search, Edit, Trash2, Package } from 'lucide-react'

interface Fornecedor {
  id: string
  nome: string
  razaoSocial?: string
  cnpj?: string
  telefone?: string
  email?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  contato?: string
  observacoes?: string
  ativo: boolean
  _count: {
    insumos: number
    precos: number
  }
}

export default function FornecedoresPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    razaoSocial: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    contato: '',
    observacoes: '',
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
        nome: fornecedor.nome || '',
        razaoSocial: fornecedor.razaoSocial || '',
        cnpj: fornecedor.cnpj || '',
        telefone: fornecedor.telefone || '',
        email: fornecedor.email || '',
        endereco: fornecedor.endereco || '',
        cidade: fornecedor.cidade || '',
        estado: fornecedor.estado || '',
        cep: fornecedor.cep || '',
        contato: fornecedor.contato || '',
        observacoes: fornecedor.observacoes || '',
        ativo: fornecedor.ativo ?? true
      })
    } else {
      setFormData({
        nome: '',
        razaoSocial: '',
        cnpj: '',
        telefone: '',
        email: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        contato: '',
        observacoes: '',
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
    fornecedor.razaoSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <p className="text-blue-100 mt-1">Cadastre e gerencie fornecedores</p>
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

        {/* Card da tabela - estilo UXPilot */}
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
              { key: 'nome', label: 'Nome', sortable: true,
                render: (_, row) => {
                  const fornecedor = row as Record<string, unknown>
                  return (
                    <div>
                      <div className="text-sm font-medium text-gray-900">{String(fornecedor.nome || '')}</div>
                      {fornecedor.razaoSocial ? (
                        <div className="text-sm text-gray-500">{String(fornecedor.razaoSocial)}</div>
                      ) : null}
                    </div>
                  )
                }},
              { key: 'contato', label: 'Contato', sortable: false,
                render: (_, row) => {
                  const fornecedor = row as Record<string, unknown>
                  return (
                    <div className="text-sm text-gray-500">
                      {fornecedor.telefone ? <div>{String(fornecedor.telefone)}</div> : null}
                      {fornecedor.email ? <div>{String(fornecedor.email)}</div> : null}
                    </div>
                  )
                }},
              { key: 'localizacao', label: 'Localização', sortable: true,
                render: (_, row) => {
                  const fornecedor = row as Record<string, unknown>
                  return fornecedor.cidade && fornecedor.estado ? `${String(fornecedor.cidade)}, ${String(fornecedor.estado)}` : '-'
                }},
              { key: 'insumos', label: 'Insumos', sortable: true, align: 'center',
                render: (_, row) => {
                  const fornecedor = row as Record<string, unknown>
                  const count = fornecedor._count as Record<string, number> | undefined
                  return (
                    <div className="flex items-center justify-center">
                      <Package className="h-4 w-4 mr-1" />
                      {count?.insumos || 0}
                    </div>
                  )
                }},
              { key: 'ativo', label: 'Status', sortable: true,
                render: (value) => (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {value ? 'Ativo' : 'Inativo'}
                  </span>
                )},
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
              label="Razão Social"
              value={formData.razaoSocial}
              onChange={(value) => setFormData({ ...formData, razaoSocial: value })}
            />

            <FloatingLabelInput
              label="CNPJ"
              value={formData.cnpj}
              onChange={(value) => setFormData({ ...formData, cnpj: value })}
            />

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

            <FloatingLabelInput
              label="Contato"
              value={formData.contato}
              onChange={(value) => setFormData({ ...formData, contato: value })}
            />
          </div>

          <FloatingLabelInput
            label="Endereço"
            value={formData.endereco}
            onChange={(value) => setFormData({ ...formData, endereco: value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Cidade"
              value={formData.cidade}
              onChange={(value) => setFormData({ ...formData, cidade: value })}
            />

            <FloatingLabelInput
              label="Estado"
              value={formData.estado}
              onChange={(value) => setFormData({ ...formData, estado: value })}
            />

            <FloatingLabelInput
              label="CEP"
              value={formData.cep}
              onChange={(value) => setFormData({ ...formData, cep: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:bg-white/80"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="rounded border-orange-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-slate-700">Fornecedor ativo</span>
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
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Salvando...</span>
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
