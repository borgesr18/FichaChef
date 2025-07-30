'use client'

import React, { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Bell, Plus, Search, Settings, AlertTriangle, Package, ShoppingCart } from 'lucide-react'

interface ConfiguracaoAlerta {
  id: string
  tipo: string
  itemTipo: string
  itemId: string
  ativo: boolean
  limiteEstoqueBaixo?: number
  diasAntesVencimento?: number
  margemCustoMaxima?: number
}

interface Item {
  id: string
  nome: string
}

const FloatingLabelInput = ({ label, value, onChange, type = "text", step, required = false, className = "" }: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  step?: string
  required?: boolean
  className?: string
}) => {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  const isDateInput = type === "date"
  
  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className="peer w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
      />
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
        focused || hasValue || isDateInput
          ? 'top-1 text-xs text-[#5AC8FA] font-medium' 
          : 'top-3 text-gray-500'
      }`}>
        {label}
      </label>
    </div>
  )
}

const FloatingLabelSelect = ({ label, value, onChange, options, required = false, className = "" }: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  className?: string
}) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="peer w-full px-4 pt-6 pb-2 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200 appearance-none"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <label className="absolute left-4 top-1 text-xs text-[#5AC8FA] font-medium transition-all duration-200 pointer-events-none">
        {label}
      </label>
    </div>
  )
}

export default function AlertasPage() {
  const [activeTab, setActiveTab] = useState<'estoque_baixo' | 'validade_proxima' | 'custo_alto'>('estoque_baixo')
  const [searchTerm, setSearchTerm] = useState('')
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoAlerta[]>([])
  const [insumos, setInsumos] = useState<Item[]>([])
  const [produtos, setProdutos] = useState<Item[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    itemTipo: 'insumo',
    itemId: '',
    limiteEstoqueBaixo: '',
    diasAntesVencimento: '',
    margemCustoMaxima: '',
    ativo: true
  })

  const fetchConfiguracoes = useCallback(async () => {
    try {
      const response = await fetch(`/api/configuracoes-alerta?tipo=${activeTab}`)
      if (response.ok) {
        const data = await response.json()
        setConfiguracoes(data)
      }
    } catch (error) {
      console.error('Error fetching configuracoes:', error)
    }
  }, [activeTab])

  const fetchInsumos = useCallback(async () => {
    try {
      const response = await fetch('/api/insumos')
      if (response.ok) {
        const data = await response.json()
        setInsumos(data)
      }
    } catch (error) {
      console.error('Error fetching insumos:', error)
    }
  }, [])

  const fetchProdutos = useCallback(async () => {
    try {
      const response = await fetch('/api/produtos')
      if (response.ok) {
        const data = await response.json()
        setProdutos(data)
      }
    } catch (error) {
      console.error('Error fetching produtos:', error)
    }
  }, [])

  useEffect(() => {
    fetchConfiguracoes()
    fetchInsumos()
    fetchProdutos()
  }, [fetchConfiguracoes, fetchInsumos, fetchProdutos])

  useEffect(() => {
    fetchConfiguracoes()
  }, [fetchConfiguracoes])

  const handleOpenModal = () => {
    setFormData({
      itemTipo: 'insumo',
      itemId: '',
      limiteEstoqueBaixo: '',
      diasAntesVencimento: '',
      margemCustoMaxima: '',
      ativo: true
    })
    setIsModalOpen(true)
    setError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const requestData: {
        tipo: string;
        itemTipo: string;
        itemId: string;
        ativo: boolean;
        limiteEstoqueBaixo?: number;
        diasAntesVencimento?: number;
        margemCustoMaxima?: number;
      } = {
        tipo: activeTab,
        itemTipo: formData.itemTipo,
        itemId: formData.itemId,
        ativo: formData.ativo
      }

      if (activeTab === 'estoque_baixo') {
        requestData.limiteEstoqueBaixo = parseFloat(formData.limiteEstoqueBaixo)
      } else if (activeTab === 'validade_proxima') {
        requestData.diasAntesVencimento = parseInt(formData.diasAntesVencimento)
      } else if (activeTab === 'custo_alto') {
        requestData.margemCustoMaxima = parseFloat(formData.margemCustoMaxima)
      }

      const response = await fetch('/api/configuracoes-alerta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        handleCloseModal()
        fetchConfiguracoes()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar configuração')
      }
    } catch {
      setError('Erro ao salvar configuração')
    } finally {
      setLoading(false)
    }
  }

  const processarAlertas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/alertas/processar', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        alert(`${data.alertas?.length || 0} alertas foram processados`)
      }
    } catch (error) {
      console.error('Error processing alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentItems = formData.itemTipo === 'insumo' ? insumos : produtos
  const filteredConfiguracoes = configuracoes.filter(config => 
    config.tipo === activeTab &&
    (searchTerm === '' || getItemName(config.itemId, config.itemTipo).toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'estoque_baixo': return Package
      case 'validade_proxima': return AlertTriangle
      case 'custo_alto': return ShoppingCart
      default: return Bell
    }
  }

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'estoque_baixo': return 'Estoque Baixo'
      case 'validade_proxima': return 'Validade Próxima'
      case 'custo_alto': return 'Custo Alto'
      default: return tab
    }
  }

  const getItemName = (itemId: string, itemTipo: string) => {
    const items = itemTipo === 'insumo' ? insumos : produtos
    const item = items.find(i => i.id === itemId)
    return item?.nome || `Item ID: ${itemId}`
  }

  // Calcular estatísticas
  const stats = {
    totalConfiguracoes: configuracoes.length,
    configuracaoAtivas: configuracoes.filter(c => c.ativo).length,
    estoqueBaixo: configuracoes.filter(c => c.tipo === 'estoque_baixo').length,
    validadeProxima: configuracoes.filter(c => c.tipo === 'validade_proxima').length
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent">
                Configuração de Alertas
              </h1>
              <p className="text-gray-600 mt-1">Gerencie alertas de estoque, validade e custos</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                onClick={processarAlertas}
                disabled={loading}
                className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">Processar Alertas</span>
                <span className="sm:hidden">Processar</span>
              </button>
              <button 
                onClick={handleOpenModal}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">Nova Configuração</span>
                <span className="sm:hidden">Nova</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total de Configurações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConfiguracoes}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Bell className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Configurações Ativas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.configuracaoAtivas}</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                <Settings className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Alertas Estoque</p>
                <p className="text-2xl font-bold text-gray-900">{stats.estoqueBaixo}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl">
                <Package className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Alertas Validade</p>
                <p className="text-2xl font-bold text-gray-900">{stats.validadeProxima}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <AlertTriangle className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {(['estoque_baixo', 'validade_proxima', 'custo_alto'] as const).map((tab) => {
                const Icon = getTabIcon(tab)
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all duration-200 ${
                      activeTab === tab
                        ? 'border-[#5AC8FA] text-[#5AC8FA]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {getTabLabel(tab)}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Busca e Tabela */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar configurações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5AC8FA] mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando configurações...</p>
              </div>
            ) : filteredConfiguracoes.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma configuração encontrada</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Tente ajustar os termos de busca.' : 'Clique em "Nova Configuração" para começar.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Item</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Configuração</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConfiguracoes.map((config) => (
                      <tr key={config.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900">
                          {getItemName(config.itemId, config.itemTipo)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            config.itemTipo === 'insumo' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {config.itemTipo === 'insumo' ? 'Insumo' : 'Produto'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {activeTab === 'estoque_baixo' ? `Limite: ${config.limiteEstoqueBaixo}` :
                           activeTab === 'validade_proxima' ? `${config.diasAntesVencimento} dias` :
                           `Margem: ${config.margemCustoMaxima}%`}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            config.ativo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {config.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  Nova Configuração - {getTabLabel(activeTab)}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingLabelSelect
                    label="Tipo de Item"
                    value={formData.itemTipo}
                    onChange={(value) => setFormData({ ...formData, itemTipo: value, itemId: '' })}
                    options={[
                      { value: 'insumo', label: 'Insumo' },
                      { value: 'produto', label: 'Produto' }
                    ]}
                    required
                  />

                  <FloatingLabelSelect
                    label={formData.itemTipo === 'insumo' ? 'Insumo' : 'Produto'}
                    value={formData.itemId}
                    onChange={(value) => setFormData({ ...formData, itemId: value })}
                    options={[
                      { value: '', label: 'Selecione um item' },
                      ...currentItems.map(item => ({ value: item.id, label: item.nome }))
                    ]}
                    required
                  />

                  {activeTab === 'estoque_baixo' && (
                    <FloatingLabelInput
                      label="Limite de Estoque Baixo"
                      type="number"
                      step="0.01"
                      value={formData.limiteEstoqueBaixo}
                      onChange={(value) => setFormData({ ...formData, limiteEstoqueBaixo: value })}
                      required
                    />
                  )}

                  {activeTab === 'validade_proxima' && (
                    <FloatingLabelInput
                      label="Dias Antes do Vencimento"
                      type="number"
                      value={formData.diasAntesVencimento}
                      onChange={(value) => setFormData({ ...formData, diasAntesVencimento: value })}
                      required
                    />
                  )}

                  {activeTab === 'custo_alto' && (
                    <FloatingLabelInput
                      label="Margem Mínima (%)"
                      type="number"
                      step="0.1"
                      value={formData.margemCustoMaxima}
                      onChange={(value) => setFormData({ ...formData, margemCustoMaxima: value })}
                      required
                    />
                  )}

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.ativo}
                        onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                        className="rounded border-gray-300 text-[#5AC8FA] shadow-sm focus:border-[#5AC8FA] focus:ring focus:ring-[#5AC8FA]/20 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Configuração ativa</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
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
