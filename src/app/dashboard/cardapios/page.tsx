'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { Calendar, Plus, Search, Edit, Trash2, X, Clock } from 'lucide-react'
import { calculateMenuCost } from '@/lib/utils'
import { calculateTotalNutrition, formatNutritionalValue } from '@/lib/nutritional-utils'

interface Produto {
  id: string
  nome: string
  precoVenda: number
  produtoFichas: {
    quantidadeGramas: number
    fichaTecnica: {
      pesoFinalGramas: number
      ingredientes: {
        quantidadeGramas: number
        insumo: {
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
  }[]
}

interface MenuItem {
  produtoId: string
  quantidade: number | string
  observacoes?: string
}

interface Menu {
  id: string
  nome: string
  descricao?: string
  tipo: string
  ativo: boolean
  itens: {
    quantidade: number
    observacoes?: string
    produto: Produto
  }[]
  periodos: {
    id: string
    dataInicio: string
    dataFim: string
    tipo: string
    ativo: boolean
  }[]
}

export default function CardapiosPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPeriodoModalOpen, setIsPeriodoModalOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [selectedMenuForPeriodo, setSelectedMenuForPeriodo] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'almoco'
  })

  const [menuItens, setMenuItens] = useState<MenuItem[]>([])

  const [periodoData, setPeriodoData] = useState({
    dataInicio: '',
    dataFim: '',
    tipo: 'semanal',
    observacoes: ''
  })

