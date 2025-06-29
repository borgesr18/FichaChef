'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Calculator, ChevronDown } from 'lucide-react'

export default function CalculoPrecoPage() {
  const [selectedReceita, setSelectedReceita] = useState('')
  const [pesoFinal, setPesoFinal] = useState('')
  const [margemLucro, setMargemLucro] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const receitas: Array<{ id: string; nome: string }> = [] // Will be populated from API

  const handleCalculate = () => {
    console.log('Calculating price...')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Calculator className="h-6 w-6 text-gray-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Cálculo de Preço de Venda</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Receita
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex items-center justify-between focus:ring-blue-500 focus:border-blue-500"
                  >
                    <span className={selectedReceita ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedReceita || 'Selecione uma receita...'}
                    </span>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                      {receitas.length === 0 ? (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          Nenhuma receita cadastrada
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso Final do Produto (gramas)
                </label>
                <input
                  type="number"
                  value={pesoFinal}
                  onChange={(e) => setPesoFinal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margem de Lucro Desejada (%)
                </label>
                <input
                  type="number"
                  value={margemLucro}
                  onChange={(e) => setMargemLucro(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 30"
                />
              </div>

              <button
                onClick={handleCalculate}
                disabled={!selectedReceita || !pesoFinal || !margemLucro}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Calcular Preço
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resultado do Cálculo</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Custo por grama:</span>
                  <span className="font-medium">R$ 0,00</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Custo total:</span>
                  <span className="font-medium">R$ 0,00</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Margem de lucro:</span>
                  <span className="font-medium">R$ 0,00</span>
                </div>
                
                <hr className="border-gray-300" />
                
                <div className="flex justify-between text-lg">
                  <span className="font-medium text-gray-900">Preço sugerido:</span>
                  <span className="font-bold text-green-600">R$ 0,00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
