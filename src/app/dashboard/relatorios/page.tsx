'use client'

import React, { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { FileBarChart, Download, Filter, Package, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { generatePDF, generateExcel, downloadFile, getDefaultTemplate } from '@/lib/export-utils'

interface ReportData {
  type: string
  data: Record<string, unknown>
  summary: Record<string, unknown>
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
        focused || hasValue 
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
        <option value="">Selecione...</option>
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

export default function RelatoriosPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [reportType, setReportType] = useState('custos')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchReport = useCallback(async () => {
    if (!reportType) return
    
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({
        type: reportType,
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      })
      
      const response = await fetch(`/api/relatorios?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        setError('Erro ao gerar relatório')
      }
    } catch (error) {
      console.error('Error fetching report:', error)
      setError('Erro ao carregar relatório')
    } finally {
      setLoading(false)
    }
  }, [reportType, dateFrom, dateTo])

  useEffect(() => {
    fetchReport()
  }, [reportType, fetchReport])

  const handleExportPDF = async () => {
    if (!reportData) return
    
    try {
      const template = getDefaultTemplate()
      const pdfBlob = generatePDF(reportData, template)
      const filename = `relatorio-${reportData.type}-${new Date().toISOString().split('T')[0]}.pdf`
      downloadFile(pdfBlob, filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
      setError('Erro ao gerar PDF')
    }
  }

  const handleExportExcel = async () => {
    if (!reportData) return
    
    try {
      const excelBlob = generateExcel(reportData)
      const filename = `relatorio-${reportData.type}-${new Date().toISOString().split('T')[0]}.xlsx`
      downloadFile(excelBlob, filename)
    } catch (error) {
      console.error('Error generating Excel:', error)
      setError('Erro ao gerar Excel')
    }
  }

  const getReportTitle = (type: string) => {
    const titles = {
      'custos': 'Análise de Custos',
      'producao': 'Relatório de Produção',
      'estoque': 'Controle de Estoque',
      'fichas': 'Fichas Mais Utilizadas',
      'rentabilidade': 'Relatório de Rentabilidade',
      'abc-insumos': 'Análise ABC de Insumos',
      'desperdicio': 'Relatório de Desperdício'
    }
    return titles[type as keyof typeof titles] || 'Relatório'
  }

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5AC8FA] mx-auto mb-4"></div>
          <p className="text-gray-600">Gerando relatório...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg inline-block">
            <Activity className="h-6 w-6 mx-auto mb-2 text-red-500" />
            <p>{error}</p>
          </div>
        </div>
      )
    }

    if (!reportData) {
      return (
        <div className="text-center py-12">
          <FileBarChart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum relatório gerado</h3>
          <p className="text-gray-600">Selecione um período e clique em &quot;Gerar Relatório&quot; para visualizar os dados</p>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(reportData.summary).map(([key, value], index) => {
            // Sistema de ícones e cores
            const iconOptions = [Package, TrendingUp, BarChart3, PieChart]
            const colorOptions = [
              { bg: 'from-blue-400 to-blue-600', text: 'text-blue-600', bgLight: 'bg-blue-50' },
              { bg: 'from-green-400 to-green-600', text: 'text-green-600', bgLight: 'bg-green-50' },
              { bg: 'from-orange-400 to-orange-600', text: 'text-orange-600', bgLight: 'bg-orange-50' },
              { bg: 'from-purple-400 to-purple-600', text: 'text-purple-600', bgLight: 'bg-purple-50' }
            ]
            
            const iconIndex = index % iconOptions.length
            const colorIndex = index % colorOptions.length
            const IconComponent = iconOptions[iconIndex]
            const color = colorOptions[colorIndex]

            return (
              <div key={key} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof value === 'number' && (key.toLowerCase().includes('custo') || key.toLowerCase().includes('valor'))
                        ? formatCurrency(value as number) 
                        : typeof value === 'number' 
                          ? (value as number).toFixed(key.includes('media') ? 1 : 0)
                          : String(value)
                      }
                    </p>
                  </div>
                 {color && (
                 <div className={`bg-gradient-to-br ${color.bg} p-3 rounded-xl`}>
                 <IconComponent className="text-white" size={24} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Dados Detalhados */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <BarChart3 className="text-[#5AC8FA]" size={24} />
            Dados Detalhados
          </h3>
          
          {reportData.data && typeof reportData.data === 'object' && Object.keys(reportData.data).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(reportData.data).map(([key, value]) => (
                <div key={key} className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-5 border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-3 capitalize flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#5AC8FA] rounded-full"></div>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h4>
                  <div className="text-sm text-gray-700">
                    {Array.isArray(value) ? (
                      value.length > 0 ? (
                        <div className="space-y-2">
                          {value.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 px-3 bg-white/60 rounded-lg">
                              <span className="font-medium">{typeof item === 'object' ? item.nome || item.id : item}</span>
                              {typeof item === 'object' && item.valor && (
                                <span className="font-semibold text-green-600">{formatCurrency(item.valor)}</span>
                              )}
                            </div>
                          ))}
                          {value.length > 5 && (
                            <div className="text-center py-2 text-gray-500 italic text-xs">
                              ... e mais {value.length - 5} itens
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="italic">Nenhum dado disponível</p>
                        </div>
                      )
                    ) : typeof value === 'number' ? (
                      <div className="text-center py-4">
                        <p className="text-2xl font-bold text-[#5AC8FA]">{formatCurrency(value)}</p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-lg font-medium text-gray-700">{String(value)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado detalhado</h4>
              <p className="text-gray-600">Não há dados detalhados disponíveis para este relatório</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl">
                <FileBarChart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent">
                  Relatórios Gerenciais
                </h1>
                <p className="text-gray-600 mt-1">Análises detalhadas e insights do seu negócio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Controles */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <FloatingLabelSelect
              label="Tipo de Relatório"
              value={reportType}
              onChange={setReportType}
              options={[
                { value: 'custos', label: 'Análise de Custos' },
                { value: 'producao', label: 'Relatório de Produção' },
                { value: 'estoque', label: 'Controle de Estoque' },
                { value: 'fichas', label: 'Fichas Mais Utilizadas' },
                { value: 'rentabilidade', label: 'Relatório de Rentabilidade' },
                { value: 'abc-insumos', label: 'Análise ABC de Insumos' },
                { value: 'desperdicio', label: 'Relatório de Desperdício' }
              ]}
            />

            <FloatingLabelInput
              label="Data Inicial"
              type="date"
              value={dateFrom}
              onChange={setDateFrom}
            />

            <FloatingLabelInput
              label="Data Final"
              type="date"
              value={dateTo}
              onChange={setDateTo}
            />

            <button 
              onClick={fetchReport}
              disabled={loading}
              className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              <Filter size={20} />
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </button>
          </div>

          {/* Botões de Export */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportPDF}
              disabled={!reportData}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2 font-medium"
            >
              <Download size={20} />
              Exportar PDF
            </button>
            <button
              onClick={handleExportExcel}
              disabled={!reportData}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2 font-medium"
            >
              <Download size={20} />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Conteúdo do Relatório */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-[#1B2E4B] to-[#5AC8FA] rounded-full"></div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {getReportTitle(reportType)}
            </h2>
          </div>
          
          {renderReportContent()}
        </div>
      </div>
    </DashboardLayout>
  )
}
