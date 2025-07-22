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
            <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mr-3 transform transition-transform duration-200 hover:scale-110">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Produtos Prontos</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
          >
            <Plus className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:rotate-90" />
            Novo Produto
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300">
          <div className="p-6 border-b border-slate-200/60">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors duration-200 group-focus-within:text-orange-500" />
              <input
                type="text"
                placeholder="Buscar produtos..."
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
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
                        <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full">
                          <ShoppingCart className="h-12 w-12 text-orange-500 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-slate-600 font-medium text-lg">
                            Nenhum produto cadastrado.
                          </p>
                          <p className="text-slate-500 text-sm animate-pulse">
                            Clique em &quot;Novo Produto&quot; para começar.
                          </p>
                        </div>
                      </div>
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
                      <tr key={produto.id} className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-transparent transition-all duration-200 hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5 cursor-pointer group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900 group-hover:text-orange-700 transition-colors duration-200">{produto.nome}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-700 group-hover:text-slate-800 transition-colors duration-200">
                            {produto.produtoFichas.map((f, index) => (
                              <div key={index} className="mb-1 p-1 rounded bg-slate-50 group-hover:bg-orange-50 transition-colors duration-200">
                                {f.fichaTecnica.nome} ({f.quantidadeGramas}g)
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-200">
                          {pesoTotal}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 group-hover:text-green-700 transition-colors duration-200">
                          R$ {custoTotal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-200">
                          {produto.margemLucro}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                          R$ {produto.precoVenda.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleOpenModal(produto)}
                              className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(produto.id)}
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
