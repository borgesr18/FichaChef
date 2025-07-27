"use client"

import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSupabase } from '@/components/providers/SupabaseProvider'

export default function Dashboard() {
  const { userRole } = useSupabase()

  // Dados mockados para demonstração
  const stats = {
    fichas: 24,
    produtos: 156,
    custoMedio: 'R$ 2.450',
    usuarios: 8
  }

  const recentRecipes = [
    { name: 'Lasanha Bolonhesa', time: '2 horas atrás', cost: 'R$ 45,20' },
    { name: 'Risotto de Camarão', time: '5 horas atrás', cost: 'R$ 78,90' },
    { name: 'Salmão Grelhado', time: '1 dia atrás', cost: 'R$ 62,30' },
    { name: 'Pasta Carbonara', time: '2 dias atrás', cost: 'R$ 32,50' }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8 fc-animate-fade-in">
        {/* Hero Section */}
        <div className="text-center py-12">
          <h1 className="fc-text-4xl fc-font-bold fc-gradient-text fc-mb-4">
            Bem-vindo ao FichaChef
          </h1>
          <p className="fc-text-xl text-gray-600 max-w-2xl mx-auto">
            Gerencie sua cozinha profissional com eficiência e estilo moderno
          </p>
        </div>

        {/* Stats Cards */}
        <div className="fc-stats-grid">
          <div className="fc-card fc-card-gradient-orange fc-stat-card fc-animate-slide-in-up fc-delay-100">
            <div className="fc-stat-icon">📋</div>
            <div className="fc-stat-number">{stats.fichas}</div>
            <div className="fc-stat-label">Fichas Técnicas</div>
          </div>
          
          <div className="fc-card fc-card-gradient-blue fc-stat-card fc-animate-slide-in-up fc-delay-200">
            <div className="fc-stat-icon">🥕</div>
            <div className="fc-stat-number">{stats.produtos}</div>
            <div className="fc-stat-label">Produtos</div>
          </div>
          
          <div className="fc-card fc-card-gradient-green fc-stat-card fc-animate-slide-in-up fc-delay-300">
            <div className="fc-stat-icon">💰</div>
            <div className="fc-stat-number">{stats.custoMedio}</div>
            <div className="fc-stat-label">Custo Médio</div>
          </div>
          
          <div className="fc-card fc-stat-card fc-animate-slide-in-up fc-delay-400">
            <div className="fc-stat-icon">👥</div>
            <div className="fc-stat-number">{stats.usuarios}</div>
            <div className="fc-stat-label">Usuários Ativos</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="fc-card fc-quick-actions fc-animate-slide-in-up fc-delay-500">
          <h3 className="fc-text-xl fc-font-semibold fc-mb-6 text-gray-800">
            Ações Rápidas
          </h3>
          <div className="fc-actions-grid">
            <div 
              className="fc-card fc-card-gradient-orange fc-hover-lift cursor-pointer text-center fc-animate-slide-in-up fc-delay-600"
              onClick={() => window.location.href = '/dashboard/fichas/nova'}
            >
              <div className="fc-stat-icon">➕</div>
              <div className="fc-font-semibold fc-mb-2">Nova Ficha Técnica</div>
              <div className="fc-text-sm opacity-90">Criar nova receita</div>
            </div>
            
            <div 
              className="fc-card fc-card-gradient-blue fc-hover-lift cursor-pointer text-center fc-animate-slide-in-up fc-delay-700"
              onClick={() => window.location.href = '/dashboard/produtos/novo'}
            >
              <div className="fc-stat-icon">🥕</div>
              <div className="fc-font-semibold fc-mb-2">Cadastrar Produto</div>
              <div className="fc-text-sm opacity-90">Adicionar ingrediente</div>
            </div>
            
            <div 
              className="fc-card fc-card-gradient-green fc-hover-lift cursor-pointer text-center fc-animate-slide-in-up fc-delay-800"
              onClick={() => window.location.href = '/dashboard/relatorios'}
            >
              <div className="fc-stat-icon">📊</div>
              <div className="fc-font-semibold fc-mb-2">Relatório de Custos</div>
              <div className="fc-text-sm opacity-90">Análise financeira</div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Recipes */}
          <div className="fc-card fc-animate-slide-in-right fc-delay-600">
            <div className="fc-flex fc-justify-between fc-items-center fc-mb-6">
              <h3 className="fc-text-xl fc-font-semibold text-gray-800">
                Fichas Recentes
              </h3>
              <button
                className="fc-btn fc-btn-outline fc-btn-sm"
                onClick={() => window.location.href = '/dashboard/fichas'}
              >
                Ver todas
              </button>
            </div>
            
            <div className="space-y-3">
              {recentRecipes.map((recipe, index) => (
                <div
                  key={index}
                  className="fc-flex fc-justify-between fc-items-center p-3 bg-gray-50 rounded-lg fc-hover-lift cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/fichas/${index + 1}`}
                >
                  <div>
                    <div className="fc-font-medium text-gray-800">{recipe.name}</div>
                    <div className="fc-text-sm text-gray-500">{recipe.time}</div>
                  </div>
                  <div className="fc-font-semibold text-orange-600">{recipe.cost}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Trends */}
          <div className="fc-card fc-animate-slide-in-right fc-delay-700">
            <div className="fc-flex fc-justify-between fc-items-center fc-mb-6">
              <h3 className="fc-text-xl fc-font-semibold text-gray-800">
                Tendências de Custo
              </h3>
              <button
                className="fc-btn fc-btn-outline fc-btn-sm"
                onClick={() => window.location.href = '/dashboard/analytics'}
              >
                Detalhes
              </button>
            </div>
            
            <div className="h-48 bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg fc-flex fc-items-center fc-justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <div className="text-gray-600 fc-font-medium">Gráfico de Tendências</div>
                <div className="fc-text-sm text-gray-500 mt-1">Em desenvolvimento</div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Actions for Chef */}
        {userRole === 'chef' && (
          <div className="fc-card fc-animate-slide-in-up fc-delay-900">
            <h3 className="fc-text-xl fc-font-semibold fc-mb-6 text-gray-800">
              Administração
            </h3>
            <div className="fc-flex fc-gap-4 flex-wrap">
              <button
                className="fc-btn fc-btn-secondary"
                onClick={() => window.location.href = '/dashboard/usuarios'}
              >
                <span>👥</span>
                Gerenciar Usuários
              </button>
              <button
                className="fc-btn fc-btn-outline"
                onClick={() => window.location.href = '/dashboard/configuracoes'}
              >
                <span>⚙️</span>
                Configurações
              </button>
              <button
                className="fc-btn fc-btn-outline"
                onClick={() => window.location.href = '/dashboard/relatorios'}
              >
                <span>📈</span>
                Relatórios Avançados
              </button>
            </div>
          </div>
        )}

        {/* Tips Card */}
        <div className="fc-card fc-card-gradient-orange fc-animate-slide-in-up fc-delay-1000 text-center">
          <div className="fc-text-3xl fc-mb-4">💡</div>
          <h4 className="fc-text-lg fc-font-semibold fc-mb-2">Dica do Dia</h4>
          <p className="opacity-90">
            Use ingredientes sazonais para reduzir custos e melhorar a qualidade das suas receitas.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

