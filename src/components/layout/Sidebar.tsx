'use client'

import React from 'react'
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
  Calendar
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { href: '/dashboard/configuracoes', icon: Settings, label: 'Configurações' },
  { href: '/dashboard/alertas', icon: Bell, label: 'Alertas' },
  { href: '/dashboard/fornecedores', icon: Truck, label: 'Fornecedores' },
  { href: '/dashboard/insumos', icon: Package, label: 'Insumos' },
  { href: '/dashboard/fichas-tecnicas', icon: FileText, label: 'Fichas Técnicas' },
  { href: '/dashboard/producao', icon: Factory, label: 'Produção' },
  { href: '/dashboard/estoque', icon: Warehouse, label: 'Estoque' },
  { href: '/dashboard/produtos', icon: ShoppingCart, label: 'Produtos' },
  { href: '/dashboard/cardapios', icon: Calendar, label: 'Cardápios' },
  { href: '/dashboard/calculo-preco', icon: Calculator, label: 'Cálculo de Preço' },
  { href: '/dashboard/impressao', icon: Printer, label: 'Impressão' },
  { href: '/dashboard/relatorios', icon: FileBarChart, label: 'Relatórios' },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

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
          {menuItems.map((item) => {
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
          })}
        </nav>
      </div>
    </>
  )
}
