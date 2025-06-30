'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { FileText, Plus, Search, Edit, Trash2, X } from 'lucide-react'

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
}

interface Ingrediente {
  insumoId: string
  quantidadeGramas: number
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

  const [formData, setFormData] = useState({
    nome: '',
    categoriaId: '',
    pesoFinalGramas: '',
    numeroPorcoes: '',
    tempoPreparo: '',
    temperaturaForno: '',
    modoPreparo: '',
    nivelDificuldade: 'basico'
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
        nivelDificuldade: 'basico'
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
      if (insumo) {
        const custoPorGrama = insumo.precoUnidade / insumo.pesoLiquidoGramas
        return total + (custoPorGrama * ing.quantidadeGramas)
      }
      return total
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingFicha ? `/api/fichas-tecnicas/${editingFicha.id}` : '/api/fichas-tecnicas'
      const method = editingFicha ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ingredientes: ingredientes.filter(ing => ing.insumoId && ing.quantidadeGramas > 0)
        })
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
            <FileText className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Fichas Técnicas</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Ficha Técnica
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar fichas técnicas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'Nenhuma ficha técnica encontrada.' : 'Nenhuma ficha técnica cadastrada. Clique em "Nova Ficha Técnica" para começar.'}
                    </td>
                  </tr>
                ) : (
                  filteredFichas.map((ficha) => {
                    const custoTotal = ficha.ingredientes.reduce((total, ing) => {
                      const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
                      return total + (custoPorGrama * ing.quantidadeGramas)
                    }, 0)

                    return (
                      <tr key={ficha.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {ficha.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ficha.categoria.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ficha.numeroPorcoes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ficha.pesoFinalGramas}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          R$ {custoTotal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenModal(ficha)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ficha.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
                <option value="basico">Básico</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
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
    </DashboardLayout>
  )
}
