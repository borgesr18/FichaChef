'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Calculator, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface FichaTecnica {
  id: string
  nome: string
  pesoFinalGramas: number
  ingredientes: {
    quantidadeGramas: number
    insumo: {
      precoUnidade: number
      pesoLiquidoGramas: number
    }
  }[]
}

interface Produto {
  id: string
  nome: string
  produtoFichas: {
    quantidadeGramas: number
    fichaTecnica: FichaTecnica
  }[]
}

type CalculationItem = {
  id: string
  nome: string
  type: 'produto' | 'ficha'
  pesoTotal: number
  custoTotal: number
}

export default function CalculoPrecoPage() {
  const [calculationItems, setCalculationItems] = useState<CalculationItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState('')
  const [pesoDesejado, setPesoDesejado] = useState('')
  const [margem1, setMargem1] = useState('30')
  const [margem2, setMargem2] = useState('50')
  const [margem3, setMargem3] = useState('70')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = React.useCallback(async () => {
    try {
      const [produtosRes, fichasRes] = await Promise.all([
        fetch('/api/produtos'),
        fetch('/api/fichas-tecnicas')
      ])

      if (produtosRes.ok && fichasRes.ok) {
        const produtosData = await produtosRes.json()
        const fichasData = await fichasRes.json()
        
        const items: CalculationItem[] = [
          ...produtosData.map((produto: Produto) => ({
            id: produto.id,
            nome: produto.nome,
            type: 'produto' as const,
            pesoTotal: produto.produtoFichas.reduce((total, f) => total + f.quantidadeGramas, 0),
            custoTotal: calculateProdutoCusto(produto)
          })),
          ...fichasData.map((ficha: FichaTecnica) => ({
            id: ficha.id,
            nome: ficha.nome,
            type: 'ficha' as const,
            pesoTotal: ficha.pesoFinalGramas,
            custoTotal: calculateFichaCusto(ficha)
          }))
        ]
        
        setCalculationItems(items)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])


  const calculateProdutoCusto = (produto: Produto): number => {
    return produto.produtoFichas.reduce((total, produtoFicha) => {
      const fichaCusto = produtoFicha.fichaTecnica.ingredientes.reduce((fichaTotal, ing) => {
        const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
        return fichaTotal + (custoPorGrama * ing.quantidadeGramas)
      }, 0)
      const custoPorGramaFicha = fichaCusto / produtoFicha.fichaTecnica.pesoFinalGramas
      return total + (custoPorGramaFicha * produtoFicha.quantidadeGramas)
    }, 0)
  }

  const calculateFichaCusto = (ficha: FichaTecnica): number => {
    return ficha.ingredientes.reduce((total, ing) => {
      const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
      return total + (custoPorGrama * ing.quantidadeGramas)
    }, 0)
  }

  const getSelectedItem = (): CalculationItem | null => {
    return calculationItems.find(item => item.id === selectedItemId) || null
  }

  const calculateResults = () => {
    const selectedItem = getSelectedItem()
    const peso = parseFloat(pesoDesejado)
    
    if (!selectedItem || !peso || peso <= 0) {
      return {
        custoPorGrama: 0,
        custoTotal: 0,
        precos: [0, 0, 0]
      }
    }

    const custoPorGrama = selectedItem.custoTotal / selectedItem.pesoTotal
    const custoTotal = custoPorGrama * peso
    
    const precos = [
      parseFloat(margem1) || 0,
      parseFloat(margem2) || 0,
      parseFloat(margem3) || 0
    ].map(margem => {
      return custoTotal * (1 + margem / 100)
    })

    return {
      custoPorGrama,
      custoTotal,
      precos
    }
  }

  const results = calculateResults()
  const selectedItem = getSelectedItem()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mr-3 transform transition-transform duration-200 hover:scale-110">
            <Calculator className="h-6 w-6 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Cálculo de Preço de Venda</h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Item para Cálculo
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex items-center justify-between focus:ring-blue-500 focus:border-blue-500"
                  >
                    <span className={selectedItemId ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedItem ? `${selectedItem.nome} (${selectedItem.type === 'produto' ? 'Produto' : 'Ficha Técnica'})` : 'Selecione um item...'}
                    </span>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {calculationItems.length === 0 ? (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          Nenhum item disponível
                        </div>
                      ) : (
                        calculationItems.map((item) => (
                          <button
                            key={`${item.type}-${item.id}`}
                            onClick={() => {
                              setSelectedItemId(item.id)
                              setIsDropdownOpen(false)
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                          >
                            <div className="font-medium">{item.nome}</div>
                            <div className="text-xs text-gray-500">
                              {item.type === 'produto' ? 'Produto' : 'Ficha Técnica'} • {item.pesoTotal}g • {formatCurrency(item.custoTotal)}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso Desejado (gramas)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="10000"
                  value={pesoDesejado}
                  onChange={(e) => setPesoDesejado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 250"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Margens de Lucro Configuráveis (%)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Margem 1</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1000"
                      value={margem1}
                      onChange={(e) => setMargem1(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Margem 2</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1000"
                      value={margem2}
                      onChange={(e) => setMargem2(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Margem 3</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1000"
                      value={margem3}
                      onChange={(e) => setMargem3(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Resultado do Cálculo</h3>
              
              {selectedItem && (
                <div className="mb-6 p-4 bg-blue-50 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">Item Selecionado</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div><span className="font-medium">Nome:</span> {selectedItem.nome}</div>
                    <div><span className="font-medium">Tipo:</span> {selectedItem.type === 'produto' ? 'Produto Composto' : 'Ficha Técnica'}</div>
                    <div><span className="font-medium">Peso Base:</span> {selectedItem.pesoTotal}g</div>
                    <div><span className="font-medium">Custo Base:</span> {formatCurrency(selectedItem.custoTotal)}</div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Custo por grama:</span>
                  <span className="font-medium">{formatCurrency(results.custoPorGrama)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Custo total ({pesoDesejado || 0}g):</span>
                  <span className="font-medium">{formatCurrency(results.custoTotal)}</span>
                </div>
                
                <hr className="border-gray-300" />
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Preços Sugeridos</h4>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Margem {margem1}%:</span>
                    <span className="font-bold text-green-600">{formatCurrency(results.precos[0] || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Margem {margem2}%:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(results.precos[1] || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Margem {margem3}%:</span>
                    <span className="font-bold text-purple-600">{formatCurrency(results.precos[2] || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
