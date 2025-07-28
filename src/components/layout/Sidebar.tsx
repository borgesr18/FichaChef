'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useProfileInterface } from '@/hooks/useProfileInterface'
import { 
  Settings, 
  Package, 
  FileText, 
  Factory, 
  Warehouse, 
  ShoppingCart, 
  Calculator, 
  Printer, 
  BarChart3, 
  FileBarChart,
  Menu,
  X,
  Truck,
  Bell,
  Calendar,
  TrendingUp,
  Palette,
  Clock,
  Users,
  Shield
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', icon: BarChart3, label: 'Dashboard', roles: ['chef', 'cozinheiro', 'gerente'] },
  { href: '/dashboard/insumos', icon: Package, label: 'Insumos', roles: ['chef', 'cozinheiro', 'gerente'] },
  { href: '/dashboard/fichas-tecnicas', icon: FileText, label: 'Fichas Técnicas', roles: ['chef', 'cozinheiro', 'gerente'] },
  { href: '/dashboard/produtos', icon: ShoppingCart, label: 'Produtos', roles: ['chef', 'gerente'] },
  { href: '/dashboard/fornecedores', icon: Truck, label: 'Fornecedores', roles: ['chef', 'gerente'] },
  { href: '/dashboard/estoque', icon: Warehouse, label: 'Estoque', roles: ['chef', 'gerente'] },
  { href: '/dashboard/producao', icon: Factory, label: 'Produção', roles: ['chef', 'cozinheiro', 'gerente'] },
  { href: '/dashboard/impressao', icon: Printer, label: 'Impressão', roles: ['chef', 'cozinheiro'] },
  { href: '/dashboard/calculo-preco', icon: Calculator, label: 'Cálculo de Preço', roles: ['chef', 'gerente'] },
  { href: '/dashboard/cardapios', icon: Calendar, label: 'Cardápios', roles: ['chef', 'gerente'] },
  { href: '/dashboard/relatorios', icon: FileBarChart, label: 'Relatórios', roles: ['chef', 'gerente'] },
  { href: '/dashboard/usuarios', icon: Users, label: 'Usuários', roles: ['chef'] },
  { href: '/dashboard/auditoria', icon: Shield, label: 'Auditoria', roles: ['chef', 'gerente'] },
  { href: '/dashboard/analise-temporal', icon: TrendingUp, label: 'Análise Temporal', roles: ['chef', 'gerente'] },
  { href: '/dashboard/alertas', icon: Bell, label: 'Alertas', roles: ['chef', 'cozinheiro', 'gerente'] },
  { href: '/dashboard/relatorios/templates', icon: Palette, label: 'Templates de Relatórios', roles: ['chef'] },
  { href: '/dashboard/relatorios/agendamentos', icon: Clock, label: 'Agendamentos de Relatórios', roles: ['chef'] },
  { href: '/dashboard/configuracoes', icon: Settings, label: 'Configurações', roles: ['chef'] },
]

interface SidebarProps {
  isOpen: boolean
  onToggle?: () => void
  onClose?: () => void
}

export default function Sidebar({ isOpen, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { userRole, loading } = useSupabase()
  const { config, getColorClasses, isModuleVisible, isQuickActionAvailable } = useProfileInterface()

  // Usar onClose se disponível, senão usar onToggle
  const handleClose = onClose || onToggle || (() => {})

  const filteredMenuItems = menuItems.filter(item => {
    if (loading || !userRole) return true
    return item.roles.includes(userRole) && isModuleVisible(item.href)
  })

  const quickActionItems = filteredMenuItems.filter(item => isQuickActionAvailable(item.href))
  const regularItems = filteredMenuItems.filter(item => !isQuickActionAvailable(item.href))

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={handleClose}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${config?.compactMode ? 'w-56' : 'w-64'}
      `}>
        <div className={`p-6 border-b border-slate-700/50 ${config?.compactMode ? 'p-4' : 'p-6'}`}>
          <h1 className={`font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent ${config?.compactMode ? 'text-xl' : 'text-2xl'}`}>
            FichaChef
          </h1>
          <p className={`text-slate-400 mt-1 ${config?.compactMode ? 'text-xs' : 'text-xs'}`}>
            {userRole === 'chef' && 'Painel Executivo'}
            {userRole === 'gerente' && 'Painel Gerencial'}
            {userRole === 'cozinheiro' && 'Painel de Produção'}
          </p>
          {userRole && (
            <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${getColorClasses('accent')}`}>
              {userRole === 'chef' && '👨‍🍳 Chef'}
              {userRole === 'gerente' && '📊 Gerente'}
              {userRole === 'cozinheiro' && '🍳 Cozinheiro'}
            </div>
          )}
        </div>
        
        <nav className={`mt-2 px-3 ${config?.compactMode ? 'px-2' : 'px-3'}`}>
          {loading ? (
            <div className="px-3 py-3 text-sm text-slate-400 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-slate-600 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-slate-600 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Quick Actions Section */}
              {quickActionItems.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                    Acesso Rápido
                  </h3>
                  <div className="space-y-1">
                    {quickActionItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      
                      return (
                        <Link
                          key={`quick-${item.href}`}
                          href={item.href}
                          title=""
                          onClick={() => {
                            if (window.innerWidth < 1024) {
                              handleClose()
                            }
                          }}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive
                              ? `${getColorClasses('primary')} shadow-lg transform scale-[1.02]`
                              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:transform hover:scale-[1.01]'
                          } ${config?.compactMode ? 'py-1.5 text-xs' : 'py-2 text-sm'}`}
                        >
                          <Icon className={`mr-3 h-4 w-4 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'
                          }`} />
                          <span className="font-medium">{item.label}</span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Regular Menu Items */}
              {regularItems.length > 0 && (
                <div>
                  {quickActionItems.length > 0 && (
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                      Módulos
                    </h3>
                  )}
                  <div className="space-y-1">
                    {regularItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title=""
                          onClick={() => {
                            if (window.innerWidth < 1024) {
                              handleClose()
                            }
                          }}
                          className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 transform scale-[1.02]'
                              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:transform hover:scale-[1.01] hover:shadow-md'
                          } ${config?.compactMode ? 'py-2 text-xs' : 'py-3 text-sm'}`}
                        >
                          <Icon className={`mr-3 h-5 w-5 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'
                          }`} />
                          <span className="font-medium">{item.label}</span>
                          {isActive && (
                            <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </>
  )
}
