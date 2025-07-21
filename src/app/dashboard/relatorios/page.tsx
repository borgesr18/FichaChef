'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { FileBarChart, Download, Filter, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

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

  const fetchReport = async () => {
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
  }

  useEffect(() => {
    fetchReport()
  }, [reportType])

  const handleExportPDF = () => {
    console.log('Exporting PDF...', reportData)
  }

  const handleExportExcel = () => {
    console.log('Exporting Excel...', reportData)
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

        <div className="bg-white rounded-lg shadow p-6">
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
          <FileBarChart className="h-6 w-6 text-gray-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Gerenciais</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Relatório
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="custos">Análise de Custos</option>
                <option value="producao">Relatório de Produção</option>
                <option value="estoque">Controle de Estoque</option>
                <option value="fichas">Fichas Mais Utilizadas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button 
                onClick={fetchReport}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                {loading ? 'Gerando...' : 'Gerar Relatório'}
              </button>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={handleExportPDF}
              disabled={!reportData}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </button>
            <button
              onClick={handleExportExcel}
              disabled={!reportData}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </button>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {reportType === 'custos' && 'Análise de Custos'}
              {reportType === 'producao' && 'Relatório de Produção'}
              {reportType === 'estoque' && 'Controle de Estoque'}
              {reportType === 'fichas' && 'Fichas Mais Utilizadas'}
            </h3>
            
            {renderReportContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
