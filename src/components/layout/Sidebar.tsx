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
  FileBarChart 
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { href: '/dashboard/configuracoes', icon: Settings, label: 'Configurações' },
  { href: '/dashboard/insumos', icon: Package, label: 'Insumos' },
  { href: '/dashboard/fichas-tecnicas', icon: FileText, label: 'Fichas Técnicas' },
  { href: '/dashboard/producao', icon: Factory, label: 'Produção' },
  { href: '/dashboard/estoque', icon: Warehouse, label: 'Estoque' },
  { href: '/dashboard/produtos', icon: ShoppingCart, label: 'Produtos' },
  { href: '/dashboard/calculo-preco', icon: Calculator, label: 'Cálculo de Preço' },
  { href: '/dashboard/impressao', icon: Printer, label: 'Impressão' },
  { href: '/dashboard/relatorios', icon: FileBarChart, label: 'Relatórios' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-40">
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
  )
}
