'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Clock, Plus, Edit, Trash2, Play, Pause, Calendar, Settings, BarChart3, Package } from 'lucide-react'

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

  // Calcular estatísticas
  const stats = {
    totalAgendamentos: agendamentos.length,
    agendamentosAtivos: agendamentos.filter(a => a.ativo).length,
    agendamentosDiarios: agendamentos.filter(a => a.frequencia === 'diario').length,
    agendamentosSemanais: agendamentos.filter(a => a.frequencia === 'semanal').length
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5AC8FA]"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent">
                Agendamentos de Relatórios
              </h1>
              <p className="text-gray-600 mt-1">Automatize a geração e envio dos seus relatórios</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Agendamento
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total de Agendamentos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAgendamentos}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Calendar className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Agendamentos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.agendamentosAtivos}</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                <Settings className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Agendamentos Diários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.agendamentosDiarios}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl">
                <BarChart3 className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Agendamentos Semanais</p>
                <p className="text-2xl font-bold text-gray-900">{stats.agendamentosSemanais}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <Package className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          {agendamentos.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-gray-600 mb-4">Clique em &quot;Novo Agendamento&quot; para começar.</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Criar Primeiro Agendamento
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {agendamentos.map((agendamento) => (
                <div key={agendamento.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{agendamento.nome}</h3>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            agendamento.ativo 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {agendamento.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                          <button
                            onClick={() => toggleAgendamento(agendamento)}
                            className={`p-2 rounded-lg transition-colors ${
                              agendamento.ativo 
                                ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50' 
                                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                            }`}
                            title={agendamento.ativo ? 'Pausar agendamento' : 'Ativar agendamento'}
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
                            className="text-[#5AC8FA] hover:text-[#1B2E4B] transition-colors p-2 rounded-lg hover:bg-gray-100"
                            title="Editar agendamento"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(agendamento.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                            title="Excluir agendamento"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium mr-2">Tipo:</span>
                          <span>{getTipoText(agendamento.tipo)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium mr-2">Formato:</span>
                          <span className="uppercase bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                            {agendamento.formato}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium mr-2">Frequência:</span>
                          <span>{getFrequenciaText(agendamento.frequencia)} às {agendamento.horario}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <span className="font-medium">Próxima execução:</span> {new Date(agendamento.proximaExecucao).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Agendamento
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Relatório
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequência
                    </label>
                    <select
                      value={formData.frequencia}
                      onChange={(e) => setFormData({ ...formData, frequencia: e.target.value as 'diario' | 'semanal' | 'mensal' })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
                    placeholder="Para envio automático do relatório"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="h-4 w-4 text-[#5AC8FA] focus:ring-[#5AC8FA] border-gray-300 rounded"
                  />
                  <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                    Agendamento ativo
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    {editingAgendamento ? 'Atualizar' : 'Criar'}
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

