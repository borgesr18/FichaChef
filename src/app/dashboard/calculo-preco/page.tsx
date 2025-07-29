'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Calculator, ChevronDown, TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react'
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

  // Funções auxiliares para o design
  const getItemIcon = (type: string) => {
    return type === 'produto' ? '📦' : '📋'
  }

  // Estatísticas
  const getStats = () => {
    const totalItens = calculationItems.length
    const produtos = calculationItems.filter(item => item.type === 'produto').length
    const fichas = calculationItems.filter(item => item.type === 'ficha').length
    const custoMedio = calculationItems.length > 0 ? 
      calculationItems.reduce((sum, item) => sum + (item.custoTotal / item.pesoTotal), 0) / calculationItems.length : 0

    return { totalItens, produtos, fichas, custoMedio }
  }

  const results = calculateResults()
  const selectedItem = getSelectedItem()
  const stats = getStats()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2E4B]"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent">
                Cálculo de Preço de Venda
              </h1>
              <p className="text-gray-600 text-lg">Calcule preços com margens personalizadas</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItens}</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <Calculator className="h-3 w-3 mr-1" />
                  Disponíveis
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calculator className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.produtos}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <Target className="h-3 w-3 mr-1" />
                  Compostos
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Fichas Técnicas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.fichas}</p>
                <p className="text-xs text-orange-600 flex items-center">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Receitas
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Custo Médio/g</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.custoMedio)}</p>
                <p className="text-xs text-purple-600 flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Por grama
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Calculadora Principal */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulário de Entrada */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Configuração do Cálculo</h3>
                <p className="text-sm text-gray-600">Configure os parâmetros para calcular o preço de venda</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Selecionar Item para Cálculo
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-3 bg-white/70 border border-white/30 rounded-xl text-left flex items-center justify-between focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm hover:bg-white/80"
                  >
                    <span className={selectedItemId ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedItem ? `${selectedItem.nome} (${selectedItem.type === 'produto' ? 'Produto' : 'Ficha Técnica'})` : 'Selecione um item...'}
                    </span>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-xl max-h-60 overflow-auto">
                      {calculationItems.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500 text-sm">
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
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 text-sm transition-colors duration-200 flex items-center space-x-3"
                          >
                            <span className="text-xl">{getItemIcon(item.type)}</span>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{item.nome}</div>
                              <div className="text-xs text-gray-500">
                                {item.type === 'produto' ? 'Produto Composto' : 'Ficha Técnica'} • {item.pesoTotal}g • {formatCurrency(item.custoTotal)}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Peso Desejado (gramas)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="10000"
                  value={pesoDesejado}
                  onChange={(e) => setPesoDesejado(e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Ex: 250"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Margens de Lucro Configuráveis (%)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Margem 1</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1000"
                      value={margem1}
                      onChange={(e) => setMargem1(e.target.value)}
                      className="w-full px-3 py-2 bg-white/70 border border-white/30 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Margem 2</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1000"
                      value={margem2}
                      onChange={(e) => setMargem2(e.target.value)}
                      className="w-full px-3 py-2 bg-white/70 border border-white/30 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Margem 3</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1000"
                      value={margem3}
                      onChange={(e) => setMargem3(e.target.value)}
                      className="w-full px-3 py-2 bg-white/70 border border-white/30 rounded-lg focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado do Cálculo */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-white/30">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-[#5AC8FA]" />
                    Resultado do Cálculo
                  </h3>
                  <p className="text-sm text-gray-600">Análise de custos e preços sugeridos</p>
                </div>
                
                {selectedItem && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">{getItemIcon(selectedItem.type)}</span>
                      Item Selecionado
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-500">Nome:</span>
                          <div className="font-medium text-gray-900">{selectedItem.nome}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Tipo:</span>
                          <div className="font-medium text-gray-900">
                            {selectedItem.type === 'produto' ? 'Produto Composto' : 'Ficha Técnica'}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-500">Peso Base:</span>
                          <div className="font-medium text-gray-900">{selectedItem.pesoTotal}g</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Custo Base:</span>
                          <div className="font-medium text-gray-900">{formatCurrency(selectedItem.custoTotal)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Custo por grama:</span>
                      <span className="font-bold text-lg text-gray-900">{formatCurrency(results.custoPorGrama)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Custo total ({pesoDesejado || 0}g):</span>
                      <span className="font-bold text-lg text-gray-900">{formatCurrency(results.custoTotal)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                      Preços Sugeridos
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700 font-medium">Margem {margem1}%:</span>
                          <span className="font-bold text-xl text-green-800">{formatCurrency(results.precos[0] || 0)}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700 font-medium">Margem {margem2}%:</span>
                          <span className="font-bold text-xl text-blue-800">{formatCurrency(results.precos[1] || 0)}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <div className="flex justify-between items-center">
                          <span className="text-purple-700 font-medium">Margem {margem3}%:</span>
                          <span className="font-bold text-xl text-purple-800">{formatCurrency(results.precos[2] || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Itens Disponíveis */}
        {calculationItems.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Itens Disponíveis para Cálculo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calculationItems.slice(0, 6).map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedItemId(item.id)
                    setIsDropdownOpen(false)
                  }}
                >
                  {/* Barra colorida */}
                  <div className={`h-2 ${item.type === 'produto' ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-orange-400 to-orange-600'}`}></div>
                  
                  <div className="p-6">
                    {/* Header do card */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getItemIcon(item.type)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">{item.nome}</h3>
                          <p className="text-sm text-gray-500">
                            {item.type === 'produto' ? 'Produto Composto' : 'Ficha Técnica'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        item.type === 'produto' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.pesoTotal}g
                      </span>
                    </div>

                    {/* Informações principais */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Custo Total:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(item.custoTotal)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Custo por Grama:</span>
                        <span className="font-medium text-gray-700">
                          {formatCurrency(item.custoTotal / item.pesoTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Botão de ação */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <button className={`w-full text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
                        item.type === 'produto'
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                          : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                      }`}>
                        <Calculator className="h-4 w-4 mr-2" />
                        Calcular Preço
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

