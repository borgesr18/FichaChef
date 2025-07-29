'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import { Factory, Plus, Search, Edit, Trash2, FileText, Package, TrendingUp, Calendar, Clock, Download } from 'lucide-react'
import { convertFormDataToNumbers, convertFormDataToDates } from '@/lib/form-utils'

interface ProducaoFicha {
  id: string
  fichaTecnicaId: string
  dataProducao: string
  dataValidade: string
  quantidadeProduzida: number
  lote: string
  fichaTecnica: { nome: string }
}

interface ProducaoProduto {
  id: string
  produtoId: string
  dataProducao: string
  dataValidade: string
  quantidadeProduzida: number
  lote: string
  produto: { nome: string }
}

interface FichaTecnica {
  id: string
  nome: string
}

interface Produto {
  id: string
  nome: string
}

export default function ProducaoPage() {
  const [activeSection, setActiveSection] = useState<'fichas' | 'produtos'>('fichas')
  const [searchTerm, setSearchTerm] = useState('')
  const [producoesFichas, setProducoesFichas] = useState<ProducaoFicha[]>([])
  const [producoesProdutos, setProducoesProdutos] = useState<ProducaoProduto[]>([])
  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProducao, setEditingProducao] = useState<ProducaoFicha | ProducaoProduto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<{
    itemId: string
    dataProducao: string
    dataValidade: string
    quantidadeProduzida: string
    lote: string
  }>({
    itemId: '',
    dataProducao: '',
    dataValidade: '',
    quantidadeProduzida: '',
    lote: ''
  })

  useEffect(() => {
    fetchProducoesFichas()
    fetchProducoesProdutos()
    fetchFichasTecnicas()
    fetchProdutos()
  }, [])

  const fetchProducoesFichas = async () => {
    try {
      const response = await fetch('/api/producao')
      if (response.ok) {
        const data = await response.json()
        setProducoesFichas(data)
      }
    } catch (error) {
      console.error('Error fetching producoes fichas:', error)
    }
  }

  const fetchProducoesProdutos = async () => {
    try {
      const response = await fetch('/api/producoes-produto')
      if (response.ok) {
        const data = await response.json()
        setProducoesProdutos(data)
      }
    } catch (error) {
      console.error('Error fetching producoes produtos:', error)
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

  const handleOpenModal = (producao?: ProducaoFicha | ProducaoProduto) => {
    setEditingProducao(producao || null)
    if (producao) {
      setFormData({
        itemId: activeSection === 'fichas' ? (producao as ProducaoFicha).fichaTecnicaId : (producao as ProducaoProduto).produtoId,
        dataProducao: producao.dataProducao?.split('T')[0] || '',
        dataValidade: producao.dataValidade?.split('T')[0] || '',
        quantidadeProduzida: producao.quantidadeProduzida.toString(),
        lote: producao.lote
      })
    } else {
      const today = new Date().toISOString().split('T')[0] || ''
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || ''
      setFormData({
        itemId: '',
        dataProducao: today,
        dataValidade: nextWeek,
        quantidadeProduzida: '',
        lote: `LOTE-${Date.now()}`
      })
    }
    setIsModalOpen(true)
    setError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProducao(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const apiPath = activeSection === 'fichas' ? 'producao' : 'producoes-produto'
      const itemKey = activeSection === 'fichas' ? 'fichaTecnicaId' : 'produtoId'
      
      const url = editingProducao ? `/api/${apiPath}/${editingProducao.id}` : `/api/${apiPath}`
      const method = editingProducao ? 'PUT' : 'POST'

      const convertedData = convertFormDataToNumbers(formData, ['quantidadeProduzida'])
      const finalData = convertFormDataToDates(convertedData, ['dataProducao', 'dataValidade'])
      
      const requestData = {
        ...finalData,
        [itemKey]: finalData.itemId
      }
      delete requestData.itemId

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        handleCloseModal()
        if (activeSection === 'fichas') {
          fetchProducoesFichas()
        } else {
          fetchProducoesProdutos()
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar produção')
      }
    } catch {
      setError('Erro ao salvar produção')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta produção?')) return

    try {
      const apiPath = activeSection === 'fichas' ? 'producao' : 'producoes-produto'
      const response = await fetch(`/api/${apiPath}/${id}`, { method: 'DELETE' })
      if (response.ok) {
        if (activeSection === 'fichas') {
          fetchProducoesFichas()
        } else {
          fetchProducoesProdutos()
        }
      }
    } catch (error) {
      console.error('Error deleting producao:', error)
    }
  }

  const currentProducoes = activeSection === 'fichas' ? producoesFichas : producoesProdutos
  const currentItems = activeSection === 'fichas' ? fichasTecnicas : produtos

  const filteredProducoes = currentProducoes.filter(producao => {
    const itemName = activeSection === 'fichas' 
      ? (producao as ProducaoFicha).fichaTecnica.nome 
      : (producao as ProducaoProduto).produto.nome
    return itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           producao.lote.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Funções auxiliares para o design
  const getProducaoIcon = (lote: string) => {
    if (lote.includes('LOTE')) return '📦'
    if (lote.includes('BATCH')) return '🏭'
    return '🔧'
  }

  const getProducaoGradient = (activeSection: string) => {
    return activeSection === 'fichas' ? 'from-blue-400 to-blue-600' : 'from-green-400 to-green-600'
  }

  // Estatísticas
  const getStats = () => {
    const totalProducoes = currentProducoes.length
    const hoje = new Date().toDateString()
    const producaoHoje = currentProducoes.filter(p => 
      new Date(p.dataProducao).toDateString() === hoje
    ).length
    const proximoVencimento = currentProducoes.filter(p => {
      const vencimento = new Date(p.dataValidade)
      const agora = new Date()
      const diasRestantes = Math.ceil((vencimento.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))
      return diasRestantes <= 7 && diasRestantes > 0
    }).length
    const quantidadeTotal = currentProducoes.reduce((sum, p) => sum + p.quantidadeProduzida, 0)

    return { totalProducoes, producaoHoje, proximoVencimento, quantidadeTotal }
  }

  const stats = getStats()

  if (loading && currentProducoes.length === 0) {
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
                Produção
              </h1>
              <p className="text-gray-600 text-lg">Registre e acompanhe a produção</p>
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
                Nova Produção
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/20 mb-8 inline-flex">
          <button
            onClick={() => setActiveSection('fichas')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
              activeSection === 'fichas'
                ? 'bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Fichas Técnicas
          </button>
          <button
            onClick={() => setActiveSection('produtos')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
              activeSection === 'produtos'
                ? 'bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Buscar Produção</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={`Buscar produções de ${activeSection === 'fichas' ? 'fichas técnicas' : 'produtos'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Produções</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducoes}</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15% este mês
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Factory className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Produção Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.producaoHoje}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Lotes ativos
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Próximo Vencimento</p>
                <p className="text-2xl font-bold text-gray-900">{stats.proximoVencimento}</p>
                <p className="text-xs text-orange-600 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Próximos 7 dias
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Quantidade Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.quantidadeTotal.toFixed(0)}</p>
                <p className="text-xs text-purple-600 flex items-center">
                  <Package className="h-3 w-3 mr-1" />
                  Unidades produzidas
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Produções Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducoes.map((producao) => {
            const itemName = activeSection === 'fichas' 
              ? (producao as ProducaoFicha).fichaTecnica.nome 
              : (producao as ProducaoProduto).produto.nome

            const diasParaVencimento = Math.ceil(
              (new Date(producao.dataValidade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )

            return (
              <div
                key={producao.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Barra colorida por seção */}
                <div className={`h-2 bg-gradient-to-r ${getProducaoGradient(activeSection)}`}></div>
                
                <div className="p-6">
                  {/* Header do card */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getProducaoIcon(producao.lote)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">{itemName}</h3>
                        <p className="text-sm text-gray-500">Lote: {producao.lote}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      diasParaVencimento <= 3 
                        ? 'bg-red-100 text-red-800' 
                        : diasParaVencimento <= 7
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {diasParaVencimento <= 0 ? 'Vencido' : `${diasParaVencimento}d`}
                    </span>
                  </div>

                  {/* Informações principais */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quantidade:</span>
                      <span className="font-semibold text-gray-900">{producao.quantidadeProduzida}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Produção:</span>
                      <span className="font-medium text-gray-700">
                        {new Date(producao.dataProducao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Validade:</span>
                      <span className={`font-medium ${
                        diasParaVencimento <= 3 ? 'text-red-600' : 
                        diasParaVencimento <= 7 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {new Date(producao.dataValidade).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleOpenModal(producao)}
                      className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(producao.id)}
                      className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabela Moderna */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Histórico de Produção - {activeSection === 'fichas' ? 'Fichas Técnicas' : 'Produtos'}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lote
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeSection === 'fichas' ? 'Ficha Técnica' : 'Produto'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Produção
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Validade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducoes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm 
                        ? 'Nenhuma produção encontrada.' 
                        : `Nenhuma produção de ${activeSection === 'fichas' ? 'fichas técnicas' : 'produtos'} registrada. Clique em "Nova Produção" para começar.`
                      }
                    </td>
                  </tr>
                ) : (
                  filteredProducoes.map((producao) => {
                    const diasParaVencimento = Math.ceil(
                      (new Date(producao.dataValidade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    )

                    return (
                      <tr key={producao.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {producao.lote}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activeSection === 'fichas' 
                            ? (producao as ProducaoFicha).fichaTecnica.nome 
                            : (producao as ProducaoProduto).produto.nome
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(producao.dataProducao).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`${
                            diasParaVencimento <= 3 ? 'text-red-600' : 
                            diasParaVencimento <= 7 ? 'text-yellow-600' : 'text-gray-500'
                          }`}>
                            {new Date(producao.dataValidade).toLocaleDateString('pt-BR')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {producao.quantidadeProduzida}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenModal(producao)}
                              className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(producao.id)}
                              className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProducao ? 'Editar Produção' : 'Nova Produção'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <FloatingLabelSelect
            label={`${activeSection === 'fichas' ? 'Ficha Técnica' : 'Produto'}`}
            value={formData.itemId}
            onChange={(value) => setFormData({ ...formData, itemId: value })}
            options={currentItems.map(item => ({ value: item.id, label: item.nome }))}
            required
            error={error && !formData.itemId ? `${activeSection === 'fichas' ? 'Ficha Técnica' : 'Produto'} é obrigatório` : ''}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Data de Produção"
              type="date"
              value={formData.dataProducao}
              onChange={(value) => setFormData({ ...formData, dataProducao: value })}
              required
              error={error && !formData.dataProducao ? 'Data de produção é obrigatória' : ''}
            />

            <FloatingLabelInput
              label="Data de Validade"
              type="date"
              value={formData.dataValidade}
              onChange={(value) => setFormData({ ...formData, dataValidade: value })}
              required
              error={error && !formData.dataValidade ? 'Data de validade é obrigatória' : ''}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Quantidade Produzida"
              type="number"
              step="0.01"
              value={formData.quantidadeProduzida}
              onChange={(value) => setFormData({ ...formData, quantidadeProduzida: value })}
              required
              error={error && !formData.quantidadeProduzida ? 'Quantidade é obrigatória' : ''}
            />

            <FloatingLabelInput
              label="Lote"
              type="text"
              value={formData.lote}
              onChange={(value) => setFormData({ ...formData, lote: value })}
              required
              error={error && !formData.lote ? 'Lote é obrigatório' : ''}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium hover:scale-[1.02] transform"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              {editingProducao ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
