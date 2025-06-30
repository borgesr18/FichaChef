'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Printer, ChevronDown } from 'lucide-react'

export default function ImpressaoPage() {
  const [selectedReceita, setSelectedReceita] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const receitas: Array<{ id: string; nome: string }> = [] // Will be populated from API

  const handlePrint = () => {
    window.print()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Printer className="h-6 w-6 text-gray-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Impressão de Fichas Técnicas</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 no-print">
          <div className="max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Ficha Técnica
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex items-center justify-between focus:ring-blue-500 focus:border-blue-500"
                >
                  <span className={selectedReceita ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedReceita || 'Selecione uma ficha técnica...'}
                  </span>
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                    {receitas.length === 0 ? (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        Nenhuma ficha técnica cadastrada
                      </div>
                    ) : (
                      receitas.map((receita: { id: string; nome: string }) => (
                        <button
                          key={receita.id}
                          onClick={() => {
                            setSelectedReceita(receita.nome)
                            setIsDropdownOpen(false)
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                        >
                          {receita.nome}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handlePrint}
              disabled={!selectedReceita}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Ficha Técnica
            </button>
          </div>
        </div>

        {selectedReceita && (
          <div className="bg-white rounded-lg shadow p-6 print-content">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Ficha Técnica</h2>
              <h3 className="text-xl text-gray-700 mt-2">{selectedReceita}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Informações Gerais</h4>
                <div className="space-y-1 text-sm">
                  <div>Porções: <span className="font-medium">0</span></div>
                  <div>Peso total: <span className="font-medium">0g</span></div>
                  <div>Peso por porção: <span className="font-medium">0g</span></div>
                  <div>Tempo de preparo: <span className="font-medium">0 min</span></div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Custos</h4>
                <div className="space-y-1 text-sm">
                  <div>Custo total: <span className="font-medium">R$ 0,00</span></div>
                  <div>Custo por porção: <span className="font-medium">R$ 0,00</span></div>
                  <div>Data: <span className="font-medium">{new Date().toLocaleDateString('pt-BR')}</span></div>
                  <div>Lote: <span className="font-medium">-</span></div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Ingredientes</h4>
              <div className="bg-gray-50 rounded p-4">
                <p className="text-gray-500 text-center">Nenhum ingrediente cadastrado</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Modo de Preparo</h4>
              <div className="bg-gray-50 rounded p-4">
                <p className="text-gray-500">Modo de preparo não informado</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-content {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}
