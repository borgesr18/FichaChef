'use client'

import React, { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import { FileBarChart, Download, Filter, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { generatePDF, generateExcel, downloadFile, getDefaultTemplate } from '@/lib/export-utils'

interface ReportData {
  type: string
  data: Record<string, unknown>
  summary: Record<string, unknown>
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

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Gerando relatório...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
        </div>
      )
    }

    if (!reportData) {
      return (
        <div className="text-center py-12 text-gray-500">
          <FileBarChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Selecione um período e clique em &quot;Gerar Relatório&quot; para visualizar os dados</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(reportData.summary).map(([key, value], index) => (
            <div key={key} className={`p-4 rounded-lg ${
              index % 4 === 0 ? 'bg-blue-50' :
              index % 4 === 1 ? 'bg-green-50' :
              index % 4 === 2 ? 'bg-yellow-50' : 'bg-purple-50'
            }`}>
              <div className="flex items-center">
                <Package className={`h-8 w-8 mr-3 ${
                  index % 4 === 0 ? 'text-blue-600' :
                  index % 4 === 1 ? 'text-green-600' :
                  index % 4 === 2 ? 'text-yellow-600' : 'text-purple-600'
                }`} />
                <div>
                  <p className={`text-sm ${
                    index % 4 === 0 ? 'text-blue-600' :
                    index % 4 === 1 ? 'text-green-600' :
                    index % 4 === 2 ? 'text-yellow-600' : 'text-purple-600'
                  }`}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                  <p className={`text-2xl font-bold ${
                    index % 4 === 0 ? 'text-blue-900' :
                    index % 4 === 1 ? 'text-green-900' :
                    index % 4 === 2 ? 'text-yellow-900' : 'text-purple-900'
                  }`}>
                    {typeof value === 'number' && (key.toLowerCase().includes('custo') || key.toLowerCase().includes('valor'))
                      ? formatCurrency(value as number) 
                      : typeof value === 'number' 
                        ? (value as number).toFixed(key.includes('media') ? 1 : 0)
                        : String(value)
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Detalhados</h3>
          <div className="text-sm text-gray-600">
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(reportData.data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mr-3 transform transition-transform duration-200 hover:scale-110">
            <FileBarChart className="h-6 w-6 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Relatórios Gerenciais</h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <FloatingLabelSelect
              label="Tipo de Relatório"
              value={reportType}
              onChange={(value) => setReportType(value)}
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
              onChange={(value) => setDateFrom(value)}
            />

            <FloatingLabelInput
              label="Data Final"
              type="date"
              value={dateTo}
              onChange={(value) => setDateTo(value)}
            />

            <div className="flex items-end">
              <button 
                onClick={fetchReport}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
              >
                <Filter className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:rotate-12" />
                {loading ? 'Gerando...' : 'Gerar Relatório'}
              </button>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={handleExportPDF}
              disabled={!reportData}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
            >
              <Download className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:-translate-y-1" />
              Exportar PDF
            </button>
            <button
              onClick={handleExportExcel}
              disabled={!reportData}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
            >
              <Download className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:-translate-y-1" />
              Exportar Excel
            </button>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {reportType === 'custos' && 'Análise de Custos'}
              {reportType === 'producao' && 'Relatório de Produção'}
              {reportType === 'estoque' && 'Controle de Estoque'}
              {reportType === 'fichas' && 'Fichas Mais Utilizadas'}
              {reportType === 'rentabilidade' && 'Relatório de Rentabilidade'}
              {reportType === 'abc-insumos' && 'Análise ABC de Insumos'}
              {reportType === 'desperdicio' && 'Relatório de Desperdício'}
            </h3>
            
            {renderReportContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
