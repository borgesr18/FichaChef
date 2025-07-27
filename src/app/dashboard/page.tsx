"use client"

import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Bem-vindo ao FichaChef - Sistema de Gestão Gastronômica
          </p>
        </div>

        {/* Stats Cards */}
        <div className="fc-grid fc-grid-4 mb-8">
          <div className="fc-stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Fichas Técnicas</p>
                <p className="text-2xl font-bold text-gray-800">24</p>
              </div>
              <div className="text-3xl">🍳</div>
            </div>
          </div>

          <div className="fc-stats-card blue">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Produtos</p>
                <p className="text-2xl font-bold text-gray-800">156</p>
              </div>
              <div className="text-3xl">🥕</div>
            </div>
          </div>

          <div className="fc-stats-card green">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Custo Médio</p>
                <p className="text-2xl font-bold text-gray-800">R$ 2.450</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          <div className="fc-stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Usuários Ativos</p>
                <p className="text-2xl font-bold text-gray-800">8</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ações Rápidas</h2>
          <div className="fc-grid fc-grid-3">
            <div className="fc-card">
              <div className="text-center">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="text-lg font-semibold mb-2">Nova Ficha Técnica</h3>
                <p className="text-gray-600 mb-4">Criar nova receita</p>
                <button className="fc-btn-primary w-full">
                  Criar Ficha
                </button>
              </div>
            </div>

            <div className="fc-card">
              <div className="text-center">
                <div className="text-4xl mb-3">🥕</div>
                <h3 className="text-lg font-semibold mb-2">Cadastrar Produto</h3>
                <p className="text-gray-600 mb-4">Adicionar ingrediente</p>
                <button className="fc-btn-secondary w-full">
                  Adicionar
                </button>
              </div>
            </div>

            <div className="fc-card">
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-semibold mb-2">Relatório de Custos</h3>
                <p className="text-gray-600 mb-4">Análise financeira</p>
                <button className="fc-btn-secondary w-full">
                  Ver Relatório
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="fc-grid fc-grid-2">
          <div className="fc-card">
            <h3 className="text-lg font-semibold mb-4">Receitas Recentes</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Risotto de Camarão</p>
                  <p className="text-sm text-gray-600">Atualizado há 2 horas</p>
                </div>
                <span className="text-green-600 font-medium">R$ 45,80</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Salmão Grelhado</p>
                  <p className="text-sm text-gray-600">Criado ontem</p>
                </div>
                <span className="text-green-600 font-medium">R$ 38,50</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Lasanha Bolonhesa</p>
                  <p className="text-sm text-gray-600">Criado há 3 dias</p>
                </div>
                <span className="text-green-600 font-medium">R$ 22,30</span>
              </div>
            </div>
            <button className="fc-btn-primary w-full mt-4">
              Ver todas
            </button>
          </div>

          <div className="fc-card">
            <h3 className="text-lg font-semibold mb-4">Tendências de Custo</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Proteínas</span>
                  <span className="text-sm text-red-600">+12%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Vegetais</span>
                  <span className="text-sm text-green-600">-5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Laticínios</span>
                  <span className="text-sm text-yellow-600">+3%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
            <button className="fc-btn-secondary w-full mt-4">
              Detalhes
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

