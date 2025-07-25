'use client'

import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ModernChart from '@/components/ui/ModernChart'
import ProfileDashboard from '@/components/ui/ProfileDashboard'
import NotificationSystem, { useNotifications } from '@/components/ui/NotificationSystem'
import { BarChart3, Package, FileText, Factory, ShoppingCart, AlertTriangle, TrendingUp, Users, Clock } from 'lucide-react'

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
    let isMounted = true

    const fetchStats = async () => {
      if (!isMounted) return
      
      try {
        setLoading(true)
        setError('')
        
        // Buscar dados de forma simples e direta
        const responses = await Promise.allSettled([
          fetch('/api/insumos', { 
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch('/api/fichas-tecnicas', { 
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch('/api/producao', { 
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch('/api/produtos', { 
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          })
        ])

        // Processar respostas
        const results = await Promise.allSettled(
          responses.map(async (response) => {
            if (response.status === 'fulfilled' && response.value.ok) {
              return response.value.json()
            }
            return []
          })
        )

        if (!isMounted) return

        const [insumos, fichas, producoes, produtos] = results.map(result => 
          result.status === 'fulfilled' ? result.value : []
        )

        const newStats = {
          insumos: Array.isArray(insumos) ? insumos.length : 0,
          fichasTecnicas: Array.isArray(fichas) ? fichas.length : 0,
          producoes: Array.isArray(producoes) ? producoes.length : 0,
          produtos: Array.isArray(produtos) ? produtos.length : 0
        }
        
        setStats(newStats)
        
        // Notificação de boas-vindas apenas se for primeira vez
        if (newStats.insumos === 0 && newStats.fichasTecnicas === 0) {
          addNotification({
            type: 'info',
            title: 'Bem-vindo ao FichaChef!',
            message: 'Comece cadastrando insumos e criando fichas técnicas.',
            duration: 6000
          })
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        if (!isMounted) return
        
        setError('Erro ao carregar dados do dashboard')
        addNotification({
          type: 'error',
          title: 'Erro no Dashboard',
          message: 'Não foi possível carregar os dados. Tente recarregar a página.',
          duration: 5000
        })
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchStats()
    
    return () => {
      isMounted = false
    }
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
      <div className="space-y-8 p-6">
        <ProfileDashboard />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-2 text-lg">Visão geral do sistema FichaChef</p>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-md">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards - Modernizados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Insumos</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.insumos}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-blue-100">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">Total cadastrado</span>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Fichas Técnicas</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.fichasTecnicas}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-emerald-100">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">Receitas criadas</span>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Produções</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.producoes}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Factory className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-purple-100">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">Registros de produção</span>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Produtos</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.produtos}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-orange-100">
                <Users className="h-4 w-4 mr-1" />
                <span className="text-sm">Produtos finais</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions - Modernizado */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-200/60">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full mr-4"></div>
              Ações Rápidas
            </h3>
            <div className="space-y-4">
              <a
                href="/dashboard/insumos"
                className="group flex items-center p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-blue-200/50"
              >
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-lg font-semibold text-slate-800">Cadastrar Insumo</span>
                  <p className="text-sm text-slate-600">Adicionar novos ingredientes</p>
                </div>
              </a>
              
              <a
                href="/dashboard/fichas-tecnicas"
                className="group flex items-center p-5 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl hover:from-emerald-100 hover:to-emerald-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-emerald-200/50"
              >
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-lg font-semibold text-slate-800">Nova Ficha Técnica</span>
                  <p className="text-sm text-slate-600">Criar receitas padronizadas</p>
                </div>
              </a>
              
              <a
                href="/dashboard/producao"
                className="group flex items-center p-5 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-purple-200/50"
              >
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Factory className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-lg font-semibold text-slate-800">Registrar Produção</span>
                  <p className="text-sm text-slate-600">Controlar produção diária</p>
                </div>
              </a>
            </div>
          </div>

          {/* Status - Modernizado */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-200/60">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full mr-4"></div>
              Status do Sistema
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200/50">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-emerald-500 rounded-full mr-3 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                  <div>
                    <span className="text-lg font-semibold text-slate-800">Sistema Online</span>
                    <p className="text-sm text-emerald-700">Funcionando normalmente</p>
                  </div>
                </div>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-200 px-3 py-2 rounded-full">Ativo</span>
              </div>
              
              {stats.insumos === 0 && (
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200/50">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mr-3" />
                    <div>
                      <span className="text-lg font-semibold text-slate-800">Nenhum insumo cadastrado</span>
                      <p className="text-sm text-amber-700">Comece cadastrando ingredientes</p>
                    </div>
                  </div>
                  <span className="text-xs text-amber-700 font-bold bg-amber-200 px-3 py-2 rounded-full">Atenção</span>
                </div>
              )}
              
              {stats.fichasTecnicas === 0 && (
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200/50">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mr-3" />
                    <div>
                      <span className="text-lg font-semibold text-slate-800">Nenhuma ficha técnica criada</span>
                      <p className="text-sm text-amber-700">Crie receitas padronizadas</p>
                    </div>
                  </div>
                  <span className="text-xs text-amber-700 font-bold bg-amber-200 px-3 py-2 rounded-full">Atenção</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Section - Modernizado */}
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
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-200/60">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full mr-4"></div>
              Resumo de Atividades
            </h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="p-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-6 inline-block">
                  <BarChart3 className="h-20 w-20 text-slate-500" />
                </div>
                <h4 className="text-xl font-semibold text-slate-700 mb-3">Gráficos serão exibidos quando houver mais dados</h4>
                <p className="text-slate-500 bg-slate-100 px-6 py-3 rounded-xl inline-block">
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

