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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in-up">
          {/* Card Insumos */}
          <div className="group relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 rounded-2xl shadow-lg text-white hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Insumos</p>
                <p className="text-4xl font-bold mt-2 text-shadow">{stats.insumos}</p>
                <p className="text-blue-100 text-sm mt-2 font-medium">Total cadastrado</p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Package className="h-8 w-8" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/5 rounded-full"></div>
          </div>

          {/* Card Fichas Técnicas */}
          <div className="group relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 rounded-2xl shadow-lg text-white hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Fichas Técnicas</p>
                <p className="text-4xl font-bold mt-2 text-shadow">{stats.fichasTecnicas}</p>
                <p className="text-emerald-100 text-sm mt-2 font-medium">Receitas criadas</p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-8 w-8" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/5 rounded-full"></div>
          </div>

          {/* Card Produções */}
          <div className="group relative bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-semibold uppercase tracking-wider">Produções</p>
                <p className="text-4xl font-bold mt-2 text-shadow">{stats.producoes}</p>
                <p className="text-purple-100 text-sm mt-2 font-medium">Registros</p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Factory className="h-8 w-8" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/5 rounded-full"></div>
          </div>

          {/* Card Produtos */}
          <div className="group relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6 rounded-2xl shadow-lg text-white hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-semibold uppercase tracking-wider">Produtos</p>
                <p className="text-4xl font-bold mt-2 text-shadow">{stats.produtos}</p>
                <p className="text-orange-100 text-sm mt-2 font-medium">Produtos finais</p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-8 w-8" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/5 rounded-full"></div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-modern hover-lift animate-fade-in">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-1.5 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full mr-4"></div>
              Ações Rápidas
            </h3>
            <div className="space-y-4">
              <a
                href="/dashboard/insumos"
                className="group flex items-center p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:shadow-lg border border-blue-200 hover:scale-[1.02]"
              >
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-lg font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">Cadastrar Insumo</span>
                  <p className="text-sm text-slate-600 group-hover:text-blue-600 transition-colors">Adicionar novos ingredientes</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </a>
              
              <a
                href="/dashboard/fichas-tecnicas"
                className="group flex items-center p-5 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl hover:from-emerald-100 hover:to-emerald-200 transition-all duration-300 hover:shadow-lg border border-emerald-200 hover:scale-[1.02]"
              >
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-lg font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">Nova Ficha Técnica</span>
                  <p className="text-sm text-slate-600 group-hover:text-emerald-600 transition-colors">Criar receitas padronizadas</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              </a>
              
              <a
                href="/dashboard/producao"
                className="group flex items-center p-5 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 hover:shadow-lg border border-purple-200 hover:scale-[1.02]"
              >
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Factory className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-lg font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">Registrar Produção</span>
                  <p className="text-sm text-slate-600 group-hover:text-purple-600 transition-colors">Controlar produção diária</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </a>
            </div>
          </div>

          {/* Status do Sistema */}
          <div className="card-modern hover-lift animate-fade-in">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full mr-4"></div>
              Status do Sistema
            </h3>
            <div className="space-y-4">
              <div className="group flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-emerald-500 rounded-full mr-3 animate-pulse-soft shadow-lg"></div>
                  <div>
                    <span className="text-lg font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">Sistema Online</span>
                    <p className="text-sm text-emerald-700 group-hover:text-emerald-600 transition-colors">Funcionando normalmente</p>
                  </div>
                </div>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-200 px-3 py-2 rounded-full shadow-sm group-hover:shadow-md transition-shadow">Ativo</span>
              </div>
              
              {stats.insumos === 0 && (
                <div className="group flex items-center justify-between p-5 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <span className="text-lg font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">Nenhum insumo cadastrado</span>
                      <p className="text-sm text-amber-700 group-hover:text-amber-600 transition-colors">Comece cadastrando ingredientes</p>
                    </div>
                  </div>
                  <span className="text-xs text-amber-700 font-bold bg-amber-200 px-3 py-2 rounded-full shadow-sm group-hover:shadow-md transition-shadow">Atenção</span>
                </div>
              )}
              
              {stats.fichasTecnicas === 0 && (
                <div className="group flex items-center justify-between p-5 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <span className="text-lg font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">Nenhuma ficha técnica criada</span>
                      <p className="text-sm text-amber-700 group-hover:text-amber-600 transition-colors">Crie receitas padronizadas</p>
                    </div>
                  </div>
                  <span className="text-xs text-amber-700 font-bold bg-amber-200 px-3 py-2 rounded-full shadow-sm group-hover:shadow-md transition-shadow">Atenção</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumo quando não há dados */}
        {stats.insumos === 0 && stats.fichasTecnicas === 0 && stats.producoes === 0 && stats.produtos === 0 && (
          <div className="card-modern text-center hover-lift animate-fade-in">
            <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl mb-6 inline-block shadow-inner">
              <BarChart3 className="h-24 w-24 text-slate-400 mx-auto animate-pulse-soft" />
            </div>
            <h4 className="text-2xl font-bold gradient-text mb-4">Bem-vindo ao FichaChef!</h4>
            <p className="text-slate-500 mb-8 text-lg">Comece cadastrando insumos e criando fichas técnicas para ver estatísticas aqui.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/dashboard/insumos"
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center"
              >
                <Package className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Cadastrar Primeiro Insumo
              </a>
              <a
                href="/dashboard/fichas-tecnicas"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center"
              >
                <FileText className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Criar Primeira Ficha
              </a>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

