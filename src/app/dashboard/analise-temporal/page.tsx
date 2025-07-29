'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import ModernTable from '@/components/ui/ModernTable'
import { TrendingUp, TrendingDown, BarChart3, Calendar, AlertTriangle, Target, Activity, Plus } from 'lucide-react'
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

  const handleOpenModal = () => {
    // Implementar abertura de modal se necessário
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
        {/* Header com gradiente azul - estilo UXPilot */}
        <div className="uxpilot-header-gradient">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Análise Temporal</h1>
                <p className="text-blue-100 mt-1">Análises históricas e tendências</p>
              </div>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center transition-all duration-300 border border-white/20"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-medium">Nova Análise</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="uxpilot-card">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros de Análise</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FloatingLabelSelect
                label="Insumo"
                value={filters.insumoId}
                onChange={(value) => setFilters(prev => ({ ...prev, insumoId: value }))}
                options={[
                  { value: '', label: 'Todos os insumos' },
                  ...insumos.map(insumo => ({ value: insumo.id, label: insumo.nome }))
                ]}
              />

              <FloatingLabelSelect
                label="Fornecedor"
                value={filters.fornecedorId}
                onChange={(value) => setFilters(prev => ({ ...prev, fornecedorId: value }))}
                options={[
                  { value: '', label: 'Todos os fornecedores' },
                  ...fornecedores.map(fornecedor => ({ value: fornecedor.id, label: fornecedor.nome }))
                ]}
              />

              <FloatingLabelSelect
                label="Período de Agrupamento"
                value={filters.periodo}
                onChange={(value) => setFilters(prev => ({ ...prev, periodo: value as 'monthly' | 'quarterly' | 'yearly' }))}
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
                onChange={(value) => setFilters(prev => ({ ...prev, dataInicio: value }))}
              />

              <FloatingLabelInput
                label="Data Fim"
                type="date"
                value={filters.dataFim}
                onChange={(value) => setFilters(prev => ({ ...prev, dataFim: value }))}
              />

              <FloatingLabelInput
                label="Meses de Projeção"
                type="number"
                value={filters.mesesProjecao.toString()}
                onChange={(value) => setFilters(prev => ({ ...prev, mesesProjecao: parseInt(value) || 6 }))}
                min="1"
                max="24"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="uxpilot-button-primary"
              >
                {loading ? 'Analisando...' : 'Realizar Análise'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Resultados */}
        {analysisResults.length > 0 && (
          <div className="space-y-6">
            {analysisResults.map((analysis, index) => (
              <div key={index} className="uxpilot-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{analysis.insumo.nome}</h3>
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(analysis.trendAnalysis.trend)}`}>
                      {getTrendIcon(analysis.trendAnalysis.trend)}
                      <span className="ml-2 capitalize">{analysis.trendAnalysis.trend}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Preço Médio</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(analysis.statistics.averagePrice)}
                          </p>
                        </div>
                        <Target className="h-5 w-5 text-gray-400" />
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
