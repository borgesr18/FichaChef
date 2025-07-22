'use client'

import React, { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import ModernTable from '@/components/ui/ModernTable'
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300">
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl mr-3 transform transition-transform duration-200 hover:scale-110">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Auditoria de Ações</h1>
              </div>
              
              <div className="flex space-x-4">
                <FloatingLabelSelect
                  label="Filtrar por Módulo"
                  value={filtroModulo}
                  onChange={(value: string) => setFiltroModulo(value)}
                  options={[
                    { value: '', label: 'Todos os módulos' },
                    { value: 'insumos', label: 'Insumos' },
                    { value: 'fichas-tecnicas', label: 'Fichas Técnicas' },
                    { value: 'produtos', label: 'Produtos' },
                    { value: 'producao', label: 'Produção' },
                    { value: 'estoque', label: 'Estoque' }
                  ]}
                />
                
                <FloatingLabelSelect
                  label="Filtrar por Ação"
                  value={filtroAcao}
                  onChange={(value: string) => setFiltroAcao(value)}
                  options={[
                    { value: '', label: 'Todas as ações' },
                    { value: 'create', label: 'Criar' },
                    { value: 'update', label: 'Atualizar' },
                    { value: 'delete', label: 'Excluir' },
                    { value: 'view', label: 'Visualizar' }
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            <ModernTable
              columns={[
                { 
                  key: 'createdAt', 
                  label: 'Data/Hora', 
                  sortable: true,
                  render: (value: unknown) => new Date(value as string).toLocaleString('pt-BR')
                },
                { 
                  key: 'usuario', 
                  label: 'Usuário', 
                  sortable: true,
                  render: (value: unknown) => {
                    const usuario = value as { nome?: string; email?: string } | null
                    return usuario?.nome || usuario?.email || 'Usuário desconhecido'
                  }
                },
                { 
                  key: 'acao', 
                  label: 'Ação', 
                  sortable: true,
                  render: (value: unknown) => (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAcaoColor(value as string)}`}>
                      {value as string}
                    </span>
                  )
                },
                { 
                  key: 'modulo', 
                  label: 'Módulo', 
                  sortable: true 
                },
                { 
                  key: 'itemInfo', 
                  label: 'Item', 
                  render: (_, row: unknown) => {
                    const auditRow = row as AuditoriaAcao
                    return (
                      <span className="text-sm text-gray-500">
                        {auditRow.itemTipo} {auditRow.itemId && `(${auditRow.itemId.slice(0, 8)}...)`}
                      </span>
                    )
                  }
                }
              ]}
              data={acoes as unknown as Record<string, unknown>[]}
              searchable={false}
              pagination={true}
              pageSize={10}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
