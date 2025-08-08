'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { TrendingUp, Plus, Search, BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface FornecedorPreco {
  id: string
  preco: number
  dataVigencia: string
  ativo: boolean
  observacoes?: string
  fornecedor: {
    id: string
    nome: string
  }
  insumo: {
    id: string
    nome: string
  }
}

interface Fornecedor {
  id: string
  nome: string
  ativo: boolean
}

interface Insumo {
  id: string
  nome: string
}

export default function FornecedorPrecosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [precos, setPrecos] = useState<FornecedorPreco[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedInsumo, setSelectedInsumo] = useState('')

  const [formData, setFormData] = useState({
    fornecedorId: '',
    insumoId: '',
    preco: '',
    dataVigencia: new Date().toISOString().split('T')[0],
    observacoes: ''
  })

  useEffect(() => {
    fetchPrecos()
    fetchFornecedores()
    fetchInsumos()
  }, [])

  const fetchPrecos = async () => {
    try {
      const response = await fetch('/api/fornecedor-precos', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setPrecos(data)
      }
    } catch (error) {
      console.error('Error fetching precos:', error)
    }
  }

  const fetchFornecedores = async () => {
    try {
      const response = await fetch('/api/fornecedores', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setFornecedores(data.filter((f: Fornecedor) => f.ativo))
      }
    } catch (error) {
      console.error('Error fetching fornecedores:', error)
    }
  }

  const fetchInsumos = async () => {
    try {
      const response = await fetch('/api/insumos', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setInsumos(data)
      }
    } catch (error) {
      console.error('Error fetching insumos:', error)
    }
  }

  const handleOpenModal = () => {
    setFormData({
      fornecedorId: '',
      insumoId: selectedInsumo,
      preco: '',
      dataVigencia: new Date().toISOString().split('T')[0],
      observacoes: ''
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
      const response = await fetch('/api/fornecedor-precos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preco: parseFloat(formData.preco)
        }),
        credentials: 'include'
      })

      if (response.ok) {
        handleCloseModal()
        fetchPrecos()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar preço')
      }
    } catch {
      setError('Erro ao salvar preço')
    } finally {
      setLoading(false)
    }
  }

  const filteredPrecos = precos.filter(preco =>
    preco.fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    preco.insumo.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const precosGroupedByInsumo = filteredPrecos.reduce((acc, preco) => {
    const insumoId = preco.insumo.id
    if (!acc[insumoId]) {
      acc[insumoId] = {
        insumo: preco.insumo,
        precos: []
      }
    }
    acc[insumoId].precos.push(preco)
    return acc
  }, {} as Record<string, { insumo: Insumo, precos: FornecedorPreco[] }>)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Histórico de Preços</h1>
          </div>
          <button 
            onClick={handleOpenModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Preço
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por fornecedor ou insumo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={selectedInsumo}
                onChange={(e) => setSelectedInsumo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os insumos</option>
                {insumos.map((insumo) => (
                  <option key={insumo.id} value={insumo.id}>
                    {insumo.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {Object.values(precosGroupedByInsumo).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'Nenhum preço encontrado.' : 'Nenhum preço cadastrado. Clique em "Novo Preço" para começar.'}
              </div>
            ) : (
              Object.values(precosGroupedByInsumo).map(({ insumo, precos }) => (
                <div key={insumo.id} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    {insumo.nome}
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fornecedor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Preço
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data Vigência
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Observações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {precos
                          .sort((a, b) => new Date(b.dataVigencia).getTime() - new Date(a.dataVigencia).getTime())
                          .map((preco) => (
                          <tr key={preco.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {preco.fornecedor.nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(preco.preco)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(preco.dataVigencia).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                preco.ativo 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {preco.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {preco.observacoes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Novo Preço"
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
                Fornecedor *
              </label>
              <select
                value={formData.fornecedorId}
                onChange={(e) => setFormData({ ...formData, fornecedorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione um fornecedor</option>
                {fornecedores.map((fornecedor) => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insumo *
              </label>
              <select
                value={formData.insumoId}
                onChange={(e) => setFormData({ ...formData, insumoId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione um insumo</option>
                {insumos.map((insumo) => (
                  <option key={insumo.id} value={insumo.id}>
                    {insumo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Vigência *
              </label>
              <input
                type="date"
                value={formData.dataVigencia}
                onChange={(e) => setFormData({ ...formData, dataVigencia: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
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
