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
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Insumos</p>
                <p className="text-3xl font-bold mt-1">{stats.insumos}</p>
                <p className="text-blue-100 text-sm mt-1">Total cadastrado</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Card Fichas Técnicas */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Fichas Técnicas</p>
                <p className="text-3xl font-bold mt-1">{stats.fichasTecnicas}</p>
                <p className="text-emerald-100 text-sm mt-1">Receitas criadas</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Card Produções */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Produções</p>
                <p className="text-3xl font-bold mt-1">{stats.producoes}</p>
                <p className="text-purple-100 text-sm mt-1">Registros</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Factory className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Card Produtos */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Produtos</p>
                <p className="text-3xl font-bold mt-1">{stats.produtos}</p>
                <p className="text-orange-100 text-sm mt-1">Produtos finais</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-1 h-8 bg-orange-500 rounded-full mr-4"></div>
              Ações Rápidas
            </h3>
            <div className="space-y-4">
              <a
                href="/dashboard/insumos"
                className="flex items-center p-5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300 hover:shadow-md border border-blue-200"
              >
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-lg font-semibold text-slate-800">Cadastrar Insumo</span>
                  <p className="text-sm text-slate-600">Adicionar novos ingredientes</p>
                </div>
              </a>
              
              <a
                href="/dashboard/fichas-tecnicas"
                className="flex items-center p-5 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all duration-300 hover:shadow-md border border-emerald-200"
              >
                <div className="p-3 bg-emerald-500 rounded-xl shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-lg font-semibold text-slate-800">Nova Ficha Técnica</span>
                  <p className="text-sm text-slate-600">Criar receitas padronizadas</p>
                </div>
              </a>
              
              <a
                href="/dashboard/producao"
                className="flex items-center p-5 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-300 hover:shadow-md border border-purple-200"
              >
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
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
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-1 h-8 bg-emerald-500 rounded-full mr-4"></div>
              Status do Sistema
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-emerald-50 rounded-xl border border-emerald-200">
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
                <div className="flex items-center justify-between p-5 bg-amber-50 rounded-xl border border-amber-200">
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
                <div className="flex items-center justify-between p-5 bg-amber-50 rounded-xl border border-amber-200">
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
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <div className="text-center">
              <div className="p-8 bg-slate-100 rounded-2xl mb-6 inline-block">
                <BarChart3 className="h-20 w-20 text-slate-500" />
              </div>
              <h4 className="text-xl font-semibold text-slate-700 mb-3">Bem-vindo ao FichaChef!</h4>
              <p className="text-slate-500 mb-6">Comece cadastrando insumos e criando fichas técnicas para ver estatísticas aqui.</p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/dashboard/insumos"
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
                >
                  Cadastrar Primeiro Insumo
                </a>
                <a
                  href="/dashboard/fichas-tecnicas"
                  className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
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

