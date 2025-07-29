'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import { Truck, Plus, Search, Edit, Trash2, Package, Users, MapPin, TrendingUp, Download, Crown } from 'lucide-react'

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

  // Estados para filtros
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortOrder, setSortOrder] = useState('recent')

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

  // Funções auxiliares para o design
  const getFornecedorIcon = (nome: string) => {
    const nomeLower = nome.toLowerCase()
    if (nomeLower.includes('distribuid') || nomeLower.includes('atacad')) return '🏪'
    if (nomeLower.includes('fazenda') || nomeLower.includes('rural')) return '🚜'
    if (nomeLower.includes('frigorif') || nomeLower.includes('carne')) return '🥩'
    if (nomeLower.includes('laticin') || nomeLower.includes('leite')) return '🥛'
    if (nomeLower.includes('hortifrut') || nomeLower.includes('verdur')) return '🥬'
    if (nomeLower.includes('padari') || nomeLower.includes('panific')) return '🍞'
    if (nomeLower.includes('pescad') || nomeLower.includes('peixe')) return '🐟'
    if (nomeLower.includes('tempero') || nomeLower.includes('condiment')) return '🧂'
    if (nomeLower.includes('bebida') || nomeLower.includes('refriger')) return '🥤'
    if (nomeLower.includes('embalag') || nomeLower.includes('descart')) return '📦'
    return '🏢'
  }

  const getFornecedorGradient = (nome: string) => {
    const nomeLower = nome.toLowerCase()
    if (nomeLower.includes('distribuid') || nomeLower.includes('atacad')) return 'from-blue-400 to-blue-600'
    if (nomeLower.includes('fazenda') || nomeLower.includes('rural')) return 'from-green-400 to-green-600'
    if (nomeLower.includes('frigorif') || nomeLower.includes('carne')) return 'from-red-400 to-red-600'
    if (nomeLower.includes('laticin') || nomeLower.includes('leite')) return 'from-yellow-400 to-yellow-600'
    if (nomeLower.includes('hortifrut') || nomeLower.includes('verdur')) return 'from-emerald-400 to-emerald-600'
    if (nomeLower.includes('padari') || nomeLower.includes('panific')) return 'from-amber-400 to-amber-600'
    if (nomeLower.includes('pescad') || nomeLower.includes('peixe')) return 'from-cyan-400 to-cyan-600'
    if (nomeLower.includes('tempero') || nomeLower.includes('condiment')) return 'from-orange-400 to-orange-600'
    if (nomeLower.includes('bebida') || nomeLower.includes('refriger')) return 'from-indigo-400 to-indigo-600'
    if (nomeLower.includes('embalag') || nomeLower.includes('descart')) return 'from-gray-400 to-gray-600'
    return 'from-purple-400 to-purple-600'
  }

  // Filtros e ordenação
  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const matchesSearch = fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.razaoSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === '' || 
      (selectedStatus === 'ativo' && fornecedor.ativo) ||
      (selectedStatus === 'inativo' && !fornecedor.ativo)
    
    return matchesSearch && matchesStatus
  })

  const sortedFornecedores = [...filteredFornecedores].sort((a, b) => {
    switch (sortOrder) {
      case 'name':
        return a.nome.localeCompare(b.nome)
      case 'insumos':
        return b._count.insumos - a._count.insumos
      case 'cidade':
        return (a.cidade || '').localeCompare(b.cidade || '')
      default:
        return 0
    }
  })

  // Estatísticas
  const getStats = () => {
    const totalFornecedores = fornecedores.length
    const fornecedoresAtivos = fornecedores.filter(f => f.ativo).length
    const totalInsumos = fornecedores.reduce((sum, f) => sum + f._count.insumos, 0)
    const totalPrecos = fornecedores.reduce((sum, f) => sum + f._count.precos, 0)

    return { totalFornecedores, fornecedoresAtivos, totalInsumos, totalPrecos }
  }

  const stats = getStats()

  if (loading && fornecedores.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2E4B]"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent">
                Fornecedores
              </h1>
              <p className="text-gray-600 text-lg">Gestão de fornecedores e parcerias</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-xl hover:bg-white transition-all duration-200 shadow-lg border border-white/50 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Fornecedor
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Buscar Fornecedor</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Nome, razão social ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Ordenar</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <option value="recent">Mais recentes</option>
                <option value="name">Nome A-Z</option>
                <option value="insumos">Mais insumos</option>
                <option value="cidade">Cidade A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Fornecedores</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFornecedores}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% este mês
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Fornecedores Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.fornecedoresAtivos}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  {((stats.fornecedoresAtivos / stats.totalFornecedores) * 100).toFixed(0)}% ativos
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Insumos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInsumos}</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <Package className="h-3 w-3 mr-1" />
                  Produtos fornecidos
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Preços Cadastrados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPrecos}</p>
                <p className="text-xs text-purple-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Cotações ativas
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <MapPin className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Fornecedores Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedFornecedores.map((fornecedor) => (
            <div key={fornecedor.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${getFornecedorGradient(fornecedor.nome)}`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-14 h-14 bg-gradient-to-r ${getFornecedorGradient(fornecedor.nome)} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <span className="text-white text-xl">{getFornecedorIcon(fornecedor.nome)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{fornecedor.nome}</h3>
                      {fornecedor.razaoSocial && (
                        <p className="text-sm text-gray-500">{fornecedor.razaoSocial}</p>
                      )}
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          fornecedor.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal(fornecedor)}
                      className="p-2 text-gray-400 hover:text-[#1B2E4B] hover:bg-white/50 rounded-lg transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fornecedor.id)}
                      className="p-2 text-gray-400 hover:text-[#E74C3C] hover:bg-white/50 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Informações de Contato */}
                <div className="space-y-3 mb-6">
                  {fornecedor.telefone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600">📞</span>
                      </div>
                      <span>{fornecedor.telefone}</span>
                    </div>
                  )}
                  {fornecedor.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600">📧</span>
                      </div>
                      <span>{fornecedor.email}</span>
                    </div>
                  )}
                  {(fornecedor.cidade || fornecedor.estado) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <MapPin className="h-4 w-4 text-purple-600" />
                      </div>
                      <span>{fornecedor.cidade}{fornecedor.cidade && fornecedor.estado ? ', ' : ''}{fornecedor.estado}</span>
                    </div>
                  )}
                </div>
                
                {/* Estatísticas do Fornecedor */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Insumos</p>
                    <p className="font-semibold text-gray-900 flex items-center">
                      <Package className="h-4 w-4 mr-1 text-blue-600" />
                      {fornecedor._count.insumos}
                    </p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Preços</p>
                    <p className="font-semibold text-gray-900 flex items-center">
                      <span className="text-green-600 mr-1">💰</span>
                      {fornecedor._count.precos}
                    </p>
                  </div>
                </div>

                {/* Informações Adicionais */}
                {(fornecedor.cnpj || fornecedor.contato) && (
                  <div className="bg-white/50 rounded-xl p-4 space-y-2">
                    {fornecedor.cnpj && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">CNPJ:</span>
                        <span className="font-medium text-gray-900">{fornecedor.cnpj}</span>
                      </div>
                    )}
                    {fornecedor.contato && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Contato:</span>
                        <span className="font-medium text-gray-900">{fornecedor.contato}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {sortedFornecedores.length === 0 && (
          <div className="text-center py-12">
            <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-gray-500 mb-6">Cadastre seu primeiro fornecedor para começar</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Cadastrar Primeiro Fornecedor
            </button>
          </div>
        )}

        {/* Modal de Criação/Edição */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                placeholder="Informações adicionais sobre o fornecedor..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="rounded border-gray-300 text-[#1B2E4B] shadow-sm focus:border-[#5AC8FA] focus:ring focus:ring-[#5AC8FA] focus:ring-opacity-50"
              />
              <label htmlFor="ativo" className="ml-3 text-sm text-gray-700">
                Fornecedor ativo
              </label>
            </div>

            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white rounded-xl hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span className="font-medium">{editingFornecedor ? 'Atualizar' : 'Criar'} Fornecedor</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
