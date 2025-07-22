'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import { Printer } from 'lucide-react'
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
            <Printer className="h-6 w-6 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Impressão de Fichas Técnicas</h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300 p-6 no-print">
          <div className="max-w-md">
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
                ...fichas.map(ficha => ({
                  value: ficha.id,
                  label: `${ficha.nome} - ${ficha.categoria.nome} • ${ficha.pesoFinalGramas}g • ${ficha.numeroPorcoes} porções`
                }))
              ]}
            />

            <button
              onClick={handlePrint}
              disabled={!selectedFicha}
              className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Ficha Técnica
            </button>
          </div>
        </div>

        {selectedFicha && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 print-content">
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
                  <div className="grid grid-cols-2 gap-6">
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

            <div className="mt-6 pt-4 border-t border-gray-200 print-section">
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
            margin: 2cm;
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
            font-size: 12pt !important;
            line-height: 1.4 !important;
          }
          
          .print-header {
            margin-bottom: 1.5cm !important;
            padding-bottom: 0.5cm !important;
          }
          
          .print-section {
            margin-bottom: 1cm !important;
            break-inside: avoid !important;
          }
          
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
          
          h1, h2, h3, h4 {
            color: black !important;
          }
          
          .text-gray-500, .text-gray-600 {
            color: #666 !important;
          }
          
          .text-gray-900 {
            color: black !important;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}
