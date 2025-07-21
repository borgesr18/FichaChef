'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { Clock, Plus, Edit, Trash2, Play, Pause } from 'lucide-react'

interface RelatorioAgendamento {
  id: string
  nome: string
  tipo: string
  formato: string
  frequencia: string
  horario: string
  ativo: boolean
  proximaExecucao: string
  ultimaExecucao?: string
  template?: {
    nome: string
  }
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<RelatorioAgendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAgendamento, setEditingAgendamento] = useState<RelatorioAgendamento | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'custos',
    formato: 'pdf' as 'pdf' | 'excel',
    frequencia: 'diario' as 'diario' | 'semanal' | 'mensal',
    horario: '09:00',
    diasSemana: '[]',
    diaMes: 1,
    email: '',
    ativo: true
  })

  useEffect(() => {
    fetchAgendamentos()
  }, [])

  const fetchAgendamentos = async () => {
    try {
      const response = await fetch('/api/relatorio-agendamentos')
      if (response.ok) {
        const data = await response.json()
        setAgendamentos(data)
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingAgendamento ? `/api/relatorio-agendamentos/${editingAgendamento.id}` : '/api/relatorio-agendamentos'
      const method = editingAgendamento ? 'PUT' : 'POST'
      
      const submitData = {
        ...formData,
        email: formData.email.trim() || undefined, // Remove empty email
        diasSemana: formData.frequencia === 'semanal' ? formData.diasSemana : undefined,
        diaMes: formData.frequencia === 'mensal' ? formData.diaMes : undefined
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        await fetchAgendamentos()
        setShowModal(false)
        resetForm()
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        alert('Erro ao salvar agendamento: ' + (errorData.error || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert('Erro ao salvar agendamento')
    }
  }

  const handleDelete = async (agendamentoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return
    
    try {
      const response = await fetch(`/api/relatorio-agendamentos/${agendamentoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchAgendamentos()
      }
    } catch (error) {
      console.error('Error deleting schedule:', error)
    }
  }

  const toggleAgendamento = async (agendamento: RelatorioAgendamento) => {
    try {
      const response = await fetch(`/api/relatorio-agendamentos/${agendamento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...agendamento, ativo: !agendamento.ativo })
      })

      if (response.ok) {
        await fetchAgendamentos()
      }
    } catch (error) {
      console.error('Error toggling schedule:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'custos',
      formato: 'pdf',
      frequencia: 'diario',
      horario: '09:00',
      diasSemana: '[]',
      diaMes: 1,
      email: '',
      ativo: true
    })
    setEditingAgendamento(null)
  }

  const getFrequenciaText = (frequencia: string, diasSemana?: string, diaMes?: number) => {
    switch (frequencia) {
      case 'diario':
        return 'Diário'
      case 'semanal':
        return `Semanal`
      case 'mensal':
        return `Mensal (dia ${diaMes})`
      default:
        return frequencia
    }
  }

  const getTipoText = (tipo: string) => {
    const tipos = {
      custos: 'Análise de Custos',
      producao: 'Relatório de Produção',
      estoque: 'Controle de Estoque',
      fichas: 'Fichas Mais Utilizadas',
      rentabilidade: 'Relatório de Rentabilidade',
      'abc-insumos': 'Análise ABC de Insumos',
      desperdicio: 'Relatório de Desperdício'
    }
    return tipos[tipo as keyof typeof tipos] || tipo
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Agendamentos de Relatórios</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {agendamentos.map((agendamento) => (
              <li key={agendamento.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{agendamento.nome}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          agendamento.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {agendamento.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                        <button
                          onClick={() => toggleAgendamento(agendamento)}
                          className={`p-1 rounded ${
                            agendamento.ativo ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'
                          }`}
                        >
                          {agendamento.ativo ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingAgendamento(agendamento)
                            setFormData({
                              nome: agendamento.nome,
                              tipo: agendamento.tipo,
                              formato: agendamento.formato as 'pdf' | 'excel',
                              frequencia: agendamento.frequencia as 'diario' | 'semanal' | 'mensal',
                              horario: agendamento.horario,
                              diasSemana: '[]',
                              diaMes: 1,
                              email: '',
                              ativo: agendamento.ativo
                            })
                            setShowModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(agendamento.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {getTipoText(agendamento.tipo)} • {agendamento.formato.toUpperCase()}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {getFrequenciaText(agendamento.frequencia)} às {agendamento.horario}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Próxima execução: {new Date(agendamento.proximaExecucao).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            resetForm()
          }}
          title={editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Agendamento
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Relatório
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="custos">Análise de Custos</option>
                  <option value="producao">Relatório de Produção</option>
                  <option value="estoque">Controle de Estoque</option>
                  <option value="fichas">Fichas Mais Utilizadas</option>
                  <option value="rentabilidade">Relatório de Rentabilidade</option>
                  <option value="abc-insumos">Análise ABC de Insumos</option>
                  <option value="desperdicio">Relatório de Desperdício</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato
                </label>
                <select
                  value={formData.formato}
                  onChange={(e) => setFormData({ ...formData, formato: e.target.value as 'pdf' | 'excel' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequência
                </label>
                <select
                  value={formData.frequencia}
                  onChange={(e) => setFormData({ ...formData, frequencia: e.target.value as 'diario' | 'semanal' | 'mensal' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="diario">Diário</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário
                </label>
                <input
                  type="time"
                  value={formData.horario}
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {formData.frequencia === 'mensal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dia do Mês
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.diaMes}
                  onChange={(e) => setFormData({ ...formData, diaMes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (opcional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Para envio automático do relatório"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                Agendamento ativo
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingAgendamento ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
