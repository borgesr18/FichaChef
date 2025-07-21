'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { TrendingUp, TrendingDown, BarChart3, Calendar, AlertTriangle, Target, Activity } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Insumo {
  id: string
  nome: string
  _count?: { fornecedorPrecos: number }
}

interface Fornecedor {
  id: string
  nome: string
  _count?: { precos: number }
}

interface PricePoint {
  date: string
  price: number
  fornecedor: { nome: string }
}

interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable'
  slope: number
  correlation: number
  averageMonthlyChange: number
  volatility: number
}

interface CostProjection {
  date: string
  projectedPrice: number
  confidence: number
}

interface VolatilityAnalysis {
  volatility: number
  riskLevel: 'low' | 'medium' | 'high'
}

interface InsumoAnalysis {
  insumo: { id: string; nome: string }
  priceHistory: PricePoint[]
  trendAnalysis: TrendAnalysis
  projections: CostProjection[]
  groupedData: Array<{
    period: string
    averagePrice: number
    priceCount: number
    minPrice: number
    maxPrice: number
  }>
  volatilityAnalysis: VolatilityAnalysis
  statistics: {
    totalPricePoints: number
    priceRange: { min: number; max: number }
    averagePrice: number
    latestPrice: number
  }
}

export default function AnaliseTemporalPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [analysisResults, setAnalysisResults] = useState<InsumoAnalysis[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({
    insumoId: '',
    fornecedorId: '',
    dataInicio: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    periodo: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    mesesProjecao: 6
  })

  useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/analise-temporal')
      if (response.ok) {
        const data = await response.json()
        setInsumos(data.insumos || [])
        setFornecedores(data.fornecedores || [])
      }
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/analise-temporal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysisResults(result.data || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao realizar análise')
      }
    } catch {
      setError('Erro ao realizar análise')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-5 w-5 text-red-600" />
      case 'decreasing':
        return <TrendingDown className="h-5 w-5 text-green-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-600 bg-red-50'
      case 'decreasing':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-green-600 bg-green-50'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Análise Temporal de Custos</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros de Análise</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insumo (Opcional)
              </label>
              <select
                value={filters.insumoId}
                onChange={(e) => setFilters({ ...filters, insumoId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os insumos</option>
                {insumos.map((insumo) => (
                  <option key={insumo.id} value={insumo.id}>
                    {insumo.nome} {insumo._count && `(${insumo._count.fornecedorPrecos} preços)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fornecedor (Opcional)
              </label>
              <select
                value={filters.fornecedorId}
                onChange={(e) => setFilters({ ...filters, fornecedorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os fornecedores</option>
                {fornecedores.map((fornecedor) => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome} {fornecedor._count && `(${fornecedor._count.precos} preços)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={filters.dataFim}
                onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período de Agrupamento
              </label>
              <select
                value={filters.periodo}
                onChange={(e) => setFilters({ ...filters, periodo: e.target.value as 'monthly' | 'quarterly' | 'yearly' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meses de Projeção
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={filters.mesesProjecao}
                onChange={(e) => setFilters({ ...filters, mesesProjecao: parseInt(e.target.value) || 6 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {loading ? 'Analisando...' : 'Realizar Análise'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {analysisResults.length > 0 && (
          <div className="space-y-6">
            {analysisResults.map((analysis) => (
              <div key={analysis.insumo.id} className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    {analysis.insumo.nome}
                  </h3>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Tendência</p>
                          <p className={`text-lg font-bold ${getTrendColor(analysis.trendAnalysis.trend).split(' ')[0]}`}>
                            {analysis.trendAnalysis.trend === 'increasing' ? 'Crescente' :
                             analysis.trendAnalysis.trend === 'decreasing' ? 'Decrescente' : 'Estável'}
                          </p>
                        </div>
                        {getTrendIcon(analysis.trendAnalysis.trend)}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Variação Mensal</p>
                          <p className={`text-lg font-bold ${
                            analysis.trendAnalysis.averageMonthlyChange > 0 ? 'text-red-600' : 
                            analysis.trendAnalysis.averageMonthlyChange < 0 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {analysis.trendAnalysis.averageMonthlyChange > 0 ? '+' : ''}
                            {formatCurrency(analysis.trendAnalysis.averageMonthlyChange)}
                          </p>
                        </div>
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Volatilidade</p>
                          <p className={`text-lg font-bold ${getRiskColor(analysis.volatilityAnalysis.riskLevel).split(' ')[0]}`}>
                            {analysis.volatilityAnalysis.riskLevel === 'high' ? 'Alta' :
                             analysis.volatilityAnalysis.riskLevel === 'medium' ? 'Média' : 'Baixa'}
                          </p>
                        </div>
                        <AlertTriangle className={`h-5 w-5 ${
                          analysis.volatilityAnalysis.riskLevel === 'high' ? 'text-red-500' :
                          analysis.volatilityAnalysis.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                        }`} />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Preço Atual</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(analysis.statistics.latestPrice)}
                          </p>
                        </div>
                        <Activity className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Estatísticas do Período</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pontos de Preço:</span>
                          <span className="font-medium">{analysis.statistics.totalPricePoints}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Preço Médio:</span>
                          <span className="font-medium">{formatCurrency(analysis.statistics.averagePrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Menor Preço:</span>
                          <span className="font-medium">{formatCurrency(analysis.statistics.priceRange.min)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Maior Preço:</span>
                          <span className="font-medium">{formatCurrency(analysis.statistics.priceRange.max)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Correlação:</span>
                          <span className="font-medium">{(analysis.trendAnalysis.correlation * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Projeções Futuras</h4>
                      <div className="space-y-2 text-sm">
                        {analysis.projections.slice(0, 3).map((projection, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-600">
                              {new Date(projection.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}:
                            </span>
                            <span className="font-medium">
                              {formatCurrency(projection.projectedPrice)}
                              <span className="text-xs text-gray-500 ml-1">
                                ({(projection.confidence * 100).toFixed(0)}%)
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {analysis.groupedData.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Dados Agrupados por Período</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Período
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Preço Médio
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Menor Preço
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Maior Preço
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Registros
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {analysis.groupedData.map((group, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {group.period}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatCurrency(group.averagePrice)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatCurrency(group.minPrice)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatCurrency(group.maxPrice)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {group.priceCount}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && analysisResults.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma análise realizada</h3>
            <p className="text-gray-500">
              Configure os filtros acima e clique em &quot;Realizar Análise&quot; para visualizar as tendências de custos.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
