'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { Calendar, Plus, Search, Edit, Trash2, X, Clock, TrendingUp, Users, ChefHat, DollarSign } from 'lucide-react'
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

  // Funções auxiliares para o design
  const getMenuIcon = (tipo: string) => {
    const icons = {
      'cafe_manha': '☕',
      'almoco': '🍽️',
      'jantar': '🌙',
      'lanche': '🥪'
    }
    return icons[tipo as keyof typeof icons] || '🍽️'
  }

  // Estatísticas
  const getStats = () => {
    const totalMenus = menus.length
    const menusAtivos = menus.filter(menu => menu.ativo).length
    const totalPeriodos = menus.reduce((sum, menu) => sum + menu.periodos.length, 0)
    const custoMedio = menus.length > 0 ? 
      menus.reduce((sum, menu) => sum + calculateMenuCost(menu.itens), 0) / menus.length : 0

    return { totalMenus, menusAtivos, totalPeriodos, custoMedio }
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

  const stats = getStats()

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent">
                Planejamento de Cardápios
              </h1>
              <p className="text-gray-600 text-lg">Gerencie cardápios e períodos de servimento</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-lg transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 flex items-center group"
            >
              <Plus className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:rotate-90" />
              Novo Cardápio
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total de Cardápios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMenus}</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Cadastrados
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Cardápios Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.menusAtivos}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Em uso
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
                <p className="text-sm font-medium text-gray-600">Períodos Planejados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPeriodos}</p>
                <p className="text-xs text-orange-600 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Agendados
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Custo Médio</p>
                <p className="text-2xl font-bold text-gray-900">R$ {stats.custoMedio.toFixed(2)}</p>
                <p className="text-xs text-purple-600 flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Por cardápio
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar cardápios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full bg-white/70 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Cardápios */}
        {filteredMenus.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-16 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {searchTerm ? 'Nenhum cardápio encontrado' : 'Nenhum cardápio cadastrado'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando seu primeiro cardápio'}
                </p>
              </div>
              {!searchTerm && (
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeiro Cardápio
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenus.map((menu) => {
              const custoTotal = calculateMenuCost(menu.itens)
              const nutrition = calculateMenuNutritionalTotal(menu.itens)
              const hasNutritionalData = nutrition.calorias > 0 || nutrition.proteinas > 0
              
              return (
                <div
                  key={menu.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Barra colorida */}
                  <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                  
                  <div className="p-6">
                    {/* Header do card */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getMenuIcon(menu.tipo)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">{menu.nome}</h3>
                          <p className="text-sm text-gray-500">
                            {tipoLabels[menu.tipo as keyof typeof tipoLabels]}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        menu.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {menu.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    {/* Descrição */}
                    {menu.descricao && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{menu.descricao}</p>
                    )}

                    {/* Informações principais */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Produtos:</span>
                        <span className="font-semibold text-gray-900">{menu.itens.length}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Custo Total:</span>
                        <span className="font-semibold text-green-600">R$ {custoTotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Períodos:</span>
                        <span className="font-medium text-gray-700">{menu.periodos.length}</span>
                      </div>
                    </div>

                    {/* Informações nutricionais */}
                    {hasNutritionalData && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                          <ChefHat className="h-4 w-4 mr-2 text-blue-600" />
                          Informações Nutricionais
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Calorias:</span>
                            <div className="font-medium text-gray-900">{formatNutritionalValue(nutrition.calorias, 'kcal')}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Proteínas:</span>
                            <div className="font-medium text-gray-900">{formatNutritionalValue(nutrition.proteinas, 'g')}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Carboidratos:</span>
                            <div className="font-medium text-gray-900">{formatNutritionalValue(nutrition.carboidratos, 'g')}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Gorduras:</span>
                            <div className="font-medium text-gray-900">{formatNutritionalValue(nutrition.gorduras, 'g')}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botões de ação */}
                    <div className="flex space-x-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleOpenPeriodoModal(menu)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center text-sm"
                        title="Planejar Período"
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Período
                      </button>
                      <button
                        onClick={() => handleOpenModal(menu)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center text-sm"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(menu.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Cardápio */}
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
                    placeholder="Observações (opcional)"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeMenuItem(index)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {menuItens.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum produto adicionado ainda.</p>
                <p className="text-sm">Clique em "Adicionar Produto" para começar.</p>
              </div>
            )}
          </div>

          {menuItens.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Resumo do Cardápio</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div><span className="font-medium">Total de produtos:</span> {menuItens.filter(item => item.produtoId).length}</div>
                <div><span className="font-medium">Custo estimado:</span> R$ {calculateMenuCostTotal().toFixed(2)}</div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
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
              {loading ? 'Salvando...' : editingMenu ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Período */}
      <Modal
        isOpen={isPeriodoModalOpen}
        onClose={() => setIsPeriodoModalOpen(false)}
        title={`Planejar Período - ${selectedMenuForPeriodo?.nome}`}
        size="lg"
      >
        <form onSubmit={handlePeriodoSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

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
              <option value="especial">Especial</option>
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
              placeholder="Observações sobre este período (opcional)"
            />
          </div>

          <div className="flex justify-end space-x-3">
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Criar Período'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
