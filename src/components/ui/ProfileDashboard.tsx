'use client'

import React, { useState, useEffect } from 'react'
import { useProfileInterface } from '@/hooks/useProfileInterface'
import { formatCurrency } from '@/lib/utils'
import MobileOptimizedButton from './MobileOptimizedButton'
import { 
  BarChart3, 
  Users, 
  FileText, 
  Factory, 
  Calculator,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Warehouse,
  ChefHat,
  Sparkles,
  Activity
} from 'lucide-react'

export default function ProfileDashboard() {
  const { config, userRole } = useProfileInterface()
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    performanceChange: 0,
    revenue: 0,
    stockItems: 0,
    profitMargin: 0,
    activeAlerts: 0,
    favoriteRecipes: 0,
    avgPrepTime: 0
  })

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/dashboard-stats', { credentials: 'include' })
        if (response.ok) {
          const stats = await response.json()
          setDashboardStats(stats)
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      }
    }
    fetchDashboardStats()
  }, [])

  const handleRefresh = async () => {
    try {
      const response = await fetch('/api/dashboard-stats', { credentials: 'include' })
      if (response.ok) {
        const stats = await response.json()
        setDashboardStats(stats)
      }
    } catch (error) {
      console.error('Error refreshing dashboard stats:', error)
    }
  }

  const getDashboardContent = () => {
    switch (config?.dashboardLayout) {
      case 'executive':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Receita</p>
                    <p className="text-2xl font-bold text-white mt-1">{formatCurrency(dashboardStats.revenue)}</p>
                    <p className="text-orange-100 text-sm mt-1">este mês</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-orange-100">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">Visão executiva</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Equipe</p>
                    <p className="text-2xl font-bold text-white mt-1">{dashboardStats.totalUsers}</p>
                    <p className="text-blue-100 text-sm mt-1">usuários ativos</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-blue-100">
                  <Activity className="h-4 w-4 mr-1" />
                  <span className="text-sm">Gestão de usuários</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Performance</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {dashboardStats.performanceChange > 0 ? '+' : ''}{dashboardStats.performanceChange}%
                    </p>
                    <p className="text-emerald-100 text-sm mt-1">vs mês anterior</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-emerald-100">
                  <Sparkles className="h-4 w-4 mr-1" />
                  <span className="text-sm">Análise de resultados</span>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'operational':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/60 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800">Controle de Custos</h3>
                  <p className="text-sm text-slate-600 mb-3">Análise financeira detalhada</p>
                  <MobileOptimizedButton size="sm" variant="outline" className="hover:scale-105 transition-transform">
                    Ver Relatório
                  </MobileOptimizedButton>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/60 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                  <Warehouse className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800">Estoque</h3>
                  <p className="text-sm text-slate-600">Controle de inventário</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-amber-600">{dashboardStats.stockItems}</span>
                    <span className="text-sm text-slate-500 ml-2">itens em estoque</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/60 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800">Margem de Lucro</h3>
                  <p className="text-sm text-slate-600">Análise de rentabilidade</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-purple-600">{dashboardStats.profitMargin}%</span>
                    <span className="text-sm text-slate-500 ml-2">margem média</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/60 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800">Alertas</h3>
                  <p className="text-sm text-slate-600">Itens que precisam de atenção</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-red-600">{dashboardStats.activeAlerts}</span>
                    <span className="text-sm text-slate-500 ml-2">alertas ativos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'simplified':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">Fichas Técnicas</h3>
                  <p className="text-sm text-emerald-700 mb-3">Receitas do dia</p>
                  <MobileOptimizedButton size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Acessar Fichas
                  </MobileOptimizedButton>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <Factory className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">Produção</h3>
                  <p className="text-sm text-orange-700 mb-3">Controle de produção</p>
                  <MobileOptimizedButton size="sm" variant="secondary" className="w-full">
                    Iniciar Produção
                  </MobileOptimizedButton>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <ChefHat className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">Receitas Favoritas</h3>
                  <p className="text-sm text-blue-700">Acesso rápido</p>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-blue-600">{dashboardStats.favoriteRecipes}</span>
                    <span className="text-sm text-slate-500 ml-1">favoritas</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">Tempo de Preparo</h3>
                  <p className="text-sm text-purple-700">Média hoje</p>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-purple-600">{dashboardStats.avgPrepTime}min</span>
                    <span className="text-sm text-slate-500 ml-1">por prato</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-2xl shadow-lg border border-slate-200/60">
            <div className="text-center">
              <div className="p-6 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl mb-4 inline-block">
                <BarChart3 className="h-12 w-12 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Dashboard FichaChef</h3>
              <p className="text-slate-600">Bem-vindo ao sistema de gestão gastronômica</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {userRole === 'chef' && (
              <>
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                  <ChefHat className="h-5 w-5 text-white" />
                </div>
                Painel Executivo
              </>
            )}
            {userRole === 'gerente' && (
              <>
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                Painel Gerencial
              </>
            )}
            {userRole === 'cozinheiro' && (
              <>
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                  <Factory className="h-5 w-5 text-white" />
                </div>
                Painel de Produção
              </>
            )}
          </h1>
          <p className="text-slate-600 mt-1">
            {userRole === 'chef' && 'Visão completa do negócio e equipe'}
            {userRole === 'gerente' && 'Controle operacional e financeiro'}
            {userRole === 'cozinheiro' && 'Ferramentas essenciais para produção'}
          </p>
        </div>
        <div className="flex gap-2">
          <MobileOptimizedButton 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            className="hover:scale-105 transition-transform"
          >
            <Activity className="h-4 w-4 mr-2" />
            Atualizar
          </MobileOptimizedButton>
        </div>
      </div>
      {getDashboardContent()}
    </div>
  )
}

