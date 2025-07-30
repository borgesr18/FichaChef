'use client'

import React, { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Shield, Activity, TrendingUp, Users, Clock, Database } from 'lucide-react'

interface AuditoriaAcao {
  id: string
  userId: string
  acao: string
  modulo: string
  itemId?: string
  itemTipo?: string
  detalhes?: Record<string, unknown>
  createdAt: string
  usuario?: {
    nome?: string
    email?: string
  }
}

const FloatingLabelSelect = ({ label, value, onChange, options, required = false, className = "" }: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  className?: string
}) => {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className="peer w-full px-4 pt-6 pb-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200 appearance-none text-gray-900 font-medium"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <label className={`absolute left-1 transition-all duration-200 pointer-events-none bg-white/80 px-1 rounded ${
        focused || hasValue 
          ? 'top-1 text-xs text-[#5AC8FA] font-semibold' 
          : 'top-1 text-gray-500 font-medium'
      }`}>
        {label}
      </label>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

export default function AuditoriaPage() {
  const [acoes, setAcoes] = useState<AuditoriaAcao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroModulo, setFiltroModulo] = useState('')
  const [filtroAcao, setFiltroAcao] = useState('')

  const fetchAcoes = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filtroModulo) params.append('modulo', filtroModulo)
      if (filtroAcao) params.append('acao', filtroAcao)

      const response = await fetch(`/api/auditoria?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAcoes(data)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }, [filtroModulo, filtroAcao])

  useEffect(() => {
    fetchAcoes()
  }, [fetchAcoes])

  const getAcaoColor = (acao: string) => {
    switch (acao) {
      case 'create': return 'text-green-600 bg-green-100'
      case 'update': return 'text-blue-600 bg-blue-100'
      case 'delete': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const stats = {
    totalAcoes: acoes.length,
    acoesCreate: acoes.filter(a => a.acao === 'create').length,
    acoesUpdate: acoes.filter(a => a.acao === 'update').length,
    acoesDelete: acoes.filter(a => a.acao === 'delete').length
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent">
            Auditoria de Ações
          </h1>
          <p className="text-gray-600 mt-1">Monitore e analise todas as ações realizadas no sistema</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total de Ações" value={stats.totalAcoes} icon={<Activity size={24} />} gradient="from-blue-400 to-blue-600" />
          <StatCard title="Criações" value={stats.acoesCreate} icon={<TrendingUp size={24} />} gradient="from-green-400 to-green-600" />
          <StatCard title="Atualizações" value={stats.acoesUpdate} icon={<Clock size={24} />} gradient="from-orange-400 to-orange-600" />
          <StatCard title="Exclusões" value={stats.acoesDelete} icon={<Database size={24} />} gradient="from-purple-400 to-purple-600" />
        </div>

        {/* Filtros */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-[#1B2E4B] to-[#5AC8FA] rounded-full"></div>
            <h2 className="text-2xl font-semibold text-gray-900">Filtros de Auditoria</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FloatingLabelSelect
              label="Filtrar por Módulo"
              value={filtroModulo}
              onChange={setFiltroModulo}
              options={[
                { value: '', label: 'Todos os módulos' },
                { value: 'insumos', label: 'Insumos' },
                { value: 'fichas-tecnicas', label: 'Fichas Técnicas' },
                { value: 'produtos', label: 'Produtos' },
                { value: 'producao', label: 'Produção' },
                { value: 'estoque', label: 'Estoque' },
                { value: 'fornecedores', label: 'Fornecedores' },
                { value: 'usuarios', label: 'Usuários' },
                { value: 'cardapios', label: 'Cardápios' }
              ]}
            />
            <FloatingLabelSelect
              label="Filtrar por Ação"
              value={filtroAcao}
              onChange={setFiltroAcao}
              options={[
                { value: '', label: 'Todas as ações' },
                { value: 'create', label: 'Criar' },
                { value: 'update', label: 'Atualizar' },
                { value: 'delete', label: 'Excluir' },
                { value: 'view', label: 'Visualizar' },
                { value: 'export', label: 'Exportar' },
                { value: 'import', label: 'Importar' }
              ]}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setFiltroModulo('')
                setFiltroAcao('')
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#5AC8FA] transition-colors duration-200"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-[#1B2E4B] to-[#5AC8FA] rounded-full"></div>
            <h2 className="text-2xl font-semibold text-gray-900">Registro de Ações</h2>
          </div>

          {loading ? (
            <LoadingState />
          ) : acoes.length === 0 ? (
            <EmptyState />
          ) : (
            <AuditTable acoes={acoes} getAcaoColor={getAcaoColor} />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ title, value, icon, gradient }: { title: string, value: number, icon: React.ReactNode, gradient: string }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`bg-gradient-to-br ${gradient} p-3 rounded-xl`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5AC8FA] mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando registros de auditoria...</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
      <p className="text-gray-600">Não há ações registradas com os filtros selecionados</p>
    </div>
  )
}

function AuditTable({ acoes, getAcaoColor }: { acoes: AuditoriaAcao[], getAcaoColor: (acao: string) => string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Data/Hora</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Usuário</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Ação</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Módulo</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Item</th>
          </tr>
        </thead>
        <tbody>
          {acoes.map((acao) => (
            <tr key={acao.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
              <td className="py-4 px-4">
                <div className="text-sm text-gray-900 font-medium">
                  {new Date(acao.createdAt).toLocaleString('pt-BR')}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#1B2E4B] to-[#5AC8FA] rounded-full flex items-center justify-center mr-3">
                    <Users className="text-white" size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {acao.usuario?.nome || acao.usuario?.email || 'Usuário desconhecido'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getAcaoColor(acao.acao)}`}>
                  {acao.acao}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {acao.modulo.replace('-', ' ')}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-gray-600">
                  {acao.itemTipo && acao.itemId ? (
                    <span className="font-medium">
                      {acao.itemTipo}: {acao.itemId}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
