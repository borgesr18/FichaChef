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
        {/* Header Moderno */}
        <div className="fc-animate-fade-in-up">
          <h1 className="fc-text-4xl fc-font-bold fc-gradient-text fc-mb-2">
            Dashboard
          </h1>
          <p className="fc-text-lg text-gray-600">
            Bem-vindo ao FichaChef - Sistema de Gestão Gastronômica Profissional
          </p>
        </div>

        {/* Cards de Estatísticas Modernos */}
        <div className="fc-grid fc-grid-4 fc-animate-fade-in-scale">
          <div className="fc-stats-card">
            <div className="fc-flex fc-items-center fc-justify-between">
              <div>
                <div className="fc-stats-number">{stats.fichasTecnicas}</div>
                <div className="fc-stats-label">Fichas Técnicas</div>
              </div>
              <div className="fc-stats-icon">
                <FileText className="w-10 h-10 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="fc-stats-card secondary">
            <div className="fc-flex fc-items-center fc-justify-between">
              <div>
                <div className="fc-stats-number">{stats.insumos}</div>
                <div className="fc-stats-label">Insumos</div>
              </div>
              <div className="fc-stats-icon">
                <Package className="w-10 h-10 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="fc-stats-card accent">
            <div className="fc-flex fc-items-center fc-justify-between">
              <div>
                <div className="fc-stats-number">{stats.produtos}</div>
                <div className="fc-stats-label">Produtos</div>
              </div>
              <div className="fc-stats-icon">
                <ShoppingCart className="w-10 h-10 text-green-500" />
              </div>
            </div>
          </div>

          <div className="fc-stats-card">
            <div className="fc-flex fc-items-center fc-justify-between">
              <div>
                <div className="fc-stats-number">{stats.producoes}</div>
                <div className="fc-stats-label">Produções</div>
              </div>
              <div className="fc-stats-icon">
                <Factory className="w-10 h-10 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Ações Rápidas */}
        <div className="fc-animate-fade-in-up">
          <h2 className="fc-text-2xl fc-font-semibold fc-mb-6 text-gray-800">
            Ações Rápidas
          </h2>
          <div className="fc-grid fc-grid-3">
            <div className="fc-card fc-text-center">
              <div className="fc-mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-full fc-flex fc-items-center fc-justify-center fc-mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="fc-text-xl fc-font-semibold fc-mb-2">Nova Ficha Técnica</h3>
                <p className="text-gray-600 fc-mb-4">Criar nova receita com cálculo automático de custos</p>
              </div>
              <button className="fc-btn fc-btn-primary fc-w-full">
                <FileText className="w-4 h-4" />
                Criar Ficha
              </button>
            </div>

            <div className="fc-card fc-text-center">
              <div className="fc-mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full fc-flex fc-items-center fc-justify-center fc-mb-4">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="fc-text-xl fc-font-semibold fc-mb-2">Cadastrar Insumo</h3>
                <p className="text-gray-600 fc-mb-4">Adicionar novo ingrediente ao sistema</p>
              </div>
              <button className="fc-btn fc-btn-secondary fc-w-full">
                <Package className="w-4 h-4" />
                Adicionar Insumo
              </button>
            </div>

            <div className="fc-card fc-text-center">
              <div className="fc-mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full fc-flex fc-items-center fc-justify-center fc-mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="fc-text-xl fc-font-semibold fc-mb-2">Relatórios</h3>
                <p className="text-gray-600 fc-mb-4">Análise de custos e performance</p>
              </div>
              <button className="fc-btn fc-btn-accent fc-w-full">
                <BarChart3 className="w-4 h-4" />
                Ver Relatórios
              </button>
            </div>
          </div>
        </div>

        {/* Seção de Informações Adicionais */}
        <div className="fc-grid fc-grid-2 fc-animate-fade-in-up">
          <div className="fc-card">
            <div className="fc-card-header">
              <h3 className="fc-card-title fc-flex fc-items-center fc-gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Atividade Recente
              </h3>
              <p className="fc-card-subtitle">Últimas movimentações do sistema</p>
            </div>
            <div className="space-y-4">
              <div className="fc-flex fc-items-center fc-justify-between p-3 bg-gray-50 fc-rounded-lg">
                <div className="fc-flex fc-items-center fc-gap-3">
                  <div className="w-8 h-8 bg-orange-100 fc-rounded-full fc-flex fc-items-center fc-justify-center">
                    <FileText className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="fc-font-medium">Nova ficha técnica criada</p>
                    <p className="fc-text-sm text-gray-500">Há 2 horas</p>
                  </div>
                </div>
              </div>
              
              <div className="fc-flex fc-items-center fc-justify-between p-3 bg-gray-50 fc-rounded-lg">
                <div className="fc-flex fc-items-center fc-gap-3">
                  <div className="w-8 h-8 bg-blue-100 fc-rounded-full fc-flex fc-items-center fc-justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="fc-font-medium">Insumo atualizado</p>
                    <p className="fc-text-sm text-gray-500">Há 4 horas</p>
                  </div>
                </div>
              </div>
              
              <div className="fc-flex fc-items-center fc-justify-between p-3 bg-gray-50 fc-rounded-lg">
                <div className="fc-flex fc-items-center fc-gap-3">
                  <div className="w-8 h-8 bg-green-100 fc-rounded-full fc-flex fc-items-center fc-justify-center">
                    <Factory className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="fc-font-medium">Produção finalizada</p>
                    <p className="fc-text-sm text-gray-500">Ontem</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fc-card">
            <div className="fc-card-header">
              <h3 className="fc-card-title fc-flex fc-items-center fc-gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Resumo Financeiro
              </h3>
              <p className="fc-card-subtitle">Indicadores de custo e performance</p>
            </div>
            <div className="space-y-4">
              <div className="fc-flex fc-items-center fc-justify-between">
                <span className="text-gray-600">Custo médio por ficha</span>
                <span className="fc-font-semibold text-green-600">R$ 12,50</span>
              </div>
              
              <div className="fc-flex fc-items-center fc-justify-between">
                <span className="text-gray-600">Economia este mês</span>
                <span className="fc-font-semibold text-green-600">R$ 1.250,00</span>
              </div>
              
              <div className="fc-flex fc-items-center fc-justify-between">
                <span className="text-gray-600">Fichas mais rentáveis</span>
                <span className="fc-font-semibold text-blue-600">15 itens</span>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <button className="fc-btn fc-btn-outline fc-w-full">
                  <BarChart3 className="w-4 h-4" />
                  Ver Análise Completa
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="fc-card bg-red-50 border-red-200">
            <div className="fc-flex fc-items-center fc-gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

