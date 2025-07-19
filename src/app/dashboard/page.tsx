'use client'

import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { BarChart3, Package, FileText, Factory, ShoppingCart, AlertTriangle } from 'lucide-react'

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        // Fetch stats from APIs
        const [insumosRes, fichasRes, producoesRes, produtosRes] = await Promise.all([
          fetch('/api/insumos'),
          fetch('/api/fichas-tecnicas'),
          fetch('/api/producao'),
          fetch('/api/produtos')
        ])

        const [insumos, fichas, producoes, produtos] = await Promise.all([
          insumosRes.ok ? insumosRes.json() : [],
          fichasRes.ok ? fichasRes.json() : [],
          producoesRes.ok ? producoesRes.json() : [],
          produtosRes.ok ? produtosRes.json() : []
        ])

        setStats({
          insumos: Array.isArray(insumos) ? insumos.length : 0,
          fichasTecnicas: Array.isArray(fichas) ? fichas.length : 0,
          producoes: Array.isArray(producoes) ? producoes.length : 0,
          produtos: Array.isArray(produtos) ? produtos.length : 0
        })
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError('Erro ao carregar estatísticas')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do sistema FichaChef</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Insumos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.insumos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fichas Técnicas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.fichasTecnicas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Factory className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produções</p>
                <p className="text-2xl font-bold text-gray-900">{stats.producoes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.produtos}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <a
                href="/dashboard/insumos"
                className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Package className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Cadastrar Insumo</span>
              </a>
              <a
                href="/dashboard/fichas-tecnicas"
                className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FileText className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Nova Ficha Técnica</span>
              </a>
              <a
                href="/dashboard/producao"
                className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Factory className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Registrar Produção</span>
              </a>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status do Sistema</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-900">Sistema Online</span>
                </div>
                <span className="text-xs text-green-600 font-medium">Ativo</span>
              </div>
              
              {stats.insumos === 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-3" />
                    <span className="text-sm text-gray-900">Nenhum insumo cadastrado</span>
                  </div>
                  <span className="text-xs text-yellow-600 font-medium">Atenção</span>
                </div>
              )}
              
              {stats.fichasTecnicas === 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-3" />
                    <span className="text-sm text-gray-900">Nenhuma ficha técnica criada</span>
                  </div>
                  <span className="text-xs text-yellow-600 font-medium">Atenção</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo de Atividades</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Gráficos serão exibidos quando houver mais dados</p>
              <p className="text-xs text-gray-400 mt-1">
                Comece cadastrando insumos e criando fichas técnicas
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
