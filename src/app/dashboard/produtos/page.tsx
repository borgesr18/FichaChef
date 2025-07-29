'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import ModernTable from '@/components/ui/ModernTable'
import { ShoppingCart, Plus, Search, Edit, Trash2, X, Package, TrendingUp, DollarSign, Target } from 'lucide-react'
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
        {/* Header com gradiente azul - estilo UXPilot */}
        <div className="uxpilot-header-gradient">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Produtos</h1>
                <p className="text-blue-100 mt-1">Gestão de produtos e composições</p>
              </div>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center transition-all duration-300 border border-white/20"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-medium">Novo Produto</span>
            </button>
          </div>
        </div>

        {/* Cards de métricas - estilo UXPilot */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl mr-4">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total de Produtos</p>
                  <p className="text-2xl font-bold text-slate-800">{produtos.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl mr-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Preço Médio</p>
                  <p className="text-2xl font-bold text-slate-800">
                    R$ {produtos.length > 0 ? (produtos.reduce((sum, p) => sum + p.precoVenda, 0) / produtos.length).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-xl mr-4">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Margem Média</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {produtos.length > 0 ? (produtos.reduce((sum, p) => sum + p.margemLucro, 0) / produtos.length).toFixed(1) : '0.0'}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="uxpilot-card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl mr-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Com Fichas</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {produtos.filter(p => p.produtoFichas.length > 0).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Produtos</h1>
                <p className="text-blue-100 mt-1">Gerencie produtos finais e composições</p>
              </div>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center transition-all duration-300 border border-white/20"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-medium">Novo Produto</span>
            </button>
          </div>
        </div>

        {/* Card da tabela - estilo UXPilot */}
        <div className="uxpilot-card">
          <div className="p-6 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="uxpilot-input pl-10"
              />
            </div>
          </div>

          <ModernTable
            columns={[
              { key: 'nome', label: 'Nome', sortable: true },
              { key: 'fichasTecnicas', label: 'Fichas Técnicas', sortable: false,
                render: (_, row) => {
                  const produto = row as unknown as Produto
                  return (
                    <div className="text-sm text-slate-700">
                      {produto.produtoFichas.map((f: { fichaTecnica: { nome: string }; quantidadeGramas: number }, index: number) => (
                        <div key={index} className="mb-1 p-1 rounded bg-slate-50">
                          {f.fichaTecnica.nome} ({f.quantidadeGramas}g)
                        </div>
                      ))}
                    </div>
                  )
                }},
              { key: 'pesoTotal', label: 'Peso Total', sortable: true, align: 'right',
                render: (_, row) => {
                  const produto = row as unknown as Produto
                  const pesoTotal = produto.produtoFichas.reduce((total: number, f: { quantidadeGramas: number }) => total + f.quantidadeGramas, 0)
                  return `${pesoTotal}g`
                }},
              { key: 'custoProducao', label: 'Custo Produção', sortable: true, align: 'right',
                render: (_, row) => {
                  const produto = row as unknown as Produto
                  const custoTotal = produto.produtoFichas.reduce((total: number, produtoFicha: { fichaTecnica: { ingredientes: Array<{ insumo: { precoUnidade: number; pesoLiquidoGramas: number }; quantidadeGramas: number }>; pesoFinalGramas: number }; quantidadeGramas: number }) => {
                    const fichaCusto = produtoFicha.fichaTecnica.ingredientes.reduce((fichaTotal: number, ing: { insumo: { precoUnidade: number; pesoLiquidoGramas: number }; quantidadeGramas: number }) => {
                      const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
                      return fichaTotal + (custoPorGrama * ing.quantidadeGramas)
                    }, 0)
                    const custoPorGramaFicha = fichaCusto / produtoFicha.fichaTecnica.pesoFinalGramas
                    return total + (custoPorGramaFicha * produtoFicha.quantidadeGramas)
                  }, 0)
                  return <span className="font-semibold text-green-600">R$ {custoTotal.toFixed(2)}</span>
                }},
              { key: 'margemLucro', label: 'Margem Lucro', sortable: true, align: 'right',
                render: (value) => `${value}%` },
              { key: 'precoVenda', label: 'Preço Venda', sortable: true, align: 'right',
                render: (value) => <span className="font-semibold text-blue-600">R$ {Number(value).toFixed(2)}</span> },
              { key: 'actions', label: 'Ações', align: 'center',
                render: (_, row) => (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(row as unknown as Produto)}
                      className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id as string)}
                      className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
            ]}
            data={filteredProdutos as unknown as Record<string, unknown>[]}
            searchable={false}
            pagination={true}
            pageSize={10}
            loading={loading}
          />
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FloatingLabelInput
                label="Nome do Produto"
                value={formData.nome}
                onChange={(value) => setFormData({ ...formData, nome: value })}
                required
                error={error && !formData.nome ? 'Nome é obrigatório' : ''}
              />

              <FloatingLabelInput
                label="Preço de Venda (R$)"
                type="number"
                step="0.01"
                value={formData.precoVenda}
                onChange={(value) => setFormData({ ...formData, precoVenda: value })}
                required
                error={error && !formData.precoVenda ? 'Preço é obrigatório' : ''}
              />

              <FloatingLabelInput
                label="Margem de Lucro (%)"
                type="number"
                step="0.01"
                value={formData.margemLucro}
                onChange={(value) => setFormData({ ...formData, margemLucro: value })}
                required
                error={error && !formData.margemLucro ? 'Margem é obrigatória' : ''}
              />
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
                <div key={index} className="flex items-center space-x-3 mb-3 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="flex-1">
                    <FloatingLabelSelect
                      label="Ficha Técnica"
                      value={produtoFicha.fichaTecnicaId}
                      onChange={(value) => updateProdutoFicha(index, 'fichaTecnicaId', value)}
                      options={fichasTecnicas.map(ficha => ({ 
                        value: ficha.id, 
                        label: `${ficha.nome} (${ficha.pesoFinalGramas}g)` 
                      }))}
                      required
                    />
                  </div>
                  <div className="w-32">
                    <FloatingLabelInput
                      label="Quantidade (g)"
                      type="number"
                      step="0.01"
                      value={produtoFicha.quantidadeGramas.toString()}
                      onChange={(value) => updateProdutoFicha(index, 'quantidadeGramas', parseFloat(value) || 0)}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProdutoFicha(index)}
                    className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-110"
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

            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200/60">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 font-medium hover:scale-[1.02] transform"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span className="font-medium">{editingProduto ? 'Atualizar' : 'Criar Produto'}</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
