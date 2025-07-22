'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { FileText, Plus, Search, Edit, Trash2, X, Calculator } from 'lucide-react'
import { convertFormDataToNumbers } from '@/lib/form-utils'
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

interface Categoria {
  id: string
  nome: string
}

interface Insumo {
  id: string
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

interface Ingrediente {
  insumoId?: string
  quantidadeGramas?: number
}

export default function FichasTecnicasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [fichas, setFichas] = useState<FichaTecnica[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFicha, setEditingFicha] = useState<FichaTecnica | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isScalingModalOpen, setIsScalingModalOpen] = useState(false)
  const [scalingFicha, setScalingFicha] = useState<FichaTecnica | null>(null)
  const [targetPortions, setTargetPortions] = useState('')
  const [scaledData, setScaledData] = useState<{
    ingredientes: Array<{
      id: string
      insumoId: string
      quantidadeGramas: number
      insumo: {
        nome: string
        precoUnidade: number
        pesoLiquidoGramas: number
      }
    }>
    custoTotal: number
    pesoTotal: number
    tempoPreparoEscalado?: number
  } | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    categoriaId: '',
    pesoFinalGramas: '',
    numeroPorcoes: '',
    tempoPreparo: '',
    temperaturaForno: '',
    modoPreparo: '',
    nivelDificuldade: 'Fácil'
  })

  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])

  useEffect(() => {
    fetchFichas()
    fetchCategorias()
    fetchInsumos()
  }, [])

  const fetchFichas = async () => {
    try {
      const response = await fetch('/api/fichas-tecnicas')
      if (response.ok) {
        const data = await response.json()
        setFichas(data)
      }
    } catch (error) {
      console.error('Error fetching fichas:', error)
    }
  }

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias-receitas')
      if (response.ok) {
        const data = await response.json()
        setCategorias(data)
      }
    } catch (error) {
      console.error('Error fetching categorias:', error)
    }
  }

  const fetchInsumos = async () => {
    try {
      const response = await fetch('/api/insumos')
      if (response.ok) {
        const data = await response.json()
        setInsumos(data)
      }
    } catch (error) {
      console.error('Error fetching insumos:', error)
    }
  }

  const handleOpenModal = (ficha?: FichaTecnica) => {
    setEditingFicha(ficha || null)
    if (ficha) {
      setFormData({
        nome: ficha.nome,
        categoriaId: ficha.categoriaId,
        pesoFinalGramas: ficha.pesoFinalGramas.toString(),
        numeroPorcoes: ficha.numeroPorcoes.toString(),
        tempoPreparo: ficha.tempoPreparo?.toString() || '',
        temperaturaForno: ficha.temperaturaForno?.toString() || '',
        modoPreparo: ficha.modoPreparo,
        nivelDificuldade: ficha.nivelDificuldade
      })
      setIngredientes(ficha.ingredientes.map(ing => ({
        insumoId: ing.insumoId,
        quantidadeGramas: ing.quantidadeGramas
      })))
    } else {
      setFormData({
        nome: '',
        categoriaId: '',
        pesoFinalGramas: '',
        numeroPorcoes: '',
        tempoPreparo: '',
        temperaturaForno: '',
        modoPreparo: '',
        nivelDificuldade: 'Fácil'
      })
      setIngredientes([])
    }
    setIsModalOpen(true)
    setError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingFicha(null)
    setError('')
  }

  const addIngrediente = () => {
    setIngredientes([...ingredientes, { insumoId: '', quantidadeGramas: 0 }])
  }

  const removeIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index))
  }

  const updateIngrediente = (index: number, field: keyof Ingrediente, value: string | number) => {
    const updated = [...ingredientes]
    updated[index] = { ...updated[index], [field]: value }
    setIngredientes(updated)
  }

  const calculateCustoTotal = () => {
    return ingredientes.reduce((total, ing) => {
      const insumo = insumos.find(i => i.id === ing.insumoId)
      if (insumo && ing.quantidadeGramas) {
        const custoPorGrama = insumo.precoUnidade / insumo.pesoLiquidoGramas
        return total + (custoPorGrama * ing.quantidadeGramas)
      }
      return total
    }, 0)
  }

  const calculateNutritionalTotal = () => {
    return calculateTotalNutrition(ingredientes.map(ing => {
      const insumo = insumos.find(i => i.id === ing.insumoId)
      return {
        quantidadeGramas: ing.quantidadeGramas || 0,
        insumo: insumo || { 
          id: '', 
          nome: '', 
          pesoLiquidoGramas: 1,
          calorias: 0,
          proteinas: 0,
          carboidratos: 0,
          gorduras: 0,
          fibras: 0,
          sodio: 0
        }
      }
    }).filter(ing => ing.insumo.id))
  }

  const handleOpenScalingModal = (ficha: FichaTecnica) => {
    setScalingFicha(ficha)
    setTargetPortions(ficha.numeroPorcoes.toString())
    setScaledData(null)
    setIsScalingModalOpen(true)
  }

  const handleCloseScalingModal = () => {
    setIsScalingModalOpen(false)
    setScalingFicha(null)
    setTargetPortions('')
    setScaledData(null)
  }

  const calculateScaling = () => {
    if (!scalingFicha || !targetPortions) return

    const targetPortionsNum = parseInt(targetPortions)
    if (targetPortionsNum <= 0) return

    const scaleFactor = targetPortionsNum / scalingFicha.numeroPorcoes
    
    const scaledIngredientes = scalingFicha.ingredientes.map(ing => ({
      ...ing,
      quantidadeGramas: ing.quantidadeGramas * scaleFactor
    }))

    const custoTotal = scaledIngredientes.reduce((total, ing) => {
      const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
      return total + (custoPorGrama * ing.quantidadeGramas)
    }, 0)

    const pesoTotal = scalingFicha.pesoFinalGramas * scaleFactor
    
    const tempoPreparoEscalado = scalingFicha.tempoPreparo 
      ? Math.round(scalingFicha.tempoPreparo * Math.sqrt(scaleFactor))
      : undefined

    setScaledData({
      ingredientes: scaledIngredientes,
      custoTotal,
      pesoTotal,
      tempoPreparoEscalado
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingFicha ? `/api/fichas-tecnicas/${editingFicha.id}` : '/api/fichas-tecnicas'
      const method = editingFicha ? 'PUT' : 'POST'

      const convertedFormData = convertFormDataToNumbers(formData, ['pesoFinalGramas', 'numeroPorcoes', 'tempoPreparo', 'temperaturaForno'])

      const dataToSend = {
        ...convertedFormData,
        ingredientes: ingredientes
          .filter(ing => ing.insumoId && ing.quantidadeGramas && ing.quantidadeGramas > 0)
          .map(ing => ({
            insumoId: ing.insumoId,
            quantidadeGramas: typeof ing.quantidadeGramas === 'string' ? parseFloat(ing.quantidadeGramas) || 0 : ing.quantidadeGramas
          }))
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (response.ok) {
        handleCloseModal()
        fetchFichas()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar ficha técnica')
      }
    } catch {
      setError('Erro ao salvar ficha técnica')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ficha técnica?')) return

    try {
      const response = await fetch(`/api/fichas-tecnicas/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchFichas()
      }
    } catch (error) {
      console.error('Error deleting ficha:', error)
    }
  }

  const filteredFichas = fichas.filter(ficha =>
    ficha.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ficha.categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mr-3 transform transition-transform duration-200 hover:scale-110">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Fichas Técnicas</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:rotate-90" />
            Nova Ficha Técnica
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300">
          <div className="p-6 border-b border-slate-200/60">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors duration-200 group-focus-within:text-orange-500" />
              <input
                type="text"
                placeholder="Buscar fichas técnicas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-slate-50/50 hover:bg-white focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Porções
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peso Final
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFichas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
                        <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full">
                          <FileText className="h-12 w-12 text-orange-500 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-slate-600 font-medium text-lg">
                            {searchTerm ? 'Nenhuma ficha técnica encontrada.' : 'Nenhuma ficha técnica cadastrada.'}
                          </p>
                          {!searchTerm && (
                            <p className="text-slate-500 text-sm animate-pulse">
                              Clique em &quot;Nova Ficha Técnica&quot; para começar.
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFichas.map((ficha) => {
                    const custoTotal = ficha.ingredientes.reduce((total, ing) => {
                      const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
                      return total + (custoPorGrama * ing.quantidadeGramas)
                    }, 0)

                    return (
                      <tr key={ficha.id} className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-transparent transition-all duration-200 hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5 cursor-pointer group">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 group-hover:text-orange-700 transition-colors duration-200">
                          {ficha.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-200">
                          {ficha.categoria.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-200">
                          {ficha.numeroPorcoes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-200">
                          {ficha.pesoFinalGramas}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 group-hover:text-green-700 transition-colors duration-200">
                          R$ {custoTotal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleOpenScalingModal(ficha)}
                              className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                              title="Escalar Receita"
                            >
                              <Calculator className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenModal(ficha)}
                              className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(ficha.id)}
                              className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingFicha ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formData.categoriaId}
                onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso Final (gramas) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.pesoFinalGramas}
                onChange={(e) => setFormData({ ...formData, pesoFinalGramas: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Porções *
              </label>
              <input
                type="number"
                value={formData.numeroPorcoes}
                onChange={(e) => setFormData({ ...formData, numeroPorcoes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo de Preparo (minutos)
              </label>
              <input
                type="number"
                value={formData.tempoPreparo}
                onChange={(e) => setFormData({ ...formData, tempoPreparo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperatura do Forno (°C)
              </label>
              <input
                type="number"
                value={formData.temperaturaForno}
                onChange={(e) => setFormData({ ...formData, temperaturaForno: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Dificuldade *
              </label>
              <select
                value={formData.nivelDificuldade}
                onChange={(e) => setFormData({ ...formData, nivelDificuldade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Fácil">Fácil</option>
                <option value="Médio">Médio</option>
                <option value="Difícil">Difícil</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modo de Preparo *
            </label>
            <textarea
              value={formData.modoPreparo}
              onChange={(e) => setFormData({ ...formData, modoPreparo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Ingredientes
              </label>
              <button
                type="button"
                onClick={addIngrediente}
                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
              >
                <Plus className="h-4 w-4 inline mr-1" />
                Adicionar Ingrediente
              </button>
            </div>

            <div className="space-y-3">
              {ingredientes.map((ingrediente, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insumo
                    </label>
                    <select
                      value={ingrediente.insumoId}
                      onChange={(e) => updateIngrediente(index, 'insumoId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione um insumo</option>
                      {insumos.map((insumo) => (
                        <option key={insumo.id} value={insumo.id}>
                          {insumo.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade (g)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={ingrediente.quantidadeGramas}
                      onChange={(e) => updateIngrediente(index, 'quantidadeGramas', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngrediente(index)}
                    className="text-red-600 hover:text-red-900 p-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {ingredientes.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700">
                  Custo Total Estimado: R$ {calculateCustoTotal().toFixed(2)}
                </p>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Informações Nutricionais:</p>
                  {(() => {
                    const totalNutrition = calculateNutritionalTotal()
                    const hasNutritionalData = totalNutrition.calorias > 0 || totalNutrition.proteinas > 0
                    
                    if (!hasNutritionalData) {
                      return <p className="text-xs text-gray-500">Adicione informações nutricionais aos insumos para ver os cálculos</p>
                    }
                    
                    const nutritionPerPortion = calculateNutritionPerPortion(totalNutrition, parseInt(formData.numeroPorcoes) || 1)
                    const nutritionPer100g = calculateNutritionPer100g(totalNutrition, parseFloat(formData.pesoFinalGramas) || 1)
                    
                    return (
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-medium text-gray-600 mb-1">Por Porção:</p>
                          <p>Calorias: {formatNutritionalValue(nutritionPerPortion.calorias, 'kcal')}</p>
                          <p>Proteínas: {formatNutritionalValue(nutritionPerPortion.proteinas, 'g')}</p>
                          <p>Carboidratos: {formatNutritionalValue(nutritionPerPortion.carboidratos, 'g')}</p>
                          <p>Gorduras: {formatNutritionalValue(nutritionPerPortion.gorduras, 'g')}</p>
                          <p>Fibras: {formatNutritionalValue(nutritionPerPortion.fibras, 'g')}</p>
                          <p>Sódio: {formatNutritionalValue(nutritionPerPortion.sodio, 'mg')}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600 mb-1">Por 100g:</p>
                          <p>Calorias: {formatNutritionalValue(nutritionPer100g.calorias, 'kcal')}</p>
                          <p>Proteínas: {formatNutritionalValue(nutritionPer100g.proteinas, 'g')}</p>
                          <p>Carboidratos: {formatNutritionalValue(nutritionPer100g.carboidratos, 'g')}</p>
                          <p>Gorduras: {formatNutritionalValue(nutritionPer100g.gorduras, 'g')}</p>
                          <p>Fibras: {formatNutritionalValue(nutritionPer100g.fibras, 'g')}</p>
                          <p>Sódio: {formatNutritionalValue(nutritionPer100g.sodio, 'mg')}</p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isScalingModalOpen}
        onClose={handleCloseScalingModal}
        title={`Escalar Receita: ${scalingFicha?.nome || ''}`}
        size="xl"
      >
        <div className="space-y-6">
          {scalingFicha && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Receita Original</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-700">
                <div>
                  <span className="font-medium">Porções:</span> {scalingFicha.numeroPorcoes}
                </div>
                <div>
                  <span className="font-medium">Peso:</span> {scalingFicha.pesoFinalGramas}g
                </div>
                <div>
                  <span className="font-medium">Custo:</span> R$ {scalingFicha.ingredientes.reduce((total, ing) => {
                    const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
                    return total + (custoPorGrama * ing.quantidadeGramas)
                  }, 0).toFixed(2)}
                </div>
                {scalingFicha.tempoPreparo && (
                  <div>
                    <span className="font-medium">Tempo:</span> {scalingFicha.tempoPreparo} min
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Porções Desejadas *
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={targetPortions}
                onChange={(e) => setTargetPortions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 20"
              />
              <button
                onClick={calculateScaling}
                disabled={!targetPortions || parseInt(targetPortions) <= 0}
                className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Calcular Escalabilidade
              </button>
            </div>

            {scaledData && (
              <div className="bg-green-50 p-4 rounded-md">
                <h4 className="font-medium text-green-900 mb-3">Receita Escalada</h4>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Porções:</span>
                    <span className="font-medium">{targetPortions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peso Total:</span>
                    <span className="font-medium">{scaledData.pesoTotal.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo Total:</span>
                    <span className="font-medium">R$ {scaledData.custoTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo por Porção:</span>
                    <span className="font-medium">R$ {(scaledData.custoTotal / parseInt(targetPortions)).toFixed(2)}</span>
                  </div>
                  {scaledData.tempoPreparoEscalado && (
                    <div className="flex justify-between">
                      <span>Tempo Estimado:</span>
                      <span className="font-medium">{scaledData.tempoPreparoEscalado} min</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {scaledData && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Ingredientes Escalados</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Ingrediente
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Quantidade Original
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Quantidade Escalada
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Custo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scaledData.ingredientes.map((ing, index) => {
                      const originalIng = scalingFicha?.ingredientes[index]
                      const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
                      const custoIngrediente = custoPorGrama * ing.quantidadeGramas
                      
                      return (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {ing.insumo.nome}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 text-right">
                            {originalIng?.quantidadeGramas.toFixed(1)}g
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                            {ing.quantidadeGramas.toFixed(1)}g
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 text-right">
                            R$ {custoIngrediente.toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleCloseScalingModal}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