  useEffect(() => {
    fetchMenus()
    fetchProdutos()
  }, [])

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/menus')
      if (response.ok) {
        const data = await response.json()
        setMenus(data)
      }
    } catch (error) {
      console.error('Error fetching menus:', error)
    }
  }

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

  const handleOpenModal = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu)
      setFormData({
        nome: menu.nome,
        descricao: menu.descricao || '',
        tipo: menu.tipo
      })
      setMenuItens(menu.itens.map(item => ({
        produtoId: item.produto.id,
        quantidade: item.quantidade,
        observacoes: item.observacoes
      })))
    } else {
      setEditingMenu(null)
      setFormData({
        nome: '',
        descricao: '',
        tipo: 'almoco'
      })
      setMenuItens([])
    }
    setIsModalOpen(true)
    setError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingMenu(null)
    setError('')
  }

  const handleOpenPeriodoModal = (menu: Menu) => {
    setSelectedMenuForPeriodo(menu)
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    
    setPeriodoData({
      dataInicio: today.toISOString().split('T')[0] || '',
      dataFim: nextWeek.toISOString().split('T')[0] || '',
      tipo: 'semanal',
      observacoes: ''
    })
    setIsPeriodoModalOpen(true)
  }

  const addMenuItem = () => {
    setMenuItens([...menuItens, { produtoId: '', quantidade: 1, observacoes: '' }])
  }

  const removeMenuItem = (index: number) => {
    setMenuItens(menuItens.filter((_, i) => i !== index))
  }

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string | number) => {
    const updated = [...menuItens]
    updated[index] = { ...updated[index], [field]: value } as MenuItem
    setMenuItens(updated)
  }

  const calculateMenuCostTotal = () => {
    return menuItens.reduce((total, menuItem) => {
      const produto = produtos.find(p => p.id === menuItem.produtoId)
      if (produto && menuItem.quantidade) {
        const produtoCusto = produto.produtoFichas.reduce((produtoTotal, produtoFicha) => {
          const fichaCusto = produtoFicha.fichaTecnica.ingredientes.reduce((fichaTotal, ing) => {
            const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
            return fichaTotal + (custoPorGrama * ing.quantidadeGramas)
          }, 0)
          const custoPorGramaFicha = fichaCusto / produtoFicha.fichaTecnica.pesoFinalGramas
          return produtoTotal + (custoPorGramaFicha * produtoFicha.quantidadeGramas)
        }, 0)
        const quantidade = typeof menuItem.quantidade === 'string' ? parseFloat(menuItem.quantidade) || 0 : menuItem.quantidade
        return total + (produtoCusto * quantidade)
      }
      return total
    }, 0)
  }

  const calculateMenuNutritionalTotal = (menuItens: { quantidade: number; observacoes?: string; produto: Produto }[]) => {
    return menuItens.reduce((total, menuItem) => {
      const produto = menuItem.produto
      if (produto && menuItem.quantidade) {
        const produtoNutrition = produto.produtoFichas.reduce((produtoTotal, produtoFicha) => {
          const fichaNutrition = calculateTotalNutrition(produtoFicha.fichaTecnica.ingredientes.map(ing => ({
            quantidadeGramas: ing.quantidadeGramas,
            insumo: {
              id: 'insumo-' + Math.random(),
              nome: 'Insumo',
              pesoLiquidoGramas: ing.insumo.pesoLiquidoGramas,
              calorias: ing.insumo.calorias || 0,
              proteinas: ing.insumo.proteinas || 0,
              carboidratos: ing.insumo.carboidratos || 0,
              gorduras: ing.insumo.gorduras || 0,
              fibras: ing.insumo.fibras || 0,
              sodio: ing.insumo.sodio || 0
            }
          })))
          const nutritionPerGramaFicha = {
            calorias: fichaNutrition.calorias / produtoFicha.fichaTecnica.pesoFinalGramas,
            proteinas: fichaNutrition.proteinas / produtoFicha.fichaTecnica.pesoFinalGramas,
            carboidratos: fichaNutrition.carboidratos / produtoFicha.fichaTecnica.pesoFinalGramas,
            gorduras: fichaNutrition.gorduras / produtoFicha.fichaTecnica.pesoFinalGramas,
            fibras: fichaNutrition.fibras / produtoFicha.fichaTecnica.pesoFinalGramas,
            sodio: fichaNutrition.sodio / produtoFicha.fichaTecnica.pesoFinalGramas
          }
          return {
            calorias: produtoTotal.calorias + (nutritionPerGramaFicha.calorias * produtoFicha.quantidadeGramas),
            proteinas: produtoTotal.proteinas + (nutritionPerGramaFicha.proteinas * produtoFicha.quantidadeGramas),
            carboidratos: produtoTotal.carboidratos + (nutritionPerGramaFicha.carboidratos * produtoFicha.quantidadeGramas),
            gorduras: produtoTotal.gorduras + (nutritionPerGramaFicha.gorduras * produtoFicha.quantidadeGramas),
            fibras: produtoTotal.fibras + (nutritionPerGramaFicha.fibras * produtoFicha.quantidadeGramas),
            sodio: produtoTotal.sodio + (nutritionPerGramaFicha.sodio * produtoFicha.quantidadeGramas)
          }
        }, { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, fibras: 0, sodio: 0 })
        
        const quantidade = typeof menuItem.quantidade === 'string' ? parseFloat(menuItem.quantidade) || 0 : menuItem.quantidade
        return {
          calorias: total.calorias + (produtoNutrition.calorias * quantidade),
          proteinas: total.proteinas + (produtoNutrition.proteinas * quantidade),
          carboidratos: total.carboidratos + (produtoNutrition.carboidratos * quantidade),
          gorduras: total.gorduras + (produtoNutrition.gorduras * quantidade),
          fibras: total.fibras + (produtoNutrition.fibras * quantidade),
          sodio: total.sodio + (produtoNutrition.sodio * quantidade)
        }
      }
      return total
    }, { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, fibras: 0, sodio: 0 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingMenu ? `/api/menus/${editingMenu.id}` : '/api/menus'
      const method = editingMenu ? 'PUT' : 'POST'

      const dataToSend = {
        ...formData,
        itens: menuItens
          .filter(item => item.produtoId && item.quantidade && (typeof item.quantidade === 'string' ? parseFloat(item.quantidade) > 0 : item.quantidade > 0))
          .map(item => ({
            produtoId: item.produtoId,
            quantidade: typeof item.quantidade === 'string' ? parseInt(item.quantidade) || 1 : item.quantidade,
            observacoes: item.observacoes
          }))
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (response.ok) {
        handleCloseModal()
        fetchMenus()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar cardápio')
      }
    } catch {
      setError('Erro ao salvar cardápio')
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMenuForPeriodo) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/menu-periodos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuId: selectedMenuForPeriodo.id,
          dataInicio: periodoData.dataInicio,
          dataFim: periodoData.dataFim,
          tipo: periodoData.tipo,
          observacoes: periodoData.observacoes
        })
      })

      if (response.ok) {
        setIsPeriodoModalOpen(false)
        setSelectedMenuForPeriodo(null)
        fetchMenus()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar período')
      }
    } catch {
      setError('Erro ao salvar período')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cardápio?')) return

    try {
      const response = await fetch(`/api/menus/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchMenus()
      }
    } catch (error) {
      console.error('Error deleting menu:', error)
    }
  }

  const filteredMenus = menus.filter(menu =>
    menu.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tipoLabels = {
    cafe_manha: 'Café da Manhã',
    almoco: 'Almoço',
    jantar: 'Jantar',
    lanche: 'Lanche'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mr-3 transform transition-transform duration-200 hover:scale-110">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Planejamento de Cardápios</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center shadow-elegant hover:shadow-glow-orange transform transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 group btn-modern"
          >
            <Plus className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:rotate-90" />
            Novo Cardápio
          </button>
        </div>

        <div className="glass-morphism rounded-2xl shadow-floating border border-white/20 hover:shadow-floating transition-all duration-300 card-modern">
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors duration-200 group-focus-within:text-orange-500" />
                  <input
                    type="text"
                    placeholder="Buscar cardápios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-slate-50/50 hover:bg-white focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cardápio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Itens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Informações Nutricionais
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Períodos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMenus.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
                        <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full">
                          <Calendar className="h-12 w-12 text-orange-500 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-slate-600 font-medium text-lg">
                            {searchTerm ? 'Nenhum cardápio encontrado.' : 'Nenhum cardápio cadastrado.'}
                          </p>
                          {!searchTerm && (
                            <p className="text-slate-500 text-sm animate-pulse">
                              Clique em &quot;Novo Cardápio&quot; para começar.
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMenus.map((menu) => {
                  const custoTotal = calculateMenuCost(menu.itens)
                  
                  return (
                    <tr key={menu.id} className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-transparent transition-all duration-200 hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5 cursor-pointer group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900 group-hover:text-orange-700 transition-colors duration-200">{menu.nome}</div>
                          {menu.descricao && (
                            <div className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-200">{menu.descricao}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 group-hover:from-orange-100 group-hover:to-orange-200 group-hover:text-orange-800 transition-all duration-200 shadow-sm">
                          {tipoLabels[menu.tipo as keyof typeof tipoLabels]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 group-hover:text-slate-800 transition-colors duration-200">
                        {menu.itens.length} produtos
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 group-hover:text-green-700 transition-colors duration-200">
                        R$ {custoTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-200">
                        {(() => {
                          const nutrition = calculateMenuNutritionalTotal(menu.itens)
                          const hasNutritionalData = nutrition.calorias > 0 || nutrition.proteinas > 0
                          
                          if (!hasNutritionalData) {
                            return <span className="text-slate-400 text-xs group-hover:text-slate-500 transition-colors duration-200">Sem dados nutricionais</span>
                          }
                          
                          return (
                            <div className="space-y-1 text-xs">
                              <div className="p-1 rounded bg-slate-50 group-hover:bg-orange-50 transition-colors duration-200">Calorias: {formatNutritionalValue(nutrition.calorias, 'kcal')}</div>
                              <div className="p-1 rounded bg-slate-50 group-hover:bg-orange-50 transition-colors duration-200">Proteínas: {formatNutritionalValue(nutrition.proteinas, 'g')}</div>
                              <div className="p-1 rounded bg-slate-50 group-hover:bg-orange-50 transition-colors duration-200">Carboidratos: {formatNutritionalValue(nutrition.carboidratos, 'g')}</div>
                              <div className="p-1 rounded bg-slate-50 group-hover:bg-orange-50 transition-colors duration-200">Gorduras: {formatNutritionalValue(nutrition.gorduras, 'g')}</div>
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 group-hover:text-slate-800 transition-colors duration-200">
                        {menu.periodos.length} períodos
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm transition-all duration-200 ${
                          menu.ativo  
                            ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 group-hover:from-green-200 group-hover:to-green-300' 
                            : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 group-hover:from-red-200 group-hover:to-red-300'
                        }`}>
                          {menu.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleOpenPeriodoModal(menu)}
                            className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                            title="Planejar Período"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(menu)}
                            className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(menu.id)}
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
        title={editingMenu ? 'Editar Cardápio' : 'Novo Cardápio'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Cardápio *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Cardápio Executivo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Refeição *
              </label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cafe_manha">Café da Manhã</option>
                <option value="almoco">Almoço</option>
                <option value="jantar">Jantar</option>
                <option value="lanche">Lanche</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descrição opcional do cardápio"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Produtos do Cardápio</h4>
              <button
                type="button"
                onClick={addMenuItem}
                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Produto
              </button>
            </div>

            {menuItens.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 mb-3 p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <select
                    value={item.produtoId}
                    onChange={(e) => updateMenuItem(index, 'produtoId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione um produto</option>
                    {produtos.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) => updateMenuItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Qtd"
                    required
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.observacoes || ''}
                    onChange={(e) => updateMenuItem(index, 'observacoes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observações"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeMenuItem(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {menuItens.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Custo Total Estimado:</span>
                  <span className="text-lg font-bold text-blue-900">
                    R$ {calculateMenuCostTotal().toFixed(2)}
                  </span>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Salvando...' : editingMenu ? 'Atualizar' : 'Criar Cardápio'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isPeriodoModalOpen}
        onClose={() => setIsPeriodoModalOpen(false)}
        title={`Planejar Período - ${selectedMenuForPeriodo?.nome}`}
        size="lg"
      >
        <form onSubmit={handlePeriodoSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                required
                value={periodoData.dataInicio}
                onChange={(e) => setPeriodoData({ ...periodoData, dataInicio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Fim *
              </label>
              <input
                type="date"
                required
                value={periodoData.dataFim}
                onChange={(e) => setPeriodoData({ ...periodoData, dataFim: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Período *
            </label>
            <select
              required
              value={periodoData.tipo}
              onChange={(e) => setPeriodoData({ ...periodoData, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={periodoData.observacoes}
              onChange={(e) => setPeriodoData({ ...periodoData, observacoes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Observações sobre o período"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsPeriodoModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Salvando...' : 'Criar Período'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
