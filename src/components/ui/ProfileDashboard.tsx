'use client'

import React, { useState, useEffect } from 'react'
import { useProfileInterface } from '@/hooks/useProfileInterface'
import { formatCurrency } from '@/lib/utils'
import MobileOptimizedCard from './MobileOptimizedCard'
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
  ChefHat
} from 'lucide-react'

export default function ProfileDashboard() {
  const { config, userRole, getColorClasses } = useProfileInterface()
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
        const response = await fetch('/api/dashboard-stats')
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

  const handleRefresh = () => {
    window.location.reload()
  }

  const getDashboardContent = () => {
    switch (config?.dashboardLayout) {
      case 'executive':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mobile-grid-1 mobile-gap-2">
            <MobileOptimizedCard className={`${getColorClasses('background')} border-l-4 border-orange-500`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Visão Executiva</h3>
                  <p className="text-sm text-gray-600">KPIs e métricas principais</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-orange-600">
                      {formatCurrency(dashboardStats.revenue)}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">este mês</span>
                  </div>
                </div>
              </div>
            </MobileOptimizedCard>

            <MobileOptimizedCard>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Equipe</h3>
                  <p className="text-sm text-gray-600">Gestão de usuários</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-blue-600">{dashboardStats.totalUsers}</span>
                    <span className="text-sm text-gray-500 ml-2">usuários ativos</span>
                  </div>
                </div>
              </div>
            </MobileOptimizedCard>

            <MobileOptimizedCard>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Performance</h3>
                  <p className="text-sm text-gray-600">Análise de resultados</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-green-600">
                      {dashboardStats.performanceChange > 0 ? '+' : ''}{dashboardStats.performanceChange}%
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs mês anterior</span>
                  </div>
                </div>
              </div>
            </MobileOptimizedCard>
          </div>
        )
      
      case 'operational':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mobile-grid-1 mobile-gap-2">
            <MobileOptimizedCard className="border-l-4 border-blue-500">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calculator className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Controle de Custos</h3>
                  <p className="text-sm text-gray-600">Análise financeira detalhada</p>
                  <div className="mt-3 flex gap-2 mobile-stack mobile-gap-2">
                    <MobileOptimizedButton size="sm" variant="outline">
                      Ver Relatório
                    </MobileOptimizedButton>
                  </div>
                </div>
              </div>
            </MobileOptimizedCard>

            <MobileOptimizedCard>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Warehouse className="h-8 w-8 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Estoque</h3>
                  <p className="text-sm text-gray-600">Controle de inventário</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-amber-600">{dashboardStats.stockItems}</span>
                    <span className="text-sm text-gray-500 ml-2">itens em estoque</span>
                  </div>
                </div>
              </div>
            </MobileOptimizedCard>

            <MobileOptimizedCard>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Margem de Lucro</h3>
                  <p className="text-sm text-gray-600">Análise de rentabilidade</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-purple-600">{dashboardStats.profitMargin}%</span>
                    <span className="text-sm text-gray-500 ml-2">margem média</span>
                  </div>
                </div>
              </div>
            </MobileOptimizedCard>

            <MobileOptimizedCard>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Alertas</h3>
                  <p className="text-sm text-gray-600">Itens que precisam de atenção</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-red-600">{dashboardStats.activeAlerts}</span>
                    <span className="text-sm text-gray-500 ml-2">alertas ativos</span>
                  </div>
                </div>
              </div>
            </MobileOptimizedCard>
          </div>
        )
      
      case 'simplified':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mobile-grid-1 mobile-gap-2">
            <MobileOptimizedCard padding="sm" className="border-l-4 border-green-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-gray-900">Fichas Técnicas</h3>
                  <p className="text-xs text-gray-600">Receitas do dia</p>
                  <div className="mt-2">
                    <MobileOptimizedButton size="sm" className="w-full mobile-full-width">
                      Acessar Fichas
                    </MobileOptimizedButton>
                  </div>
                </div>
              </div>
            </MobileOptimizedCard>

            <MobileOptimizedCard padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Factory className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-gray-900">Produção</h3>
                  <p className="text-xs text-gray-600">Controle de produção</p>
                  <div className="mt-2">
                    <MobileOptimizedButton size="sm" variant="secondary" className="w-full mobile-full-width">
                      Iniciar Produção
                    </MobileOptimizedButton>
                  </div>
                </div>
              </div>
            </MobileOptimizedCard>

            <MobileOptimizedCard padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ChefHat className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-gray-900">Receitas Favoritas</h3>
                  <p className="text-xs text-gray-600">Acesso rápido</p>
                  <div className="mt-1">
                    <span className="text-lg font-bold text-blue-600">{dashboardStats.favoriteRecipes}</span>
                    <span className="text-xs text-gray-500 ml-1">favoritas</span>
                  </div>
                </div>
              </div>
            </MobileOptimizedCard>

            <MobileOptimizedCard padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-gray-900">Tempo de Preparo</h3>
                  <p className="text-xs text-gray-600">Média hoje</p>
                  <div className="mt-1">
                    <span className="text-lg font-bold text-purple-600">{dashboardStats.avgPrepTime}min</span>
                    <span className="text-xs text-gray-500 ml-1">por prato</span>
                  </div>
                </div>
              </div>
            </MobileOptimizedCard>
          </div>
        )
      
      default:
        return (
          <MobileOptimizedCard>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard FichaChef</h3>
              <p className="text-gray-600">Bem-vindo ao sistema de gestão gastronômica</p>
            </div>
          </MobileOptimizedCard>
        )
    }
  }

  return (
    <div className={`${config?.compactMode ? 'space-y-4' : 'space-y-6'}`}>
      <div className="flex items-center justify-between mobile-stack mobile-gap-2">
        <div>
          <h1 className={`font-bold text-gray-900 ${config?.compactMode ? 'text-xl' : 'text-2xl'} mobile-text-sm`}>
            {userRole === 'chef' && '👨‍🍳 Painel Executivo'}
            {userRole === 'gerente' && '📊 Painel Gerencial'}
            {userRole === 'cozinheiro' && '🍳 Painel de Produção'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {userRole === 'chef' && 'Visão completa do negócio e equipe'}
            {userRole === 'gerente' && 'Controle operacional e financeiro'}
            {userRole === 'cozinheiro' && 'Ferramentas essenciais para produção'}
          </p>
        </div>
        <div className="flex gap-2 mobile-full-width mobile-stack">
          <MobileOptimizedButton 
            size="sm" 
            variant="outline" 
            className="mobile-full-width"
            onClick={handleRefresh}
          >
            Atualizar
          </MobileOptimizedButton>
        </div>
      </div>
      {getDashboardContent()}
    </div>
  )
}
