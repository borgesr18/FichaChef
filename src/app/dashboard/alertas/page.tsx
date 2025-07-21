'use client'

import React, { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
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
    config.tipo === activeTab
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Configuração de Alertas</h1>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={processarAlertas}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center disabled:opacity-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Processar Alertas
            </button>
            <button 
              onClick={handleOpenModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Configuração
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['estoque_baixo', 'validade_proxima', 'custo_alto'] as const).map((tab) => {
              const Icon = getTabIcon(tab)
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
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

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar configurações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Configuração
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConfiguracoes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      Nenhuma configuração encontrada. Clique em &quot;Nova Configuração&quot; para começar.
                    </td>
                  </tr>
                ) : (
                  filteredConfiguracoes.map((config) => (
                    <tr key={config.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getItemName(config.itemId, config.itemTipo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {config.itemTipo === 'insumo' ? 'Insumo' : 'Produto'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activeTab === 'estoque_baixo' && `Limite: ${config.limiteEstoqueBaixo}`}
                        {activeTab === 'validade_proxima' && `${config.diasAntesVencimento} dias`}
                        {activeTab === 'custo_alto' && `Margem: ${config.margemCustoMaxima}%`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          config.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {config.ativo ? 'Ativo' : 'Inativo'}
                        </span>
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
        title={`Nova Configuração - ${getTabLabel(activeTab)}`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Item *
              </label>
              <select
                value={formData.itemTipo}
                onChange={(e) => setFormData({ ...formData, itemTipo: e.target.value, itemId: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="insumo">Insumo</option>
                <option value="produto">Produto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.itemTipo === 'insumo' ? 'Insumo' : 'Produto'} *
              </label>
              <select
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione um item</option>
                {currentItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'estoque_baixo' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limite de Estoque Baixo *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.limiteEstoqueBaixo}
                  onChange={(e) => setFormData({ ...formData, limiteEstoqueBaixo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}

            {activeTab === 'validade_proxima' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dias Antes do Vencimento *
                </label>
                <input
                  type="number"
                  value={formData.diasAntesVencimento}
                  onChange={(e) => setFormData({ ...formData, diasAntesVencimento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}

            {activeTab === 'custo_alto' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margem Mínima (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.margemCustoMaxima}
                  onChange={(e) => setFormData({ ...formData, margemCustoMaxima: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Configuração ativa</span>
              </label>
            </div>
          </div>

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
