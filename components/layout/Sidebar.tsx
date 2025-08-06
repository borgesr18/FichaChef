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
  Shield,
  ChefHat
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
  const { isModuleVisible } = useProfileInterface()

  // Usar onClose se disponível, senão usar onToggle
  const handleClose = onClose || onToggle || (() => {})

  const filteredMenuItems = menuItems.filter(item => {
    if (loading || !userRole) return true
    return item.roles.includes(userRole) && isModuleVisible(item.href)
  })

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={handleClose}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1B2E4B] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
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

      {/* Sidebar - Design Figma */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-[#1B2E4B] text-white z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header do Sidebar - Design Figma */}
        <div className="p-6 border-b border-blue-600">
          <div className="flex items-center space-x-3">
            <ChefHat className="text-2xl text-[#5AC8FA]" />
            <h1 className="text-xl font-bold text-white">FichaChef</h1>
          </div>
        </div>
        
        {/* Navegação - Design Figma */}
        <nav className="p-4">
          {loading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                  <div className="w-5 h-5 bg-blue-600 rounded"></div>
                  <div className="w-24 h-4 bg-blue-600 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          handleClose()
                        }
                      }}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#5AC8FA]/20 text-[#5AC8FA]'
                          : 'hover:bg-blue-600 text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </nav>
      </div>
    </>
  )
}
