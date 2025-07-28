'use client'

import React, { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import ModernTable from '@/components/ui/ModernTable'
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mr-3 transform transition-transform duration-200 hover:scale-110">
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Configuração de Alertas</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button 
              onClick={processarAlertas}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:from-green-600 hover:to-green-700 flex items-center justify-center shadow-elegant hover:shadow-xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 group disabled:opacity-50 btn-modern"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2 transition-transform duration-200 group-hover:rotate-90" />
              <span className="hidden sm:inline">Processar Alertas</span>
              <span className="sm:hidden">Processar</span>
            </button>
            <button 
              onClick={handleOpenModal}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center justify-center shadow-elegant hover:shadow-xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 group btn-modern"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 transition-transform duration-200 group-hover:rotate-90" />
              <span className="hidden sm:inline">Nova Configuração</span>
              <span className="sm:hidden">Nova</span>
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

        <div className="glass-morphism rounded-2xl shadow-floating border border-white/20 hover:shadow-floating transition-all duration-300 card-modern">
          <div className="p-6 border-b border-slate-200/60">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-all duration-200 group-focus-within:text-orange-500 group-focus-within:scale-110" />
              <input
                type="text"
                placeholder="Buscar configurações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-md"
              />
            </div>
          </div>

          <ModernTable
            columns={[
              { key: 'itemName', label: 'Item', sortable: true },
              { key: 'itemTipo', label: 'Tipo', sortable: true,
                render: (value) => value === 'insumo' ? 'Insumo' : 'Produto' },
              { key: 'configuracao', label: 'Configuração', sortable: true },
              { key: 'ativo', label: 'Status', align: 'center',
                render: (value) => (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    value 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {value ? 'Ativo' : 'Inativo'}
                  </span>
                )}
            ]}
            data={filteredConfiguracoes.map(config => ({
              id: config.id,
              itemName: getItemName(config.itemId, config.itemTipo),
              itemTipo: config.itemTipo,
              configuracao: activeTab === 'estoque_baixo' ? `Limite: ${config.limiteEstoqueBaixo}` :
                          activeTab === 'validade_proxima' ? `${config.diasAntesVencimento} dias` :
                          `Margem: ${config.margemCustoMaxima}%`,
              ativo: config.ativo
            }))}
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
              className="px-6 py-3 text-slate-700 bg-slate-200 rounded-xl hover:bg-slate-300 transition-all duration-200 hover:scale-105"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 shadow-elegant hover:shadow-xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 btn-modern"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
