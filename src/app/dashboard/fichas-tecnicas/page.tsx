'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { FileText, Plus, Search, Edit, Trash2, Calculator, Download, TrendingUp, TrendingDown, Crown } from 'lucide-react'
import { convertFormDataToNumbers } from '@/lib/form-utils'

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
    quantidadeGramas: number
    insumo: {
      id: string
      nome: string
      precoUnidade: number
      pesoLiquidoGramas: number
    }
  }[]
}

interface FormDataType {
  nome: string
  categoriaId: string
  pesoFinalGramas: string
  numeroPorcoes: string
  tempoPreparo: string
  temperaturaForno: string
  modoPreparo: string
  nivelDificuldade: string
  [key: string]: string | number | undefined
}

export default function FichasTecnicasPage() {
  const [fichas, setFichas] = useState<FichaTecnica[]>([])
  const [filteredFichas, setFilteredFichas] = useState<FichaTecnica[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFicha, setEditingFicha] = useState<FichaTecnica | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false)
  const [scaleTarget, setScaleTarget] = useState<FichaTecnica | null>(null)
  const [scaleFactor, setScaleFactor] = useState('1')

  const [formData, setFormData] = useState<FormDataType>({
    nome: '',
    categoriaId: '',
    pesoFinalGramas: '',
    numeroPorcoes: '',
    tempoPreparo: '',
    temperaturaForno: '',
    modoPreparo: '',
    nivelDificuldade: 'Fácil'
  })

  const fetchFichas = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/fichas-tecnicas', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        let fichasData: FichaTecnica[] = []
        
        // Tratamento robusto de diferentes formatos de API
        if (Array.isArray(data)) {
          fichasData = data
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.data)) {
            fichasData = data.data
          } else if (Array.isArray(data.fichas)) {
            fichasData = data.fichas
          } else if (Array.isArray(data.result)) {
            fichasData = data.result
          } else if (data.success && Array.isArray(data.data)) {
            fichasData = data.data
          }
        }
        
        setFichas(Array.isArray(fichasData) ? fichasData : [])
      } else {
        console.error('Erro ao buscar fichas:', response.status, response.statusText)
        setError('Erro ao carregar fichas técnicas')
        setFichas([])
      }
    } catch (error) {
      console.error('Error fetching fichas:', error)
      setError('Erro ao conectar com o servidor')
      setFichas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFichas()
  }, [])

  useEffect(() => {
    const filtered = Array.isArray(fichas) 
      ? fichas.filter(ficha => 
          ficha.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ficha.categoria?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : []
    setFilteredFichas(filtered)
  }, [fichas, searchTerm])

  const handleOpenModal = (ficha?: FichaTecnica) => {
    if (ficha) {
      setEditingFicha(ficha)
      setFormData({
        nome: ficha.nome || '',
        categoriaId: ficha.categoriaId || '',
        pesoFinalGramas: ficha.pesoFinalGramas?.toString() || '',
        numeroPorcoes: ficha.numeroPorcoes?.toString() || '',
        tempoPreparo: ficha.tempoPreparo?.toString() || '',
        temperaturaForno: ficha.temperaturaForno?.toString() || '',
        modoPreparo: ficha.modoPreparo || '',
        nivelDificuldade: ficha.nivelDificuldade || 'Fácil'
      })
    } else {
      setEditingFicha(null)
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
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingFicha(null)
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Conversão de dados numéricos
      const numericFields = ['pesoFinalGramas', 'numeroPorcoes', 'tempoPreparo', 'temperaturaForno']
      const processedData: Record<string, unknown> = { ...formData }
      
      numericFields.forEach(field => {
        if (processedData[field] !== undefined && processedData[field] !== '' && processedData[field] !== null) {
          const numValue = parseFloat(String(processedData[field]))
          if (!isNaN(numValue) && numValue > 0) {
            processedData[field] = numValue
          } else {
            delete processedData[field]
          }
        } else {
          delete processedData[field]
        }
      })

      const url = editingFicha ? `/api/fichas-tecnicas/${editingFicha.id}` : '/api/fichas-tecnicas'
      const method = editingFicha ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      })

      if (response.ok) {
        handleCloseModal()
        // Aguardar um pouco antes de recarregar para garantir que o banco foi atualizado
        setTimeout(() => {
          fetchFichas()
        }, 500)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Erro ao salvar ficha técnica')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setError('Erro ao conectar com o servidor')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ficha técnica?')) return

    try {
      const response = await fetch(`/api/fichas-tecnicas/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchFichas()
      } else {
        setError('Erro ao excluir ficha técnica')
      }
    } catch (error) {
      console.error('Error deleting ficha:', error)
      setError('Erro ao conectar com o servidor')
    }
  }

  const calcularCustoTotal = (ficha: FichaTecnica): number => {
    if (!ficha.ingredientes || !Array.isArray(ficha.ingredientes)) {
      return 0
    }

    return ficha.ingredientes.reduce((total, ingrediente) => {
      if (!ingrediente.insumo || !ingrediente.quantidadeGramas || !ingrediente.insumo.precoUnidade || !ingrediente.insumo.pesoLiquidoGramas) {
        return total
      }
      
      const custoIngrediente = (ingrediente.quantidadeGramas / ingrediente.insumo.pesoLiquidoGramas) * ingrediente.insumo.precoUnidade
      return total + custoIngrediente
    }, 0)
  }

  const calcularPrecoSugerido = (custoTotal: number): number => {
    return custoTotal * 2.5 // Margem padrão de 150%
  }

  const calcularMargemLucro = (custoTotal: number, precoSugerido: number): number => {
    if (precoSugerido === 0) return 0
    return Math.round(((precoSugerido - custoTotal) / precoSugerido) * 100)
  }

  const getCategoryIcon = (categoria: string | null | undefined) => {
    if (!categoria || typeof categoria !== 'string') {
      return '🍽️'
    }
    
    switch (categoria.toLowerCase()) {
      case 'massas': return '🍕'
      case 'saladas': return '🥗'
      case 'carnes': return '🥩'
      case 'sobremesas': return '🍰'
      case 'bebidas': return '🥤'
      case 'aperitivos': return '🥨'
      case 'pratos principais': return '🍽️'
      default: return '🍽️'
    }
  }

  const handleOpenScaleModal = (ficha: FichaTecnica) => {
    setScaleTarget(ficha)
    setScaleFactor('1')
    setIsScaleModalOpen(true)
  }

  const handleCloseScaleModal = () => {
    setIsScaleModalOpen(false)
    setScaleTarget(null)
    setScaleFactor('1')
  }

  const handleScaleRecipe = () => {
    if (!scaleTarget) return
    
    const factor = parseFloat(scaleFactor)
    if (isNaN(factor) || factor <= 0) {
      alert('Por favor, insira um fator de escala válido')
      return
    }

    // Criar nova ficha com ingredientes escalonados
    const scaledFicha = {
      ...scaleTarget,
      nome: `${scaleTarget.nome} (x${factor})`,
      pesoFinalGramas: Math.round(scaleTarget.pesoFinalGramas * factor),
      numeroPorcoes: Math.round(scaleTarget.numeroPorcoes * factor),
      ingredientes: scaleTarget.ingredientes.map(ing => ({
        ...ing,
        quantidadeGramas: Math.round(ing.quantidadeGramas * factor)
      }))
    }

    // Abrir modal de edição com dados escalonados
    setFormData({
      nome: scaledFicha.nome,
      categoriaId: scaledFicha.categoriaId,
      pesoFinalGramas: scaledFicha.pesoFinalGramas.toString(),
      numeroPorcoes: scaledFicha.numeroPorcoes.toString(),
      tempoPreparo: scaledFicha.tempoPreparo?.toString() || '',
      temperaturaForno: scaledFicha.temperaturaForno?.toString() || '',
      modoPreparo: scaledFicha.modoPreparo,
      nivelDificuldade: scaledFicha.nivelDificuldade
    })

    handleCloseScaleModal()
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ECC71] mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando fichas técnicas...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-[#2ECC71]" />
              Fichas Técnicas
            </h1>
            <p className="text-gray-600 mt-1">Gerencie suas receitas e custos</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#2ECC71] text-white px-4 py-2 rounded-lg hover:bg-[#27AE60] transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Ficha Técnica
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar fichas técnicas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Fichas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(filteredFichas) && filteredFichas.length > 0 ? (
            filteredFichas.map((ficha) => {
              const custoTotal = calcularCustoTotal(ficha)
              const precoSugerido = calcularPrecoSugerido(custoTotal)
              const margemLucro = calcularMargemLucro(custoTotal, precoSugerido)

              return (
                <div key={ficha.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getCategoryIcon(ficha.categoria?.nome)}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{ficha.nome}</h3>
                        <p className="text-sm text-gray-500">
                          {ficha.categoria?.nome || 'Sem categoria'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenScaleModal(ficha)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Escalar receita"
                      >
                        <Calculator size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(ficha)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(ficha.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Informações Básicas */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Porções:</span>
                      <span className="font-medium">{ficha.numeroPorcoes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Peso Final:</span>
                      <span className="font-medium">{ficha.pesoFinalGramas}g</span>
                    </div>
                    {ficha.tempoPreparo && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tempo:</span>
                        <span className="font-medium">{ficha.tempoPreparo} min</span>
                      </div>
                    )}
                  </div>

                  {/* Custos */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Custo Total:</span>
                      <span className="font-medium text-red-600">R$ {custoTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Preço Sugerido:</span>
                      <span className="font-medium text-green-600">R$ {precoSugerido.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Margem:</span>
                      <span className={`font-medium flex items-center gap-1 ${margemLucro >= 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {margemLucro >= 50 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {margemLucro}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma ficha técnica encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando sua primeira ficha técnica'}
              </p>
            </div>
          )}
        </div>

        {/* Modal de Nova/Editar Ficha */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          size="xl"
          title={editingFicha ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Receita *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.categoriaId}
                  onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="1">Massas</option>
                  <option value="2">Saladas</option>
                  <option value="3">Carnes</option>
                  <option value="4">Sobremesas</option>
                  <option value="5">Bebidas</option>
                  <option value="6">Aperitivos</option>
                  <option value="7">Pratos Principais</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso Final (gramas) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.pesoFinalGramas}
                  onChange={(e) => setFormData({ ...formData, pesoFinalGramas: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Porções *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.numeroPorcoes}
                  onChange={(e) => setFormData({ ...formData, numeroPorcoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempo de Preparo (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.tempoPreparo}
                  onChange={(e) => setFormData({ ...formData, tempoPreparo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura do Forno (°C)
                </label>
                <input
                  type="number"
                  min="50"
                  max="300"
                  value={formData.temperaturaForno}
                  onChange={(e) => setFormData({ ...formData, temperaturaForno: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de Dificuldade
                </label>
                <select
                  value={formData.nivelDificuldade}
                  onChange={(e) => setFormData({ ...formData, nivelDificuldade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
                >
                  <option value="Fácil">Fácil</option>
                  <option value="Médio">Médio</option>
                  <option value="Difícil">Difícil</option>
                  <option value="Muito Difícil">Muito Difícil</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modo de Preparo
              </label>
              <textarea
                rows={4}
                value={formData.modoPreparo}
                onChange={(e) => setFormData({ ...formData, modoPreparo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
                placeholder="Descreva o modo de preparo da receita..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-colors"
              >
                {editingFicha ? 'Atualizar' : 'Criar'} Ficha Técnica
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Escalonamento */}
        <Modal 
          isOpen={isScaleModalOpen} 
          onClose={handleCloseScaleModal}
          title="Escalar Receita"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {scaleTarget?.nome}
              </h3>
              <p className="text-sm text-gray-600">
                Receita original: {scaleTarget?.numeroPorcoes} porções, {scaleTarget?.pesoFinalGramas}g
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fator de Escala
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={scaleFactor}
                onChange={(e) => setScaleFactor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
                placeholder="Ex: 2 para dobrar, 0.5 para reduzir pela metade"
              />
            </div>

            {scaleFactor && !isNaN(parseFloat(scaleFactor)) && parseFloat(scaleFactor) > 0 && scaleTarget && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Resultado:</h4>
                <p className="text-sm text-gray-600">
                  Porções: {Math.round(scaleTarget.numeroPorcoes * parseFloat(scaleFactor))}
                </p>
                <p className="text-sm text-gray-600">
                  Peso: {Math.round(scaleTarget.pesoFinalGramas * parseFloat(scaleFactor))}g
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCloseScaleModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleScaleRecipe}
                className="px-4 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-colors"
              >
                Escalar Receita
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
