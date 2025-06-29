'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { FileBarChart, Download, Calendar, Filter } from 'lucide-react'

export default function RelatoriosPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [reportType, setReportType] = useState('custos')

  const handleExportPDF = () => {
    console.log('Exporting PDF...')
  }

  const handleExportExcel = () => {
    console.log('Exporting Excel...')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <FileBarChart className="h-6 w-6 text-gray-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
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
                <option value="custos">Custos</option>
                <option value="producao">Produção</option>
                <option value="estoque">Estoque</option>
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
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </button>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={handleExportPDF}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </button>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Relatório de {reportType.charAt(0).toUpperCase() + reportType.slice(1)}
            </h3>
            
            <div className="text-center py-12 text-gray-500">
              <FileBarChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Selecione um período e clique em "Filtrar" para gerar o relatório</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
