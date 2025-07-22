'use client'

import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ModernChart from '@/components/ui/ModernChart'
import NotificationSystem, { useNotifications } from '@/components/ui/NotificationSystem'
import { BarChart3, Package, FileText, Factory, ShoppingCart, AlertTriangle } from 'lucide-react'
import { withRequestDeduplication } from '@/lib/request-cache'

interface DashboardStats {
  insumos: number
  fichasTecnicas: number
  producoes: number
  produtos: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    insumos: 0,
    fichasTecnicas: 0,
    producoes: 0,
    produtos: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { notifications, addNotification, removeNotification } = useNotifications()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Fetch stats from APIs with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        
        const [insumosRes, fichasRes, producoesRes, produtosRes] = await Promise.all([
          withRequestDeduplication('dashboard-insumos', () => 
            fetch('/api/insumos', { signal: controller.signal })),
          withRequestDeduplication('dashboard-fichas', () => 
            fetch('/api/fichas-tecnicas', { signal: controller.signal })),
          withRequestDeduplication('dashboard-producao', () => 
            fetch('/api/producao', { signal: controller.signal })),
          withRequestDeduplication('dashboard-produtos', () => 
            fetch('/api/produtos', { signal: controller.signal }))
        ])
        
        clearTimeout(timeoutId)

        if (!insumosRes.ok || !fichasRes.ok || !producoesRes.ok || !produtosRes.ok) {
          const statuses = [insumosRes.status, fichasRes.status, producoesRes.status, produtosRes.status]
          throw new Error(`API requests failed: ${statuses.join(', ')}`)
        }

        const [insumos, fichas, producoes, produtos] = await Promise.all([
          insumosRes.json(),
          fichasRes.json(),
          producoesRes.json(),
          produtosRes.json()
        ])

        const newStats = {
          insumos: Array.isArray(insumos) ? insumos.length : 0,
          fichasTecnicas: Array.isArray(fichas) ? fichas.length : 0,
          producoes: Array.isArray(producoes) ? producoes.length : 0,
          produtos: Array.isArray(produtos) ? produtos.length : 0
        }
        
        setStats(newStats)
        
        if (newStats.insumos === 0 && newStats.fichasTecnicas === 0) {
          addNotification({
            type: 'info',
            title: 'Bem-vindo ao FichaChef!',
            message: 'Comece cadastrando insumos e criando fichas técnicas.',
            duration: 8000
          })
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        const errorMessage = err instanceof Error && err.name === 'AbortError' 
          ? 'Tempo limite excedido ao carregar dados. Tente novamente.' 
          : 'Erro ao carregar estatísticas. Verifique sua conexão.'
        setError(errorMessage)
        
        addNotification({
          type: 'error',
          title: 'Erro no Dashboard',
          message: errorMessage,
          duration: 5000
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [addNotification])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-slate-600 mt-2 text-lg font-medium">Visão geral do sistema FichaChef</p>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-md">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/60 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Insumos</p>
                <p className="text-3xl font-bold text-slate-800">{stats.insumos}</p>
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/60 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Fichas Técnicas</p>
                <p className="text-3xl font-bold text-slate-800">{stats.fichasTecnicas}</p>
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/60 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Factory className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Produções</p>
                <p className="text-3xl font-bold text-slate-800">{stats.producoes}</p>
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/60 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Produtos</p>
                <p className="text-3xl font-bold text-slate-800">{stats.produtos}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-200/60">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full mr-3"></div>
              Ações Rápidas
            </h3>
            <div className="space-y-4">
              <a
                href="/dashboard/insumos"
                className="group flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
              >
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-800 ml-4">Cadastrar Insumo</span>
              </a>
              <a
                href="/dashboard/fichas-tecnicas"
                className="group flex items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl hover:from-emerald-100 hover:to-emerald-200 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
              >
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-800 ml-4">Nova Ficha Técnica</span>
              </a>
              <a
                href="/dashboard/producao"
                className="group flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
              >
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                  <Factory className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-800 ml-4">Registrar Produção</span>
              </a>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-200/60">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full mr-3"></div>
              Status do Sistema
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200/50">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-emerald-500 rounded-full mr-3 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                  <span className="text-sm font-semibold text-slate-800">Sistema Online</span>
                </div>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-200 px-3 py-1 rounded-full">Ativo</span>
              </div>
              
              {stats.insumos === 0 && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200/50">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mr-3" />
                    <span className="text-sm font-semibold text-slate-800">Nenhum insumo cadastrado</span>
                  </div>
                  <span className="text-xs text-amber-700 font-bold bg-amber-200 px-3 py-1 rounded-full">Atenção</span>
                </div>
              )}
              
              {stats.fichasTecnicas === 0 && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200/50">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mr-3" />
                    <span className="text-sm font-semibold text-slate-800">Nenhuma ficha técnica criada</span>
                  </div>
                  <span className="text-xs text-amber-700 font-bold bg-amber-200 px-3 py-1 rounded-full">Atenção</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modern Charts Section */}
        {(stats.insumos > 0 || stats.fichasTecnicas > 0 || stats.producoes > 0 || stats.produtos > 0) ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ModernChart
              title="Estatísticas do Sistema"
              type="bar"
              data={[
                { label: 'Insumos', value: stats.insumos, trend: 'up' },
                { label: 'Fichas Técnicas', value: stats.fichasTecnicas, trend: 'up' },
                { label: 'Produções', value: stats.producoes, trend: 'stable' },
                { label: 'Produtos', value: stats.produtos, trend: 'up' }
              ]}
              showTrend={true}
              height={300}
            />
            
            <ModernChart
              title="Distribuição por Categoria"
              type="donut"
              data={[
                { label: 'Insumos', value: stats.insumos },
                { label: 'Fichas Técnicas', value: stats.fichasTecnicas },
                { label: 'Produções', value: stats.producoes },
                { label: 'Produtos', value: stats.produtos }
              ]}
              height={300}
            />
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-200/60">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full mr-3"></div>
              Resumo de Atividades
            </h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-4 inline-block">
                  <BarChart3 className="h-16 w-16 text-slate-500" />
                </div>
                <p className="text-lg font-semibold text-slate-700 mb-2">Gráficos serão exibidos quando houver mais dados</p>
                <p className="text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-xl inline-block">
                  Comece cadastrando insumos e criando fichas técnicas
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
        position="top-right"
      />
    </DashboardLayout>
  )
}
