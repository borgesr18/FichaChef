'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { Factory, Plus, Search, Edit, Trash2 } from 'lucide-react'
import { convertFormDataToNumbers, convertFormDataToDates } from '@/lib/form-utils'

interface Producao {
  id: string
  fichaTecnicaId: string
  dataProducao: string
  dataValidade: string
  quantidadeProduzida: number
  lote: string
  fichaTecnica: { nome: string }
}

interface FichaTecnica {
  id: string
  nome: string
}

export default function ProducaoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [producoes, setProducoes] = useState<Producao[]>([])
  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProducao, setEditingProducao] = useState<Producao | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<{
    fichaTecnicaId: string
    dataProducao: string
    dataValidade: string
    quantidadeProduzida: string
    lote: string
  }>({
    fichaTecnicaId: '',
    dataProducao: '',
    dataValidade: '',
    quantidadeProduzida: '',
    lote: ''
  })

  useEffect(() => {
    fetchProducoes()
    fetchFichasTecnicas()
  }, [])

  const fetchProducoes = async () => {
    try {
      const response = await fetch('/api/producao')
      if (response.ok) {
        const data = await response.json()
        setProducoes(data)
      }
    } catch (error) {
      console.error('Error fetching producoes:', error)
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

  const handleOpenModal = (producao?: Producao) => {
    setEditingProducao(producao || null)
    if (producao) {
      setFormData({
        fichaTecnicaId: producao.fichaTecnicaId,
        dataProducao: producao.dataProducao?.split('T')[0] || '',
        dataValidade: producao.dataValidade?.split('T')[0] || '',
        quantidadeProduzida: producao.quantidadeProduzida.toString(),
        lote: producao.lote
      })
    } else {
      const today = new Date().toISOString().split('T')[0] || ''
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || ''
      setFormData({
        fichaTecnicaId: '',
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
      const url = editingProducao ? `/api/producao/${editingProducao.id}` : '/api/producao'
      const method = editingProducao ? 'PUT' : 'POST'

      const convertedData = convertFormDataToNumbers(formData, ['quantidadeProduzida'])
      const finalData = convertFormDataToDates(convertedData, ['dataProducao', 'dataValidade'])

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      })

      if (response.ok) {
        handleCloseModal()
        fetchProducoes()
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
      const response = await fetch(`/api/producao/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchProducoes()
      }
    } catch (error) {
      console.error('Error deleting producao:', error)
    }
  }

  const filteredProducoes = producoes.filter(producao =>
    producao.fichaTecnica.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producao.lote.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Factory className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Produção</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Produção
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar produções..."
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
                    Lote
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ficha Técnica
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
                      {searchTerm ? 'Nenhuma produção encontrada.' : 'Nenhuma produção registrada. Clique em "Nova Produção" para começar.'}
                    </td>
                  </tr>
                ) : (
                  filteredProducoes.map((producao) => (
                    <tr key={producao.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {producao.lote}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producao.fichaTecnica.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(producao.dataProducao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(producao.dataValidade).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producao.quantidadeProduzida}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(producao)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(producao.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
        title={editingProducao ? 'Editar Produção' : 'Nova Produção'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ficha Técnica *
            </label>
            <select
              value={formData.fichaTecnicaId}
              onChange={(e) => setFormData({ ...formData, fichaTecnicaId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecione uma ficha técnica</option>
              {fichasTecnicas.map((ficha) => (
                <option key={ficha.id} value={ficha.id}>
                  {ficha.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Produção *
              </label>
              <input
                type="date"
                value={formData.dataProducao}
                onChange={(e) => setFormData({ ...formData, dataProducao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Validade *
              </label>
              <input
                type="date"
                value={formData.dataValidade}
                onChange={(e) => setFormData({ ...formData, dataValidade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade Produzida *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantidadeProduzida}
                onChange={(e) => setFormData({ ...formData, quantidadeProduzida: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lote *
              </label>
              <input
                type="text"
                value={formData.lote}
                onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
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
