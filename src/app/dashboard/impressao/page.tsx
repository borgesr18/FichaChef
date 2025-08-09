'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import { Printer, FileText, TrendingUp, Download, Search, Eye } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { calculateTotalNutrition, calculateNutritionPerPortion, calculateNutritionPer100g, formatNutritionalValue } from '@/lib/nutritional-utils'

interface FichaTecnica {
  id: string
  nome: string
  categoriaId: string
  pesoFinalGramas: number
  numeroPorcoes: number
  tempoPreparo?: number
  temperaturaForno?: number
  modoPreparo: string
  nivelDificuldade: string
  categoria: { nome: string }
  ingredientes: {
    id: string
    insumoId: string
    quantidadeGramas: number
    insumo: {
      nome: string
      precoUnidade: number
      pesoLiquidoGramas: number
      calorias?: number
      proteinas?: number
      carboidratos?: number
      gorduras?: number
      fibras?: number
      sodio?: number
    }
  }[]
}

export default function ImpressaoPage() {
  const [fichas, setFichas] = useState<FichaTecnica[]>([])
  const [selectedFichaId, setSelectedFichaId] = useState('')
  const [selectedFicha, setSelectedFicha] = useState<FichaTecnica | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFichas()
  }, [])

  useEffect(() => {
    if (selectedFichaId) {
      fetchFichaDetails(selectedFichaId)
    }
  }, [selectedFichaId])

  const fetchFichas = async () => {
    try {
      const response = await fetch('/api/fichas-tecnicas')
      if (response.ok) {
        const data = await response.json()
        setFichas(data)
      }
    } catch (error) {
      console.error('Error fetching fichas:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFichaDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/fichas-tecnicas/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedFicha(data)
      }
    } catch (error) {
      console.error('Error fetching ficha details:', error)
    }
  }

  const calculateCustoTotal = (ficha: FichaTecnica): number => {
    return ficha.ingredientes.reduce((total, ing) => {
      const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
      return total + (custoPorGrama * ing.quantidadeGramas)
    }, 0)
  }

  const calculateCustoPorPorcao = (ficha: FichaTecnica): number => {
    return calculateCustoTotal(ficha) / ficha.numeroPorcoes
  }

  const calculatePesoPorPorcao = (ficha: FichaTecnica): number => {
    return ficha.pesoFinalGramas / ficha.numeroPorcoes
  }

  const calculateNutritionalTotal = (ficha: FichaTecnica) => {
    return calculateTotalNutrition(ficha.ingredientes.map(ing => ({
      quantidadeGramas: ing.quantidadeGramas,
      insumo: {
        id: ing.insumoId,
        nome: ing.insumo.nome,
        pesoLiquidoGramas: ing.insumo.pesoLiquidoGramas,
        calorias: ing.insumo.calorias || 0,
        proteinas: ing.insumo.proteinas || 0,
        carboidratos: ing.insumo.carboidratos || 0,
        gorduras: ing.insumo.gorduras || 0,
        fibras: ing.insumo.fibras || 0,
        sodio: ing.insumo.sodio || 0
      }
    })))
  }

  const calculateNutritionalPerPortion = (ficha: FichaTecnica) => {
    const totalNutrition = calculateNutritionalTotal(ficha)
    return calculateNutritionPerPortion(totalNutrition, ficha.numeroPorcoes)
  }

  const calculateNutritionalPer100g = (ficha: FichaTecnica) => {
    const totalNutrition = calculateNutritionalTotal(ficha)
    return calculateNutritionPer100g(totalNutrition, ficha.pesoFinalGramas)
  }

  const handlePrint = () => {
    window.print()
  }

  // Funções auxiliares para o design
  const getFichaIcon = (categoria: string) => {
    if (categoria.toLowerCase().includes('massa')) return '🍝'
    if (categoria.toLowerCase().includes('carne')) return '🥩'
    if (categoria.toLowerCase().includes('doce')) return '🍰'
    if (categoria.toLowerCase().includes('bebida')) return '🥤'
    if (categoria.toLowerCase().includes('salada')) return '🥗'
    return '📄'
  }

  // Estatísticas
  const getStats = () => {
    const totalFichas = fichas.length
    const fichasComNutricao = fichas.filter(f => 
      f.ingredientes.some(ing => (ing.insumo.calorias || 0) > 0)
    ).length
    const fichasImpressas = 1 // Simulado
    const custoMedio = fichas.length > 0 ? 
      fichas.reduce((sum, f) => sum + calculateCustoTotal(f), 0) / fichas.length : 0

    return { totalFichas, fichasComNutricao, fichasImpressas, custoMedio }
  }

  const stats = getStats()

  const filteredFichas = fichas.filter(ficha =>
    ficha.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ficha.categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <div className="mb-8 no-print">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent">
                Impressão de Fichas Técnicas
              </h1>
              <p className="text-gray-600 text-lg">Imprima fichas técnicas profissionais</p>
            </div>
            
            <div className="flex items-center space-x-3 no-print">
              <button className="bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-xl hover:bg-white transition-all duration-200 shadow-lg border border-white/50 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </button>
              <button
                onClick={handlePrint}
                disabled={!selectedFicha}
                className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - hidden on print */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 no-print">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total de Fichas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFichas}</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  Disponíveis
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Com Nutrição</p>
                <p className="text-2xl font-bold text-gray-900">{stats.fichasComNutricao}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Completas
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Impressões Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.fichasImpressas}</p>
                <p className="text-xs text-orange-600 flex items-center">
                  <Printer className="h-3 w-3 mr-1" />
                  Realizadas
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Printer className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Custo Médio</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.custoMedio)}</p>
                <p className="text-xs text-purple-600 flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  Por ficha
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Eye className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Seleção de Ficha */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-8 no-print">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Selecionar Ficha para Impressão</h3>
            
            {/* Busca */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Buscar Ficha</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome da ficha ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Select de Ficha */}
            <div className="max-w-2xl">
              <FloatingLabelSelect
                label="Selecionar Ficha Técnica"
                value={selectedFichaId}
                onChange={(value) => {
                  setSelectedFichaId(value)
                  const ficha = fichas.find(f => f.id === value)
                  if (ficha) {
                    setSelectedFicha(ficha)
                  }
                }}
                options={[
                  { value: '', label: 'Selecione uma ficha técnica...' },
                  ...filteredFichas.map(ficha => ({
                    value: ficha.id,
                    label: `${ficha.nome} - ${ficha.categoria.nome} • ${ficha.pesoFinalGramas}g • ${ficha.numeroPorcoes} porções`
                  }))
                ]}
              />
            </div>
          </div>
        </div>

        {/* Fichas Cards - hidden on print */}
        {!selectedFicha && (
          <div className="mb-8 no-print">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Fichas Disponíveis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFichas.slice(0, 6).map((ficha) => (
                <div
                  key={ficha.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedFichaId(ficha.id)
                    setSelectedFicha(ficha)
                  }}
                >
                  {/* Barra colorida */}
                  <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                  
                  <div className="p-6">
                    {/* Header do card */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFichaIcon(ficha.categoria.nome)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">{ficha.nome}</h3>
                          <p className="text-sm text-gray-500">{ficha.categoria.nome}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                        {ficha.numeroPorcoes} porções
                      </span>
                    </div>

                    {/* Informações principais */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Peso Total:</span>
                        <span className="font-semibold text-gray-900">{ficha.pesoFinalGramas}g</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Custo Total:</span>
                        <span className="font-medium text-gray-700">
                          {formatCurrency(calculateCustoTotal(ficha))}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Por Porção:</span>
                        <span className="font-medium text-gray-700">
                          {formatCurrency(calculateCustoPorPorcao(ficha))}
                        </span>
                      </div>
                    </div>

                    {/* Botão de ação */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar para Impressão
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conteúdo da Ficha Selecionada */}
        {selectedFicha && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 print-content">
            <div className="print-header text-center border-b-2 border-gray-300 pb-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">FichaChef</h1>
              <p className="text-lg text-gray-600">Sistema de Fichas Técnicas</p>
              <div className="mt-2 text-sm text-gray-500">
                Data de Impressão: {new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ficha Técnica</h2>
              <h3 className="text-xl text-gray-700">{selectedFicha.nome}</h3>
              <p className="text-sm text-gray-500 mt-1">Categoria: {selectedFicha.categoria.nome}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="print-section">
                <h4 className="font-bold text-gray-900 mb-3 text-lg border-b border-gray-200 pb-1">Informações Gerais</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Porções:</span>
                    <span className="font-medium">{selectedFicha.numeroPorcoes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peso Final Total:</span>
                    <span className="font-medium">{selectedFicha.pesoFinalGramas}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peso por Porção:</span>
                    <span className="font-medium">{calculatePesoPorPorcao(selectedFicha).toFixed(1)}g</span>
                  </div>
                  {selectedFicha.tempoPreparo && (
                    <div className="flex justify-between">
                      <span>Tempo de Preparo:</span>
                      <span className="font-medium">{selectedFicha.tempoPreparo} min</span>
                    </div>
                  )}
                  {selectedFicha.temperaturaForno && (
                    <div className="flex justify-between">
                      <span>Temperatura do Forno:</span>
                      <span className="font-medium">{selectedFicha.temperaturaForno}°C</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Nível de Dificuldade:</span>
                    <span className="font-medium">{selectedFicha.nivelDificuldade}</span>
                  </div>
                </div>
              </div>
              
              <div className="print-section">
                <h4 className="font-bold text-gray-900 mb-3 text-lg border-b border-gray-200 pb-1">Custos</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Custo Total:</span>
                    <span className="font-medium">{formatCurrency(calculateCustoTotal(selectedFicha))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo por Porção:</span>
                    <span className="font-medium">{formatCurrency(calculateCustoPorPorcao(selectedFicha))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo por 100g:</span>
                    <span className="font-medium">{formatCurrency((calculateCustoTotal(selectedFicha) / selectedFicha.pesoFinalGramas) * 100)}</span>
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              const totalNutrition = calculateNutritionalTotal(selectedFicha)
              const hasNutritionalData = totalNutrition.calorias > 0 || totalNutrition.proteinas > 0
              
              if (!hasNutritionalData) return null
              
              const nutritionPerPortion = calculateNutritionalPerPortion(selectedFicha)
              const nutritionPer100g = calculateNutritionalPer100g(selectedFicha)
              
              return (
                <div className="mb-6 print-section">
                  <h4 className="font-bold text-gray-900 mb-3 text-lg border-b border-gray-200 pb-1">Informações Nutricionais</h4>
                  <div className="grid grid-cols-2 gap-6 nutrition-grid">
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Por Porção ({calculatePesoPorPorcao(selectedFicha).toFixed(1)}g)</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Calorias:</span>
                          <span className="font-medium">{formatNutritionalValue(nutritionPerPortion.calorias, 'kcal')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Proteínas:</span>
                          <span className="font-medium">{formatNutritionalValue(nutritionPerPortion.proteinas, 'g')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carboidratos:</span>
                          <span className="font-medium">{formatNutritionalValue(nutritionPerPortion.carboidratos, 'g')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gorduras:</span>
                          <span className="font-medium">{formatNutritionalValue(nutritionPerPortion.gorduras, 'g')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fibras:</span>
                          <span className="font-medium">{formatNutritionalValue(nutritionPerPortion.fibras, 'g')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sódio:</span>
                          <span className="font-medium">{formatNutritionalValue(nutritionPerPortion.sodio, 'mg')}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Por 100g</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Calorias:</span>
                          <span className="font-medium">{formatNutritionalValue(nutritionPer100g.calorias, 'kcal')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Proteínas:</span>
                          <span className="font-medium">{formatNutritionalValue(nutritionPer100g.proteinas, 'g')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carboidratos:</span>
                          <span className="font-medium">{formatNutritionalValue(nutritionPer100g.carboidratos, 'g')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gorduras:</span>
                          <span className="font-medium">{formatNutritionalValue(nutritionPer100g.gorduras, 'g')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fibras:</span>
                          <span className="font-medium">{formatNutritionalValue(nutritionPer100g.fibras, 'g')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sódio:</span>
                          <span className="font-medium">{formatNutritionalValue(nutritionPer100g.sodio, 'mg')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            <div className="mb-6 print-section">
              <h4 className="font-bold text-gray-900 mb-3 text-lg border-b border-gray-200 pb-1">Ingredientes para Produção</h4>
              {selectedFicha.ingredientes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium">Ingrediente</th>
                        <th className="text-right py-2 font-medium">Quantidade</th>
                        <th className="text-right py-2 font-medium">Custo Unit.</th>
                        <th className="text-right py-2 font-medium">Custo Total</th>
                        <th className="text-right py-2 font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFicha.ingredientes.map((ing, index) => {
                        const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
                        const custoIngrediente = custoPorGrama * ing.quantidadeGramas
                        const percentual = (ing.quantidadeGramas / selectedFicha.pesoFinalGramas) * 100
                        
                        return (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2">{ing.insumo.nome}</td>
                            <td className="text-right py-2">{ing.quantidadeGramas}g</td>
                            <td className="text-right py-2">{formatCurrency(custoPorGrama)}/g</td>
                            <td className="text-right py-2">{formatCurrency(custoIngrediente)}</td>
                            <td className="text-right py-2">{percentual.toFixed(1)}%</td>
                          </tr>
                        )
                      })}
                      <tr className="border-t-2 border-gray-300 font-medium">
                        <td className="py-2">TOTAL</td>
                        <td className="text-right py-2">{selectedFicha.pesoFinalGramas}g</td>
                        <td className="text-right py-2">-</td>
                        <td className="text-right py-2">{formatCurrency(calculateCustoTotal(selectedFicha))}</td>
                        <td className="text-right py-2">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum ingrediente cadastrado</p>
              )}
            </div>

            <div className="print-section">
              <h4 className="font-bold text-gray-900 mb-3 text-lg border-b border-gray-200 pb-1">Modo de Preparo</h4>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {selectedFicha.modoPreparo || 'Modo de preparo não informado'}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 print-section print-optional">
              <h4 className="font-bold text-gray-900 mb-2">Observações para Produção</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Verificar disponibilidade de todos os ingredientes antes do início da produção</p>
                <p>• Pesar todos os ingredientes conforme especificado na tabela acima</p>
                <p>• Seguir rigorosamente o modo de preparo para garantir qualidade</p>
                <p>• Rendimento esperado: {selectedFicha.numeroPorcoes} porções de {calculatePesoPorPorcao(selectedFicha).toFixed(1)}g cada</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }

          /* Mostrar somente a ficha selecionada durante a impressão */
          :global(body *) {
            visibility: hidden !important;
          }
          .print-content, .print-content * {
            visibility: visible !important;
          }
          .print-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-content {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            font-size: 10pt !important;
            line-height: 1.4 !important;
          }
          
          .print-header {
            margin-bottom: 0.8cm !important;
            padding-bottom: 0.3cm !important;
          }
          .print-header p { display: none !important; }
          
          .print-section {
            margin-bottom: 0.6cm !important;
            break-inside: avoid !important;
          }
          .print-optional { display: none !important; }
          
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          
          th, td {
            border: 1px solid #ddd !important;
            padding: 8px !important;
            text-align: left !important;
          }
          
          th {
            background-color: #f5f5f5 !important;
            font-weight: bold !important;
          }
          
          h1, h2, h3, h4 { color: black !important; }
          h1 { font-size: 18pt !important; }
          h2 { font-size: 14pt !important; }
          h3 { font-size: 12pt !important; }
          h4 { font-size: 11pt !important; }
          
          .text-gray-500, .text-gray-600 {
            color: #666 !important;
          }
          
          .text-gray-900 {
            color: black !important;
          }

          /* Simplificar tabela de ingredientes na impressão: mostrar apenas Ingrediente e Quantidade */
          table thead th:nth-child(3),
          table thead th:nth-child(4),
          table thead th:nth-child(5),
          table tbody td:nth-child(3),
          table tbody td:nth-child(4),
          table tbody td:nth-child(5) {
            display: none !important;
          }
          
          /* Linha TOTAL: manter apenas primeira e segunda celas visíveis */
          table tfoot td:nth-child(3),
          table tfoot td:nth-child(4),
          table tfoot td:nth-child(5) { display: none !important; }

          /* Nutrição: usar apenas uma coluna na impressão */
          .nutrition-grid { grid-template-columns: 1fr !important; }
          .nutrition-grid > div:nth-child(2) { display: none !important; }
        }
      `}</style>
    </DashboardLayout>
  )
}
