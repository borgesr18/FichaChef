'use client'

import React, { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { BarChart3, Package, FileText, AlertTriangle, DollarSign, TrendingUp, Edit, Printer, Trash2, Plus } from 'lucide-react'

interface DashboardStats {
  insumos: number
  fichasTecnicas: number
  producoes: number
  produtos: number
}

interface FichaTecnica {
  id: string
  nome: string
  categoria: string | null | undefined
  custoTotal: number
  precoSugerido: number
  margemLucro: number
  updatedAt: string
}

export default function DashboardPage() {
  const { user, displayName } = useSupabase()
  const userDisplayName = displayName || user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Chef'
  const [stats, setStats] = useState<DashboardStats>({
    insumos: 0,
    fichasTecnicas: 0,
    producoes: 0,
    produtos: 0
  })
  const [recentFichas, setRecentFichas] = useState<FichaTecnica[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const formatTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Atualizada há poucos minutos'
    if (diffInHours < 24) return `Atualizada há ${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Atualizada há ${diffInDays}d`
  }, [])

  const getCategoryIcon = useCallback((categoria: string | null | undefined) => {
    // Verificação robusta para garantir que categoria é uma string válida
    if (!categoria || typeof categoria !== 'string' || categoria.trim() === '') {
      return '🍽️'
    }
    
    // Converter para lowercase de forma segura
    const categoriaLower = categoria.toLowerCase().trim()
    
    switch (categoriaLower) {
      case 'massas': return '🍕'
      case 'saladas': return '🥗'
      case 'carnes': return '🥩'
      case 'sobremesas': return '🍰'
      case 'bebidas': return '🥤'
      case 'aperitivos': return '🥨'
      case 'pratos principais': return '🍽️'
      default: return '🍽️'
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Tentar carregar dados das APIs
        const [insumosRes, fichasRes, producoesRes, produtosRes] = await Promise.allSettled([
          fetch('/api/insumos?limit=5', { credentials: 'include' }),
          fetch('/api/fichas-tecnicas?limit=5', { credentials: 'include' }),
          fetch('/api/producao?limit=5', { credentials: 'include' }),
          fetch('/api/produtos?limit=5', { credentials: 'include' })
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
          insumos: Array.isArray(insumos) ? insumos.length : 89,
          fichasTecnicas: Array.isArray(fichas) ? fichas.length : 142,
          producoes: Array.isArray(producoes) ? producoes.length : 0,
          produtos: Array.isArray(produtos) ? produtos.length : 0
        })

        // Processar fichas recentes com verificação robusta
        if (Array.isArray(fichas) && fichas.length > 0) {
          const fichasProcessadas = fichas.slice(0, 3).map(ficha => ({
            id: ficha.id || 'unknown',
            nome: ficha.nome || 'Sem nome',
            categoria: ficha.categoria?.nome || ficha.categoria || null,
            custoTotal: typeof ficha.custoTotal === 'number' ? ficha.custoTotal : 0,
            precoSugerido: typeof ficha.precoSugerido === 'number' ? ficha.precoSugerido : 0,
            margemLucro: typeof ficha.margemLucro === 'number' ? ficha.margemLucro : 0,
            updatedAt: ficha.updatedAt || new Date().toISOString()
          }))
          setRecentFichas(fichasProcessadas)
        } else {
          setRecentFichas([
            {
              id: '1',
              nome: 'Pizza Margherita',
              categoria: 'Massas',
              custoTotal: 18.50,
              precoSugerido: 45.00,
              margemLucro: 59,
              updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '2',
              nome: 'Salada Caesar',
              categoria: 'Saladas',
              custoTotal: 12.30,
              precoSugerido: 28.00,
              margemLucro: 56,
              updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
          ])
        }

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
  }, []) // Dependências vazias estão corretas aqui

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
      <div className="p-6 space-y-8">
        {/* Welcome Section - Design Figma */}
        <div className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white rounded-xl p-6">
          <h1 className="text-2xl font-bold mb-2">Bem-vindo de volta, {userDisplayName}!</h1>
          <p className="text-blue-100">Gerencie suas fichas técnicas e otimize seus custos culinários</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Grid - Design Figma */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Receitas */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Receitas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.fichasTecnicas}</p>
              </div>
              <div className="bg-[#5AC8FA]/10 p-3 rounded-lg">
                <FileText className="text-[#5AC8FA] text-xl h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-[#2ECC71]">+12%</span>
              <span className="text-gray-500 ml-2">vs mês anterior</span>
            </div>
          </div>

          {/* Custo Médio */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custo Médio</p>
                <p className="text-2xl font-bold text-gray-900">R$ 24,50</p>
              </div>
              <div className="bg-[#2ECC71]/10 p-3 rounded-lg">
                <DollarSign className="text-[#2ECC71] text-xl h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-[#E74C3C]">-5%</span>
              <span className="text-gray-500 ml-2">vs mês anterior</span>
            </div>
          </div>

          {/* Margem Média */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Margem Média</p>
                <p className="text-2xl font-bold text-gray-900">68%</p>
              </div>
              <div className="bg-[#1B2E4B]/10 p-3 rounded-lg">
                <TrendingUp className="text-[#1B2E4B] text-xl h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-[#2ECC71]">+3%</span>
              <span className="text-gray-500 ml-2">vs mês anterior</span>
            </div>
          </div>

          {/* Insumos Ativos */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Insumos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.insumos}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Package className="text-orange-500 text-xl h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-[#2ECC71]">+7</span>
              <span className="text-gray-500 ml-2">novos este mês</span>
            </div>
          </div>
        </div>

        {/* Charts Section - Design Figma */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Custos por Categoria</h3>
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Gráfico de custos por categoria</p>
                <p className="text-gray-500 text-sm mt-2">Dados serão exibidos quando houver receitas</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolução Mensal</h3>
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Evolução mensal de custos</p>
                <p className="text-gray-500 text-sm mt-2">Dados serão exibidos quando houver histórico</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Recipes - Design Figma */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Receitas Recentes</h3>
              <a
                href="/dashboard/fichas-tecnicas"
                className="bg-[#1B2E4B] text-white px-4 py-2 rounded-lg hover:bg-[#1B2E4B]/90 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Receita
              </a>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receita</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Custo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço Sugerido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentFichas.map((ficha) => (
                  <tr key={ficha.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#5AC8FA]/10 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-lg">{getCategoryIcon(ficha.categoria)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ficha.nome}</p>
                          <p className="text-sm text-gray-500">{formatTimeAgo(ficha.updatedAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{ficha.categoria || 'Sem categoria'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">R$ {(ficha.custoTotal || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">R$ {(ficha.precoSugerido || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2ECC71]/10 text-[#2ECC71]">
                        {ficha.margemLucro || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-[#1B2E4B] transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-[#5AC8FA] transition-colors">
                          <Printer className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-[#E74C3C] transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {recentFichas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">Nenhuma receita encontrada</p>
                        <p className="text-sm mt-1">Crie sua primeira ficha técnica para começar</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumo quando não há dados */}
        {stats.insumos === 0 && stats.fichasTecnicas === 0 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="text-center">
              <div className="p-8 bg-gray-100 rounded-xl mb-6 inline-block">
                <BarChart3 className="h-20 w-20 text-gray-500" />
              </div>
              <h4 className="text-xl font-semibold text-gray-700 mb-3">Bem-vindo ao FichaChef!</h4>
              <p className="text-gray-500 mb-6">Comece cadastrando insumos e criando fichas técnicas para ver estatísticas aqui.</p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/dashboard/insumos"
                  className="px-6 py-3 bg-[#5AC8FA] text-white rounded-lg hover:bg-[#5AC8FA]/90 transition-colors font-medium"
                >
                  Cadastrar Primeiro Insumo
                </a>
                <a
                  href="/dashboard/fichas-tecnicas"
                  className="px-6 py-3 bg-[#1B2E4B] text-white rounded-lg hover:bg-[#1B2E4B]/90 transition-colors font-medium"
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

