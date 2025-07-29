'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import ModernTable from '@/components/ui/ModernTable'
import { Truck, Plus, Search, Edit, Trash2, Users, Package, MapPin, Star } from 'lucide-react'

interface Fornecedor {
  id: string
  nome: string
  contato: string
  telefone: string
  email: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  cnpj: string
  ativo: boolean
  avaliacao: number
  _count: {
    insumos: number
  }
  createdAt: string
}

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const [formData, setFormData] = useState({
    nome: '',
    contato: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    cnpj: '',
    ativo: true,
    avaliacao: 5
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
    if (fornecedor) {
      setEditingFornecedor(fornecedor)
      setFormData({
        nome: fornecedor.nome,
        contato: fornecedor.contato,
        telefone: fornecedor.telefone,
        email: fornecedor.email,
        endereco: fornecedor.endereco,
        cidade: fornecedor.cidade,
        estado: fornecedor.estado,
        cep: fornecedor.cep,
        cnpj: fornecedor.cnpj,
        ativo: fornecedor.ativo,
        avaliacao: fornecedor.avaliacao
      })
    } else {
      setEditingFornecedor(null)
      setFormData({
        nome: '',
        contato: '',
        telefone: '',
        email: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        cnpj: '',
        ativo: true,
        avaliacao: 5
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

  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const matchesSearch = fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.contato.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.cidade.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filtroStatus === 'todos' || 
                         (filtroStatus === 'ativo' && fornecedor.ativo) ||
                         (filtroStatus === 'inativo' && !fornecedor.ativo)
    
    return matchesSearch && matchesStatus
  })

  const calcularEstatisticas = () => {
    const total = fornecedores.length
    const ativos = fornecedores.filter(f => f.ativo).length
    const inativos = fornecedores.filter(f => !f.ativo).length
    const totalInsumos = fornecedores.reduce((acc, f) => acc + f._count.insumos, 0)
    const avaliacaoMedia = fornecedores.reduce((acc, f) => acc + f.avaliacao, 0) / total || 0

    return { total, ativos, inativos, totalInsumos, avaliacaoMedia }
  }

  const stats = calcularEstatisticas()

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
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Fornecedores</h1>
                <p className="text-blue-100 mt-1">Gestão de fornecedores e parcerias comerciais</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center font-medium hover:scale-[1.02] transform backdrop-blur-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Fornecedor
            </button>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Fornecedores</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Fornecedores Ativos</p>
                <p className="text-2xl font-bold text-slate-800">{stats.ativos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl mr-4">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Insumos</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalInsumos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl mr-4">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-slate-800">{stats.avaliacaoMedia.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

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
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </div>

        {/* Tabela de fornecedores */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60">
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800">Lista de Fornecedores</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar fornecedores..."
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
              { key: 'contato', label: 'Contato', sortable: true },
              { key: 'telefone', label: 'Telefone', sortable: true,
                render: (value: unknown): React.ReactNode => <span>{(value as string) || '-'}</span> },
              { key: 'email', label: 'Email', sortable: true,
                render: (value: unknown): React.ReactNode => <span>{(value as string) || '-'}</span> },
              { key: 'cidade', label: 'Cidade', sortable: true,
                render: (value: unknown, row: Record<string, unknown>): React.ReactNode => {
                  const fornecedor = row as unknown as Fornecedor
                  return (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-slate-400 mr-1" />
                      <span className="text-sm">{value as string}, {fornecedor.estado}</span>
                    </div>
                  )
                }},
              { key: 'avaliacao', label: 'Avaliação', sortable: true,
                render: (value: unknown): React.ReactNode => (
                  <div className="flex items-center space-x-1">
                    {renderStars(value as number)}
                  </div>
                )},
              { key: '_count.insumos', label: 'Insumos', sortable: true, align: 'center',
                render: (_, row): React.ReactNode => {
                  const fornecedor = row as unknown as Fornecedor
                  return (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {fornecedor._count.insumos}
                    </span>
                  )
                }},
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
              label="Nome da Empresa"
              value={formData.nome}
              onChange={(value) => setFormData({ ...formData, nome: value })}
              required
            />

            <FloatingLabelInput
              label="Pessoa de Contato"
              value={formData.contato}
              onChange={(value) => setFormData({ ...formData, contato: value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Telefone"
              value={formData.telefone}
              onChange={(value) => setFormData({ ...formData, telefone: value })}
              placeholder="(11) 99999-9999"
            />

            <FloatingLabelInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              placeholder="contato@empresa.com"
            />
          </div>

          <FloatingLabelInput
            label="CNPJ"
            value={formData.cnpj}
            onChange={(value) => setFormData({ ...formData, cnpj: value })}
            placeholder="00.000.000/0000-00"
          />

          <FloatingLabelInput
            label="Endereço"
            value={formData.endereco}
            onChange={(value) => setFormData({ ...formData, endereco: value })}
            placeholder="Rua, número, bairro"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FloatingLabelInput
              label="Cidade"
              value={formData.cidade}
              onChange={(value) => setFormData({ ...formData, cidade: value })}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione</option>
                <option value="SP">São Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="PR">Paraná</option>
                <option value="SC">Santa Catarina</option>
                <option value="BA">Bahia</option>
                <option value="GO">Goiás</option>
                <option value="PE">Pernambuco</option>
                <option value="CE">Ceará</option>
              </select>
            </div>

            <FloatingLabelInput
              label="CEP"
              value={formData.cep}
              onChange={(value) => setFormData({ ...formData, cep: value })}
              placeholder="00000-000"
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
                Fornecedor ativo
              </label>
            </div>
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

