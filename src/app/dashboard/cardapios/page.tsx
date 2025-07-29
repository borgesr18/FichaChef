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
}

interface Periodo {
  id: string
  nome: string
  dataInicio: string
  dataFim: string
  observacoes?: string
  menuId: string
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
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showPeriodoModal, setShowPeriodoModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [editingPeriodo, setPeriodo] = useState<Periodo | null>(null)
  const [selectedMenuForPeriodo, setSelectedMenuForPeriodo] = useState<string>('')

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: '',
    ativo: true
  })

  const [periodoFormData, setPeriodoFormData] = useState({
    nome: '',
    dataInicio: '',
    dataFim: '',
    observacoes: '',
    menuId: ''
  })

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
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
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Simular dados para demonstração
      const mockMenus: Menu[] = [
        {
          id: '1',
          nome: 'Menu Executivo',
          descricao: 'Menu completo para almoço executivo',
          tipo: 'almoco',
          ativo: true,
          itens: []
        },
        {
          id: '2',
          nome: 'Café da Manhã Continental',
          descricao: 'Opções variadas para café da manhã',
          tipo: 'cafe_manha',
          ativo: true,
          itens: []
        }
      ]

      const mockProdutos: Produto[] = [
        {
          id: '1',
          nome: 'Prato Feito Tradicional',
          precoVenda: 25.90,
          produtoFichas: []
        },
        {
          id: '2',
          nome: 'Sanduíche Natural',
          precoVenda: 12.50,
          produtoFichas: []
        }
      ]

      const mockPeriodos: Periodo[] = [
        {
          id: '1',
          nome: 'Semana 1 - Janeiro',
          dataInicio: '2024-01-01',
          dataFim: '2024-01-07',
          menuId: '1',
          observacoes: 'Primeira semana do ano'
        }
      ]

      setMenus(mockMenus)
      setProdutos(mockProdutos)
      setPeriodos(mockPeriodos)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
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
    const periodosAtivos = periodos.length
    const custoMedio = menus.length > 0 ? 
      menus.reduce((acc, menu) => acc + calculateMenuCost(menu), 0) / menus.length : 0

    return {
      totalMenus,
      menusAtivos,
      periodosAtivos,
      custoMedio
    }
  }

  const stats = getStats()

  const filteredMenus = menus.filter(menu =>
    menu.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const menuData = {
        ...formData,
        itens: menuItems.map(item => ({
          produtoId: item.produtoId,
          quantidade: typeof item.quantidade === 'string' ? parseFloat(item.quantidade) : item.quantidade,
          observacoes: item.observacoes
        }))
      }

      if (editingMenu) {
        // Atualizar menu existente
        setMenus(prev => prev.map(menu => 
          menu.id === editingMenu.id 
            ? { ...menu, ...menuData }
            : menu
        ))
      } else {
        // Criar novo menu
        const newMenu: Menu = {
          id: Date.now().toString(),
          ...menuData,
          itens: []
        }
        setMenus(prev => [...prev, newMenu])
      }

      handleCloseModal()
    } catch (error) {
      console.error('Erro ao salvar menu:', error)
    }
  }

  const handlePeriodoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPeriodo) {
        // Atualizar período existente
        setPeriodos(prev => prev.map(periodo => 
          periodo.id === editingPeriodo.id 
            ? { ...periodo, ...periodoFormData }
            : periodo
        ))
      } else {
        // Criar novo período
        const newPeriodo: Periodo = {
          id: Date.now().toString(),
          ...periodoFormData
        }
        setPeriodos(prev => [...prev, newPeriodo])
      }

      handleClosePeriodoModal()
    } catch (error) {
      console.error('Erro ao salvar período:', error)
    }
  }

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu)
    setFormData({
      nome: menu.nome,
      descricao: menu.descricao || '',
      tipo: menu.tipo,
      ativo: menu.ativo
    })
    setMenuItems(menu.itens.map(item => ({
      produtoId: item.produto.id,
      quantidade: item.quantidade,
      observacoes: item.observacoes
    })))
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cardápio?')) {
      setMenus(prev => prev.filter(menu => menu.id !== id))
    }
  }

  const handleEditPeriodo = (periodo: Periodo) => {
    setPeriodo(periodo)
    setPeriodoFormData({
      nome: periodo.nome,
      dataInicio: periodo.dataInicio,
      dataFim: periodo.dataFim,
      observacoes: periodo.observacoes || '',
      menuId: periodo.menuId
    })
    setShowPeriodoModal(true)
  }

  const handleDeletePeriodo = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este período?')) {
      setPeriodos(prev => prev.filter(periodo => periodo.id !== id))
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMenu(null)
    setFormData({ nome: '', descricao: '', tipo: '', ativo: true })
    setMenuItems([])
    setSelectedProduct('')
    setQuantidade('')
    setObservacoes('')
  }

  const handleClosePeriodoModal = () => {
    setShowPeriodoModal(false)
    setPeriodo(null)
    setPeriodoFormData({ nome: '', dataInicio: '', dataFim: '', observacoes: '', menuId: '' })
    setSelectedMenuForPeriodo('')
  }

  const addMenuItem = () => {
    if (selectedProduct && quantidade) {
      const newItem: MenuItem = {
        produtoId: selectedProduct,
        quantidade: parseFloat(quantidade),
        observacoes
      }
      setMenuItems(prev => [...prev, newItem])
      setSelectedProduct('')
      setQuantidade('')
      setObservacoes('')
    }
  }

  const removeMenuItem = (index: number) => {
    setMenuItems(prev => prev.filter((_, i) => i !== index))
  }

  const openPeriodoModal = (menuId: string) => {
    setSelectedMenuForPeriodo(menuId)
    setPeriodoFormData(prev => ({ ...prev, menuId }))
    setShowPeriodoModal(true)
  }

  if (loading) {
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
                  onClick={() => setShowModal(true)}
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
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
              >
                Criar Primeiro Cardápio
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenus.map((menu) => {
              const nutrition = calculateTotalNutrition(menu.itens)
              const custoTotal = calculateMenuCost(menu)
              const menuPeriodos = periodos.filter(p => p.menuId === menu.id)

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
                        <span className="font-medium">{menuPeriodos.length}</span>
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
                        onClick={() => handleEdit(menu)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                      <button
                        onClick={() => openPeriodoModal(menu.id)}
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
        <Modal isOpen={showModal} onClose={handleCloseModal} title={editingMenu ? 'Editar Cardápio' : 'Novo Cardápio'}>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              {menuItems.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Itens adicionados:</h4>
                  <div className="space-y-2">
                    {menuItems.map((item, index) => {
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
                className="flex-1 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
              >
                {editingMenu ? 'Atualizar' : 'Criar'} Cardápio
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Período */}
        <Modal isOpen={showPeriodoModal} onClose={handleClosePeriodoModal} title={editingPeriodo ? 'Editar Período' : 'Novo Período'}>
          <form onSubmit={handlePeriodoSubmit} className="space-y-6">
            <FloatingLabelInput
              label="Nome do Período"
              value={periodoFormData.nome}
              onChange={(e) => setPeriodoFormData(prev => ({ ...prev, nome: e.target.value }))}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelInput
                label="Data de Início"
                type="date"
                value={periodoFormData.dataInicio}
                onChange={(e) => setPeriodoFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                required
              />
              <FloatingLabelInput
                label="Data de Fim"
                type="date"
                value={periodoFormData.dataFim}
                onChange={(e) => setPeriodoFormData(prev => ({ ...prev, dataFim: e.target.value }))}
                required
              />
            </div>

            {!editingPeriodo && (
              <FloatingLabelSelect
                label="Cardápio"
                value={periodoFormData.menuId}
                onChange={(e) => setPeriodoFormData(prev => ({ ...prev, menuId: e.target.value }))}
                options={menus.map(m => ({ value: m.id, label: m.nome }))}
                required
              />
            )}

            <FloatingLabelTextarea
              label="Observações"
              value={periodoFormData.observacoes}
              onChange={(e) => setPeriodoFormData(prev => ({ ...prev, observacoes: e.target.value }))}
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
                className="flex-1 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
              >
                {editingPeriodo ? 'Atualizar' : 'Criar'} Período
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
