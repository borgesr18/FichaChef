'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { ShoppingCart, Plus, Search, Edit, Trash2, X } from 'lucide-react'
import { convertFormDataToNumbers } from '@/lib/form-utils'

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

interface ProdutoFicha {
  fichaTecnicaId: string
  quantidadeGramas: number | string
}

interface Produto {
  id: string
  nome: string
  precoVenda: number
  margemLucro: number
  produtoFichas: {
    quantidadeGramas: number
    fichaTecnica: FichaTecnica
  }[]
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    precoVenda: '',
    margemLucro: ''
  })

  const [produtoFichas, setProdutoFichas] = useState<ProdutoFicha[]>([])

  useEffect(() => {
    fetchProdutos()
    fetchFichasTecnicas()
  }, [])

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos')
      if (response.ok) {
        const data = await response.json()
        setProdutos(data)
      }
    } catch (error) {
      console.error('Error fetching produtos:', error)
    }
  }

  const fetchFichasTecnicas = async () => {
    try {
      const response = await fetch('/api/fichas-tecnicas')
      if (response.ok) {
        const data = await response.json()
        setFichasTecnicas(data)
      }
    } catch (error) {
      console.error('Error fetching fichas técnicas:', error)
    }
  }

  const handleOpenModal = (produto?: Produto) => {
    if (produto) {
      setEditingProduto(produto)
      setFormData({
        nome: produto.nome,
        precoVenda: produto.precoVenda.toString(),
        margemLucro: produto.margemLucro.toString()
      })
      setProdutoFichas(produto.produtoFichas.map(f => ({
        fichaTecnicaId: f.fichaTecnica.id,
        quantidadeGramas: f.quantidadeGramas
      })))
    } else {
      setEditingProduto(null)
      setFormData({
        nome: '',
        precoVenda: '',
        margemLucro: ''
      })
      setProdutoFichas([])
    }
    setIsModalOpen(true)
    setError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduto(null)
    setError('')
  }

  const addProdutoFicha = () => {
    setProdutoFichas([...produtoFichas, { fichaTecnicaId: '', quantidadeGramas: 0 }])
  }

  const removeProdutoFicha = (index: number) => {
    setProdutoFichas(produtoFichas.filter((_, i) => i !== index))
  }

  const updateProdutoFicha = (index: number, field: keyof ProdutoFicha, value: string | number) => {
    const updated = [...produtoFichas]
    updated[index] = { ...updated[index], [field]: value } as ProdutoFicha
    setProdutoFichas(updated)
  }

  const calculateProdutoCusto = () => {
    return produtoFichas.reduce((total, produtoFicha) => {
      const ficha = fichasTecnicas.find(f => f.id === produtoFicha.fichaTecnicaId)
      if (ficha && produtoFicha.quantidadeGramas) {
        const fichaCusto = ficha.ingredientes.reduce((fichaTotal, ing) => {
          const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
          return fichaTotal + (custoPorGrama * ing.quantidadeGramas)
        }, 0)
        const custoPorGramaFicha = fichaCusto / ficha.pesoFinalGramas
        const quantidade = typeof produtoFicha.quantidadeGramas === 'string' ? parseFloat(produtoFicha.quantidadeGramas) || 0 : produtoFicha.quantidadeGramas
        return total + (custoPorGramaFicha * quantidade)
      }
      return total
    }, 0)
  }

  const calculateProdutoPeso = () => {
    return produtoFichas.reduce((total, produtoFicha) => {
      const quantidade = typeof produtoFicha.quantidadeGramas === 'string' ? parseFloat(produtoFicha.quantidadeGramas) || 0 : produtoFicha.quantidadeGramas
      return total + (quantidade || 0)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingProduto ? `/api/produtos/${editingProduto.id}` : '/api/produtos'
      const method = editingProduto ? 'PUT' : 'POST'

      const convertedFormData = convertFormDataToNumbers(formData, ['precoVenda', 'margemLucro'])

      const dataToSend = {
        ...convertedFormData,
        fichas: produtoFichas
          .filter(f => f.fichaTecnicaId && f.quantidadeGramas && (typeof f.quantidadeGramas === 'string' ? parseFloat(f.quantidadeGramas) > 0 : f.quantidadeGramas > 0))
          .map(f => ({
            fichaTecnicaId: f.fichaTecnicaId,
            quantidadeGramas: typeof f.quantidadeGramas === 'string' ? parseFloat(f.quantidadeGramas) || 0 : f.quantidadeGramas
          }))
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (response.ok) {
        handleCloseModal()
        fetchProdutos()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar produto')
      }
    } catch {
      setError('Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const response = await fetch(`/api/produtos/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchProdutos()
      }
    } catch (error) {
      console.error('Error deleting produto:', error)
    }
  }

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingCart className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Produtos Prontos</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar produtos..."
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
                    Fichas Técnicas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peso Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo Produção
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margem Lucro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Venda
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProdutos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Nenhum produto cadastrado. Clique em &quot;Novo Produto&quot; para começar.
                    </td>
                  </tr>
                ) : (
                  filteredProdutos.map((produto) => {
                    const custoTotal = produto.produtoFichas.reduce((total, produtoFicha) => {
                      const fichaCusto = produtoFicha.fichaTecnica.ingredientes.reduce((fichaTotal, ing) => {
                        const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
                        return fichaTotal + (custoPorGrama * ing.quantidadeGramas)
                      }, 0)
                      const custoPorGramaFicha = fichaCusto / produtoFicha.fichaTecnica.pesoFinalGramas
                      return total + (custoPorGramaFicha * produtoFicha.quantidadeGramas)
                    }, 0)

                    const pesoTotal = produto.produtoFichas.reduce((total, f) => total + f.quantidadeGramas, 0)

                    return (
                      <tr key={produto.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {produto.produtoFichas.map((f, index) => (
                              <div key={index} className="mb-1">
                                {f.fichaTecnica.nome} ({f.quantidadeGramas}g)
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pesoTotal}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          R$ {custoTotal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {produto.margemLucro}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          R$ {produto.precoVenda.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenModal(produto)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(produto.id)}
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

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingProduto ? 'Editar Produto' : 'Novo Produto'}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
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
                  Preço de Venda (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precoVenda}
                  onChange={(e) => setFormData({ ...formData, precoVenda: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margem de Lucro (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.margemLucro}
                  onChange={(e) => setFormData({ ...formData, margemLucro: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Fichas Técnicas</h3>
                <button
                  type="button"
                  onClick={addProdutoFicha}
                  className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Ficha
                </button>
              </div>

              {produtoFichas.map((produtoFicha, index) => (
                <div key={index} className="flex items-center space-x-3 mb-3 p-3 border border-gray-200 rounded-md">
                  <div className="flex-1">
                    <select
                      value={produtoFicha.fichaTecnicaId}
                      onChange={(e) => updateProdutoFicha(index, 'fichaTecnicaId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Selecione uma ficha técnica</option>
                      {fichasTecnicas.map((ficha) => (
                        <option key={ficha.id} value={ficha.id}>
                          {ficha.nome} ({ficha.pesoFinalGramas}g)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Quantidade (g)"
                      value={produtoFicha.quantidadeGramas}
                      onChange={(e) => updateProdutoFicha(index, 'quantidadeGramas', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProdutoFicha(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}

              {produtoFichas.length === 0 && (
                <p className="text-gray-500 text-sm">
                  Nenhuma ficha técnica adicionada. Clique em &quot;Adicionar Ficha&quot; para começar.
                </p>
              )}
            </div>

            {produtoFichas.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Peso Total:</span> {calculateProdutoPeso()}g
                  </div>
                  <div>
                    <span className="font-medium">Custo Total:</span> R$ {calculateProdutoCusto().toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : editingProduto ? 'Atualizar' : 'Criar Produto'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
