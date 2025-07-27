"use client"

import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { BarChart3, Package, FileText, Factory, ShoppingCart, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'

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
    let mounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Tentar carregar dados das APIs
        const [insumosRes, fichasRes, producoesRes, produtosRes] = await Promise.allSettled([
          fetch('/api/insumos', { credentials: 'include' }),
          fetch('/api/fichas-tecnicas', { credentials: 'include' }),
          fetch('/api/producao', { credentials: 'include' }),
          fetch('/api/produtos', { credentials: 'include' })
        ])

        if (!mounted) return

        // Processar resultados
        const insumos = insumosRes.status === 'fulfilled' && insumosRes.value.ok 
          ? await insumosRes.value.json() : []
        const fichas = fichasRes.status === 'fulfilled' && fichasRes.value.ok 
          ? await fichasRes.value.json() : []
        const producoes = producoesRes.status === 'fulfilled' && producoesRes.value.ok 
          ? await producoesRes.value.json() : []
        const produtos = produtosRes.status === 'fulfilled' && produtosRes.value.ok 
          ? await produtosRes.value.json() : []

        setStats({
          insumos: Array.isArray(insumos) ? insumos.length : 0,
          fichasTecnicas: Array.isArray(fichas) ? fichas.length : 0,
          producoes: Array.isArray(producoes) ? producoes.length : 0,
          produtos: Array.isArray(produtos) ? produtos.length : 0
        })

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
        if (mounted) {
          setError('Erro ao carregar dados')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Bem-vindo ao FichaChef - Sistema de Gestão Gastronômica Profissional
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="modern-grid modern-grid-4 animate-fade-in">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{stats.fichasTecnicas}</div>
                <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Fichas Técnicas</div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="stats-card blue">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{stats.insumos}</div>
                <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Insumos</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="stats-card green">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{stats.produtos}</div>
                <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Produtos</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="stats-card purple">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{stats.producoes}</div>
                <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Produções</div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Factory className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="animate-fade-in">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Ações Rápidas
          </h2>
          <div className="modern-grid modern-grid-3">
            <div className="modern-card text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nova Ficha Técnica</h3>
              <p className="text-gray-600 mb-4">Criar nova receita com cálculo automático de custos</p>
              <button className="modern-btn modern-btn-primary w-full">
                <FileText className="w-4 h-4" />
                Criar Ficha
              </button>
            </div>

            <div className="modern-card text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cadastrar Insumo</h3>
              <p className="text-gray-600 mb-4">Adicionar novo ingrediente ao sistema</p>
              <button className="modern-btn modern-btn-secondary w-full">
                <Package className="w-4 h-4" />
                Adicionar Insumo
              </button>
            </div>

            <div className="modern-card text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Relatórios</h3>
              <p className="text-gray-600 mb-4">Análise de custos e performance</p>
              <button className="modern-btn modern-btn-accent w-full">
                <BarChart3 className="w-4 h-4" />
                Ver Relatórios
              </button>
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="modern-grid modern-grid-2 animate-fade-in">
          <div className="modern-card">
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Atividade Recente
              </h3>
              <p className="text-sm text-gray-500">Últimas movimentações do sistema</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Nova ficha técnica criada</p>
                    <p className="text-sm text-gray-500">Há 2 horas</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Insumo atualizado</p>
                    <p className="text-sm text-gray-500">Há 4 horas</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Factory className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Produção finalizada</p>
                    <p className="text-sm text-gray-500">Ontem</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modern-card">
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Resumo Financeiro
              </h3>
              <p className="text-sm text-gray-500">Indicadores de custo e performance</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Custo médio por ficha</span>
                <span className="font-semibold text-green-600">R$ 12,50</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Economia este mês</span>
                <span className="font-semibold text-green-600">R$ 1.250,00</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fichas mais rentáveis</span>
                <span className="font-semibold text-blue-600">15 itens</span>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <button className="modern-btn modern-btn-secondary w-full">
                  <BarChart3 className="w-4 h-4" />
                  Ver Análise Completa
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="modern-card bg-red-50 border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

