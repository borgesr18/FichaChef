'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import ModernTable from '@/components/ui/ModernTable'
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
    dataInicio: '',
    dataFim: '',
    periodo: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    mesesProjecao: 6
  })

  useEffect(() => {
    const now = new Date()
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    const dataInicio = oneYearAgo.toISOString().split('T')[0] as string
    const dataFim = now.toISOString().split('T')[0] as string
    setFilters(prev => ({
      ...prev,
      dataInicio,
      dataFim
    }))
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
            <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mr-3 transform transition-transform duration-200 hover:scale-110">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Análise Temporal de Custos</h1>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros de Análise</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <FloatingLabelSelect
              label="Insumo (Opcional)"
              value={filters.insumoId}
              onChange={(value) => setFilters({ ...filters, insumoId: value })}
              options={[
                { value: '', label: 'Todos os insumos' },
                ...insumos.map(insumo => ({
                  value: insumo.id,
                  label: `${insumo.nome}${insumo._count ? ` (${insumo._count.fornecedorPrecos} preços)` : ''}`
                }))
              ]}
            />

            <FloatingLabelSelect
              label="Fornecedor (Opcional)"
              value={filters.fornecedorId}
              onChange={(value) => setFilters({ ...filters, fornecedorId: value })}
              options={[
                { value: '', label: 'Todos os fornecedores' },
                ...fornecedores.map(fornecedor => ({
                  value: fornecedor.id,
                  label: `${fornecedor.nome}${fornecedor._count ? ` (${fornecedor._count.precos} preços)` : ''}`
                }))
              ]}
            />

            <FloatingLabelInput
              label="Data Início"
              type="date"
              value={filters.dataInicio || ''}
              onChange={(value) => setFilters({ ...filters, dataInicio: value || '' })}
            />

            <FloatingLabelInput
              label="Data Fim"
              type="date"
              value={filters.dataFim || ''}
              onChange={(value) => setFilters({ ...filters, dataFim: value || '' })}
            />

            <FloatingLabelSelect
              label="Período de Agrupamento"
              value={filters.periodo}
              onChange={(value) => setFilters({ ...filters, periodo: value as 'monthly' | 'quarterly' | 'yearly' })}
              options={[
                { value: 'monthly', label: 'Mensal' },
                { value: 'quarterly', label: 'Trimestral' },
                { value: 'yearly', label: 'Anual' }
              ]}
            />

            <FloatingLabelInput
              label="Meses de Projeção"
              type="number"
              min="1"
              max="24"
              value={filters.mesesProjecao.toString()}
              onChange={(value) => setFilters({ ...filters, mesesProjecao: parseInt(value) || 6 })}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
          >
            <BarChart3 className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:rotate-12" />
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
              <div key={analysis.insumo.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300">
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
                              {typeof window !== 'undefined' ? new Date(projection.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : projection.date}:
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
                      <ModernTable
                        columns={[
                          { key: 'period', label: 'Período', sortable: true },
                          { key: 'averagePrice', label: 'Preço Médio', sortable: true,
                            render: (value) => formatCurrency(value as number) },
                          { key: 'minPrice', label: 'Menor Preço', sortable: true,
                            render: (value) => formatCurrency(value as number) },
                          { key: 'maxPrice', label: 'Maior Preço', sortable: true,
                            render: (value) => formatCurrency(value as number) },
                          { key: 'priceCount', label: 'Registros', sortable: true }
                        ]}
                        data={analysis.groupedData}
                        searchable={false}
                        pagination={true}
                        pageSize={10}
                        loading={false}
                      />
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
