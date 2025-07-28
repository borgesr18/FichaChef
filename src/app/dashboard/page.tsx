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

      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        if (mounted) {
          setError('Erro ao carregar dados do dashboard')
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Dashboard FichaChef
          </h1>
          <p className="text-slate-600 mt-2 text-lg">Visão geral do sistema</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card Insumos */}
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 rounded-2xl shadow-floating text-white hover:shadow-glow-blue transition-all duration-300 hover:scale-[1.02] card-modern animate-slide-in-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Insumos</p>
                <p className="text-3xl font-bold mt-1 animate-float">{stats.insumos}</p>
                <p className="text-blue-100 text-sm mt-1">Total cadastrado</p>
              </div>
              <div className="p-3 glass-morphism rounded-xl shadow-elegant">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Card Fichas Técnicas */}
          <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 rounded-2xl shadow-floating text-white hover:shadow-glow-blue transition-all duration-300 hover:scale-[1.02] card-modern animate-slide-in-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Fichas Técnicas</p>
                <p className="text-3xl font-bold mt-1 animate-float">{stats.fichasTecnicas}</p>
                <p className="text-emerald-100 text-sm mt-1">Receitas criadas</p>
              </div>
              <div className="p-3 glass-morphism rounded-xl shadow-elegant">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Card Produções */}
          <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 rounded-2xl shadow-floating text-white hover:shadow-glow-blue transition-all duration-300 hover:scale-[1.02] card-modern animate-slide-in-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Produções</p>
                <p className="text-3xl font-bold mt-1 animate-float">{stats.producoes}</p>
                <p className="text-purple-100 text-sm mt-1">Registros</p>
              </div>
              <div className="p-3 glass-morphism rounded-xl shadow-elegant">
                <Factory className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Card Produtos */}
          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6 rounded-2xl shadow-floating text-white hover:shadow-glow-orange transition-all duration-300 hover:scale-[1.02] card-modern animate-slide-in-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Produtos</p>
                <p className="text-3xl font-bold mt-1 animate-float">{stats.produtos}</p>
                <p className="text-orange-100 text-sm mt-1">Produtos finais</p>
              </div>
              <div className="p-3 glass-morphism rounded-xl shadow-elegant">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-morphism p-8 rounded-2xl shadow-floating border border-white/20 card-modern">
            <h3 className="text-2xl font-bold text-gradient-elegant mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full mr-4 shadow-glow-orange"></div>
              Ações Rápidas
            </h3>
            <div className="space-y-4">
              <a
                href="/dashboard/insumos"
                className="flex items-center p-5 glass-morphism rounded-xl hover:shadow-elegant transition-all duration-300 border border-blue-200/50 btn-modern"
              >
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-elegant">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-lg font-semibold text-slate-800">Cadastrar Insumo</span>
                  <p className="text-sm text-slate-600">Adicionar novos ingredientes</p>
                </div>
              </a>
              
              <a
                href="/dashboard/fichas-tecnicas"
                className="flex items-center p-5 glass-morphism rounded-xl hover:shadow-elegant transition-all duration-300 border border-emerald-200/50 btn-modern"
              >
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-elegant">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-lg font-semibold text-slate-800">Nova Ficha Técnica</span>
                  <p className="text-sm text-slate-600">Criar receitas padronizadas</p>
                </div>
              </a>
              
              <a
                href="/dashboard/producao"
                className="flex items-center p-5 glass-morphism rounded-xl hover:shadow-elegant transition-all duration-300 border border-purple-200/50 btn-modern"
              >
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-elegant">
                  <Factory className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-lg font-semibold text-slate-800">Registrar Produção</span>
                  <p className="text-sm text-slate-600">Controlar produção diária</p>
                </div>
              </a>
            </div>
          </div>

          {/* Status do Sistema */}
          <div className="glass-morphism p-8 rounded-2xl shadow-floating border border-white/20 card-modern">
            <h3 className="text-2xl font-bold text-gradient-elegant mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full mr-4 shadow-glow-blue"></div>
              Status do Sistema
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 glass-morphism rounded-xl border border-emerald-200/50 shadow-elegant">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                  <div>
                    <span className="text-lg font-semibold text-slate-800">Sistema Online</span>
                    <p className="text-sm text-emerald-700">Funcionando normalmente</p>
                  </div>
                </div>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-200 px-3 py-2 rounded-full">Ativo</span>
              </div>
              
              {stats.insumos === 0 && (
                <div className="flex items-center justify-between p-5 glass-morphism rounded-xl border border-amber-200/50 shadow-elegant">
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
                <div className="flex items-center justify-between p-5 glass-morphism rounded-xl border border-amber-200/50 shadow-elegant">
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

        {/* Resumo quando não há dados */}
        {stats.insumos === 0 && stats.fichasTecnicas === 0 && stats.producoes === 0 && stats.produtos === 0 && (
          <div className="glass-morphism p-8 rounded-2xl shadow-floating border border-white/20 card-modern">
            <div className="text-center">
              <div className="p-8 glass-morphism rounded-2xl mb-6 inline-block shadow-elegant">
                <BarChart3 className="h-20 w-20 text-slate-500" />
              </div>
              <h4 className="text-xl font-semibold text-slate-700 mb-3">Bem-vindo ao FichaChef!</h4>
              <p className="text-slate-500 mb-6">Comece cadastrando insumos e criando fichas técnicas para ver estatísticas aqui.</p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/dashboard/insumos"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium btn-modern shadow-elegant"
                >
                  Cadastrar Primeiro Insumo
                </a>
                <a
                  href="/dashboard/fichas-tecnicas"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-medium btn-modern shadow-elegant"
                >
                  Criar Primeira Ficha
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

