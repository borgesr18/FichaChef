'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  { href: '/dashboard/configuracoes', icon: Settings, label: 'Configurações', roles: ['chef'] },
  { href: '/dashboard/usuarios', icon: Users, label: 'Usuários', roles: ['chef'] },
  { href: '/dashboard/auditoria', icon: Shield, label: 'Auditoria', roles: ['chef', 'gerente'] },
  { href: '/dashboard/alertas', icon: Bell, label: 'Alertas', roles: ['chef', 'cozinheiro', 'gerente'] },
  { href: '/dashboard/fornecedores', icon: Truck, label: 'Fornecedores', roles: ['chef', 'gerente'] },
  { href: '/dashboard/insumos', icon: Package, label: 'Insumos', roles: ['chef', 'cozinheiro', 'gerente'] },
  { href: '/dashboard/fichas-tecnicas', icon: FileText, label: 'Fichas Técnicas', roles: ['chef', 'cozinheiro', 'gerente'] },
  { href: '/dashboard/producao', icon: Factory, label: 'Produção', roles: ['chef', 'cozinheiro', 'gerente'] },
  { href: '/dashboard/estoque', icon: Warehouse, label: 'Estoque', roles: ['chef', 'gerente'] },
  { href: '/dashboard/produtos', icon: ShoppingCart, label: 'Produtos', roles: ['chef', 'gerente'] },
  { href: '/dashboard/cardapios', icon: Calendar, label: 'Cardápios', roles: ['chef', 'gerente'] },
  { href: '/dashboard/calculo-preco', icon: Calculator, label: 'Cálculo de Preço', roles: ['chef', 'gerente'] },
  { href: '/dashboard/analise-temporal', icon: TrendingUp, label: 'Análise Temporal', roles: ['chef', 'gerente'] },
  { href: '/dashboard/impressao', icon: Printer, label: 'Impressão', roles: ['chef', 'cozinheiro'] },
  { href: '/dashboard/relatorios', icon: FileBarChart, label: 'Relatórios', roles: ['chef', 'gerente'] },
  { href: '/dashboard/relatorios/templates', icon: Palette, label: 'Templates de Relatórios', roles: ['chef'] },
  { href: '/dashboard/relatorios/agendamentos', icon: Clock, label: 'Agendamentos de Relatórios', roles: ['chef'] },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserRole()
  }, [])

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/perfil-usuario')
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.role)
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMenuItems = menuItems.filter(item => {
    if (loading || !userRole) return true
    return item.roles.includes(userRole)
  })

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6">
          <h1 className="text-xl font-bold">FichaChef</h1>
        </div>
        
        <nav className="mt-6">
          {loading ? (
            <div className="px-6 py-3 text-sm text-gray-400">
              Carregando menu...
            </div>
          ) : (
            filteredMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    // Close mobile menu when clicking a link
                    if (window.innerWidth < 1024) {
                      onToggle()
                    }
                  }}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              )
            })
          )}
        </nav>
      </div>
    </>
  )
}
