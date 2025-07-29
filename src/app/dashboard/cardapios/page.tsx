'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { Calendar, Plus, Search, Edit, Trash2, X, Clock, TrendingUp, ChefHat, DollarSign } from 'lucide-react'
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

const FloatingLabelInput = ({ label, value, onChange, type = "text", required = false, className = "" }: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  className?: string
}) => {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  
  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className="peer w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
      />
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
        focused || hasValue 
          ? 'top-1 text-xs text-[#5AC8FA] font-medium' 
          : 'top-3 text-gray-500'
      }`}>
        {label}
      </label>
    </div>
  )
}

const FloatingLabelTextarea = ({ label, value, onChange, required = false, className = "" }: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  required?: boolean
  className?: string
}) => {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  
  return (
    <div className={`relative ${className}`}>
      <textarea
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        rows={3}
        className="peer w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200 resize-none"
      />
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
        focused || hasValue 
          ? 'top-1 text-xs text-[#5AC8FA] font-medium' 
          : 'top-3 text-gray-500'
      }`}>
        {label}
      </label>
    </div>
  )
}

const FloatingLabelSelect = ({ label, value, onChange, options, required = false, className = "" }: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
  required?: boolean
  className?: string
}) => {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className="peer w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200 appearance-none"
      >
        <option value="">Selecione...</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
        focused || hasValue 
          ? 'top-1 text-xs text-[#5AC8FA] font-medium' 
          : 'top-3 text-gray-500'
      }`}>
        {label}
      </label>
    </div>
  )
}

export default function CardapiosPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPeriodoModalOpen, setIsPeriodoModalOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'almoco',
    ativo: true
  })

  const [menuItens, setMenuItens] = useState<MenuItem[]>([])

  const [periodoData, setPeriodoData] = useState({
    nome: '',
    dataInicio: '',
    dataFim: '',
    tipo: 'semanal',
    observacoes: '',
    menuId: ''
  })

  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const tiposMenu = [
    { value: 'cafe_manha', label: 'Café da Manhã' },
    { value: 'almoco', label: 'Almoço' },
    { value: 'jantar', label: 'Jantar' },
    { value: 'lanche', label: 'Lanche' }
  ]

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

  const getMenuIcon = (tipo: string) => {
    const icons: { [key: string]: string } = {
      'cafe_manha': '☕',
      'almoco': '🍽️',
      'jantar': '🌙',
      'lanche': '🥪'
    }
    return icons[tipo] || '📋'
  }

  const getStats = () => {
    const totalMenus = menus.length
    const menusAtivos = menus.filter(m => m.ativo).length
    const periodosAtivos = menus.reduce((acc, menu) => acc + menu.periodos.length, 0)
    const custoMedio = menus.length > 0 ? 
      menus.reduce((acc, menu) => acc + calculateMenuCost(menu.itens), 0) / menus.length : 0

    return {
      totalMenus,
      menusAtivos,
      periodosAtivos,
      custoMedio
    }
  }

  const stats = getStats()

  const handleOpenModal = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu)
      setFormData({
        nome: menu.nome,
        descricao: menu.descricao || '',
        tipo: menu.tipo,
        ativo: menu.ativo
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
        tipo: 'almoco',
        ativo: true
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
    setSelectedProduct('')
    setQuantidade('')
    setObservacoes('')
  }

  const handleOpenPeriodoModal = (menu: Menu) => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    
    setPeriodoData({
      nome: `Período - ${menu.nome}`,
      dataInicio: today.toISOString().split('T')[0] || '',
      dataFim: nextWeek.toISOString().split('T')[0] || '',
      tipo: 'semanal',
      observacoes: '',
      menuId: menu.id
    })
    setIsPeriodoModalOpen(true)
  }

  const handleClosePeriodoModal = () => {
    setIsPeriodoModalOpen(false)
    setPeriodoData({
      nome: '',
      dataInicio: '',
      dataFim: '',
      tipo: 'semanal',
      observacoes: '',
      menuId: ''
    })
  }

  const addMenuItem = () => {
    if (selectedProduct && quantidade) {
      const newItem: MenuItem = {
        produtoId: selectedProduct,
        quantidade: parseFloat(quantidade),
        observacoes
      }
      setMenuItens(prev => [...prev, newItem])
      setSelectedProduct('')
      setQuantidade('')
      setObservacoes('')
    }
  }

  const removeMenuItem = (index: number) => {
    setMenuItens(prev => prev.filter((_, i) => i !== index))
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
    if (!periodoData.menuId) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/menu-periodos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(periodoData)
      })

      if (response.ok) {
        handleClosePeriodoModal()
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
    menu.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tipoLabels = {
    cafe_manha: 'Café da Manhã',
    almoco: 'Almoço',
    jantar: 'Jantar',
    lanche: 'Lanche'
  }

  if (loading && menus.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2E4B] mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando cardápios...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent">
                  Cardápios
                </h1>
                <p className="text-gray-600 mt-1">Gerencie seus cardápios e períodos de servimento</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Plus size={20} />
                  Novo Cardápio
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Cardápios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMenus}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Calendar className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Cardápios Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.menusAtivos}</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Períodos Planejados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.periodosAtivos}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl">
                <Clock className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Custo Médio</p>
                <p className="text-2xl font-bold text-gray-900">R$ {stats.custoMedio.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar cardápios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Lista de Cardápios */}
        {filteredMenus.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cardápio encontrado</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro cardápio.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => handleOpenModal()}
                className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
              >
                Criar Primeiro Cardápio
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenus.map((menu) => {
              const nutrition = calculateMenuNutritionalTotal(menu.itens)
              const custoTotal = calculateMenuCost(menu.itens)

              return (
                <div key={menu.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:-translate-y-1 transition-all duration-200">
                  {/* Barra colorida */}
                  <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                  
                  <div className="p-6">
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getMenuIcon(menu.tipo)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{menu.nome}</h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {tiposMenu.find(t => t.value === menu.tipo)?.label || menu.tipo}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        menu.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {menu.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    {/* Descrição */}
                    {menu.descricao && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{menu.descricao}</p>
                    )}

                    {/* Informações do Menu */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Itens no cardápio:</span>
                        <span className="font-medium">{menu.itens.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Custo total:</span>
                        <span className="font-medium text-green-600">R$ {custoTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Períodos:</span>
                        <span className="font-medium">{menu.periodos.length}</span>
                      </div>
                    </div>

                    {/* Informações Nutricionais */}
                    {nutrition.calorias > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ChefHat size={16} className="text-[#5AC8FA]" />
                          <span className="text-sm font-medium text-gray-700">Informações Nutricionais</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Calorias:</span>
                            <span className="ml-1 font-medium">{formatNutritionalValue(nutrition.calorias)} kcal</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Proteínas:</span>
                            <span className="ml-1 font-medium">{formatNutritionalValue(nutrition.proteinas)}g</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Carboidratos:</span>
                            <span className="ml-1 font-medium">{formatNutritionalValue(nutrition.carboidratos)}g</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Gorduras:</span>
                            <span className="ml-1 font-medium">{formatNutritionalValue(nutrition.gorduras)}g</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(menu)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleOpenPeriodoModal(menu)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Clock size={16} />
                        Período
                      </button>
                      <button
                        onClick={() => handleDelete(menu.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-200 text-sm font-medium flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal de Cardápio */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMenu ? 'Editar Cardápio' : 'Novo Cardápio'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelInput
                label="Nome do Cardápio"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
              <FloatingLabelSelect
                label="Tipo de Refeição"
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                options={tiposMenu}
                required
              />
            </div>

            <FloatingLabelTextarea
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                className="w-4 h-4 text-[#5AC8FA] border-gray-300 rounded focus:ring-[#5AC8FA]"
              />
              <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
                Cardápio ativo
              </label>
            </div>

            {/* Seção de Itens do Menu */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Itens do Cardápio</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FloatingLabelSelect
                  label="Produto"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  options={produtos.map(p => ({ value: p.id, label: p.nome }))}
                />
                <FloatingLabelInput
                  label="Quantidade"
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
                <button
                  type="button"
                  onClick={addMenuItem}
                  disabled={!selectedProduct || !quantidade}
                  className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-4 py-3 rounded-lg hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Adicionar
                </button>
              </div>

              <FloatingLabelInput
                label="Observações (opcional)"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />

              {/* Lista de Itens Adicionados */}
              {menuItens.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Itens adicionados:</h4>
                  <div className="space-y-2">
                    {menuItens.map((item, index) => {
                      const produto = produtos.find(p => p.id === item.produtoId)
                      return (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <span className="font-medium">{produto?.nome}</span>
                            <span className="text-gray-600 ml-2">- Qtd: {item.quantidade}</span>
                            {item.observacoes && (
                              <span className="text-gray-500 text-sm block">Obs: {item.observacoes}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMenuItem(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
              >
                {loading ? 'Salvando...' : (editingMenu ? 'Atualizar' : 'Criar')} Cardápio
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Período */}
        <Modal isOpen={isPeriodoModalOpen} onClose={handleClosePeriodoModal} title="Novo Período">
          <form onSubmit={handlePeriodoSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <FloatingLabelInput
              label="Nome do Período"
              value={periodoData.nome}
              onChange={(e) => setPeriodoData(prev => ({ ...prev, nome: e.target.value }))}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelInput
                label="Data de Início"
                type="date"
                value={periodoData.dataInicio}
                onChange={(e) => setPeriodoData(prev => ({ ...prev, dataInicio: e.target.value }))}
                required
              />
              <FloatingLabelInput
                label="Data de Fim"
                type="date"
                value={periodoData.dataFim}
                onChange={(e) => setPeriodoData(prev => ({ ...prev, dataFim: e.target.value }))}
                required
              />
            </div>

            <FloatingLabelSelect
              label="Tipo de Período"
              value={periodoData.tipo}
              onChange={(e) => setPeriodoData(prev => ({ ...prev, tipo: e.target.value }))}
              options={[
                { value: 'semanal', label: 'Semanal' },
                { value: 'mensal', label: 'Mensal' },
                { value: 'especial', label: 'Especial' }
              ]}
              required
            />

            <FloatingLabelTextarea
              label="Observações"
              value={periodoData.observacoes}
              onChange={(e) => setPeriodoData(prev => ({ ...prev, observacoes: e.target.value }))}
            />

            <div className="flex gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleClosePeriodoModal}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Criar'} Período
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

