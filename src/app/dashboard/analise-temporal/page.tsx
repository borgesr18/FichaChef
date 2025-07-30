'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { TrendingUp, TrendingDown, BarChart3, Calendar, AlertTriangle, Target, Activity, Search } from 'lucide-react'
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

const FloatingLabelInput = ({ label, value, onChange, type = "text", required = false, className = "" }: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  className?: string
}) => {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  const isDateInput = type === "date"
  
  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className="peer w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
      />
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
        focused || hasValue || isDateInput
          ? 'top-1 text-xs text-[#5AC8FA] font-medium' 
          : 'top-3 text-gray-500'
      }`}>
        {label}
      </label>
    </div>
  )
}

const FloatingLabelSelect = ({ label, value, onChange, options, required = false, className = "" }: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  className?: string
}) => {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className="peer w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200 appearance-none"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
        focused || hasValue 
          ? 'top-1 text-xs text-[#5AC8FA] font-medium' 
          : 'top-3 text-gray-500'
      }`}>
        {label}
      </label>
    </div>
  )
}

export default function AnaliseTemporalPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [analysisResults, setAnalysisResults] = useState<InsumoAnalysis[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

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

  // Calcular estatísticas
  const stats = {
    totalAnalises: analysisResults.length,
    tendenciaAlta: analysisResults.filter(a => a.trendAnalysis.trend === 'increasing').length,
    tendenciaBaixa: analysisResults.filter(a => a.trendAnalysis.trend === 'decreasing').length,
    tendenciaEstavel: analysisResults.filter(a => a.trendAnalysis.trend === 'stable').length
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent">
              Análise Temporal
            </h1>
            <p className="text-gray-600 mt-1">Análises históricas e tendências de custos</p>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total de Análises</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAnalises}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <BarChart3 className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Tendência Alta</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tendenciaAlta}</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Tendência Baixa</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tendenciaBaixa}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl">
                <TrendingDown className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Tendência Estável</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tendenciaEstavel}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <Activity className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-[#1B2E4B] to-[#5AC8FA] rounded-full"></div>
            <h2 className="text-2xl font-semibold text-gray-900">Filtros de Análise</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <FloatingLabelSelect
              label="Insumo"
              value={filters.insumoId}
              onChange={(value: string) => setFilters(prev => ({ ...prev, insumoId: value }))}
              options={[
                { value: '', label: 'Todos os insumos' },
                ...insumos.map(insumo => ({ value: insumo.id, label: insumo.nome }))
              ]}
            />

            <FloatingLabelSelect
              label="Fornecedor"
              value={filters.fornecedorId}
              onChange={(value: string) => setFilters(prev => ({ ...prev, fornecedorId: value }))}
              options={[
                { value: '', label: 'Todos os fornecedores' },
                ...fornecedores.map(fornecedor => ({ value: fornecedor.id, label: fornecedor.nome }))
              ]}
            />

            <FloatingLabelSelect
              label="Período de Agrupamento"
              value={filters.periodo}
              onChange={(value: string) => setFilters(prev => ({ ...prev, periodo: value as 'monthly' | 'quarterly' | 'yearly' }))}
              options={[
                { value: 'monthly', label: 'Mensal' },
                { value: 'quarterly', label: 'Trimestral' },
                { value: 'yearly', label: 'Anual' }
              ]}
            />

            <FloatingLabelInput
              label="Data Início"
              type="date"
              value={filters.dataInicio}
              onChange={(value: string) => setFilters(prev => ({ ...prev, dataInicio: value }))}
            />

            <FloatingLabelInput
              label="Data Fim"
              type="date"
              value={filters.dataFim}
              onChange={(value: string) => setFilters(prev => ({ ...prev, dataFim: value }))}
            />

            <FloatingLabelInput
              label="Meses de Projeção"
              type="number"
              value={filters.mesesProjecao.toString()}
              onChange={(value: string) => setFilters(prev => ({ ...prev, mesesProjecao: parseInt(value) || 6 }))}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Target className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Analisando...' : 'Realizar Análise'}
            </button>
          </div>
        </div>

        {/* Busca */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar análises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5AC8FA] mx-auto mb-4"></div>
            <p className="text-gray-600">Realizando análise temporal...</p>
          </div>
        )}

        {/* Resultados */}
        {!loading && analysisResults.length > 0 && (
          <div className="space-y-6">
            {analysisResults.map((analysis, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-[#1B2E4B] to-[#5AC8FA] rounded-full"></div>
                  <h3 className="text-2xl font-semibold text-gray-900">{analysis.insumo.nome}</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(analysis.trendAnalysis.trend)}`}>
                    {getTrendIcon(analysis.trendAnalysis.trend)}
                    <span className="ml-2">
                      {analysis.trendAnalysis.trend === 'increasing' ? 'Em Alta' :
                       analysis.trendAnalysis.trend === 'decreasing' ? 'Em Baixa' : 'Estável'}
                    </span>
                  </div>
                </div>

                {/* Cards de Métricas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pontos de Dados</p>
                        <p className="text-lg font-bold text-gray-900">
                          {analysis.statistics.totalPricePoints}
                        </p>
                      </div>
                      <BarChart3 className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Estatísticas e Projeções */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Estatísticas do Período</h4>
                    <div className="space-y-2 text-sm">
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
                      {analysis.projections.slice(0, 3).map((projection, projIndex) => (
                        <div key={projIndex} className="flex justify-between">
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

                {/* Dados Agrupados */}
                {analysis.groupedData.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Dados Agrupados por Período</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Período</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Preço Médio</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Menor Preço</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Maior Preço</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Registros</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.groupedData.map((data, dataIndex) => (
                            <tr key={dataIndex} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 px-4 font-medium text-gray-900">{data.period}</td>
                              <td className="py-4 px-4">{formatCurrency(data.averagePrice)}</td>
                              <td className="py-4 px-4">{formatCurrency(data.minPrice)}</td>
                              <td className="py-4 px-4">{formatCurrency(data.maxPrice)}</td>
                              <td className="py-4 px-4">{data.priceCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Estado Vazio */}
        {!loading && analysisResults.length === 0 && !error && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma análise realizada</h3>
            <p className="text-gray-600">
              Configure os filtros acima e clique em &quot;Realizar Análise&quot; para visualizar as tendências de custos.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
