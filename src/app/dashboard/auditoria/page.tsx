'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { FileText } from 'lucide-react'

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

export default function AuditoriaPage() {
  const [acoes, setAcoes] = useState<AuditoriaAcao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroModulo, setFiltroModulo] = useState('')
  const [filtroAcao, setFiltroAcao] = useState('')

  const fetchAcoes = async () => {
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
  }

  useEffect(() => {
    fetchAcoes()
  }, [filtroModulo, filtroAcao, fetchAcoes])

  const getAcaoColor = (acao: string) => {
    switch (acao) {
      case 'create': return 'text-green-600 bg-green-100'
      case 'update': return 'text-blue-600 bg-blue-100'
      case 'delete': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Auditoria de Ações</h1>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={filtroModulo}
              onChange={(e) => setFiltroModulo(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todos os módulos</option>
              <option value="insumos">Insumos</option>
              <option value="fichas-tecnicas">Fichas Técnicas</option>
              <option value="produtos">Produtos</option>
              <option value="producao">Produção</option>
              <option value="estoque">Estoque</option>
            </select>
            
            <select
              value={filtroAcao}
              onChange={(e) => setFiltroAcao(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todas as ações</option>
              <option value="create">Criar</option>
              <option value="update">Atualizar</option>
              <option value="delete">Excluir</option>
              <option value="view">Visualizar</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando logs de auditoria...</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Módulo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {acoes.map((acao) => (
                    <tr key={acao.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(acao.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {acao.usuario?.nome || acao.usuario?.email || 'Usuário desconhecido'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAcaoColor(acao.acao)}`}>
                          {acao.acao}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {acao.modulo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {acao.itemTipo} {acao.itemId && `(${acao.itemId.slice(0, 8)}...)`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
