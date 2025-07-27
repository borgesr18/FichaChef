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
  X,
  Truck,
  Bell,
  Calendar,
  TrendingUp,
  Palette,
  Clock,
  Users,
  Shield,
  ChefHat,
  Home
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard', roles: ['chef', 'cozinheiro', 'gerente'] },
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
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useSupabase()
  const { userRole } = useProfileInterface()

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole || 'cozinheiro')
  )

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'chef': return 'Chef'
      case 'gerente': return 'Gerente'
      case 'cozinheiro': return 'Cozinheiro'
      default: return 'Usuário'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'chef': return 'from-orange-400 to-orange-600'
      case 'gerente': return 'from-blue-400 to-blue-600'
      case 'cozinheiro': return 'from-green-400 to-green-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        modern-sidebar fixed top-0 left-0 z-50 h-full w-64
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header da Sidebar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold gradient-text">FichaChef</h2>
                <p className="text-xs text-gray-500">Painel Executivo</p>
              </div>
            </div>
            
            {/* Botão fechar mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Informações do usuário */}
          {user && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 bg-gradient-to-br ${getRoleColor(userRole || 'cozinheiro')} rounded-full flex items-center justify-center`}>
                  <span className="text-xs font-bold text-white">
                    {(user.email?.charAt(0) || 'U').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {user.email?.split('@')[0] || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getRoleDisplayName(userRole || 'cozinheiro')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Menu de Navegação */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`sidebar-item ${active ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Seção de Acesso Rápido */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Acesso Rápido
            </h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/fichas-tecnicas"
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">Nova Ficha</span>
              </Link>
              <Link
                href="/dashboard/insumos"
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              >
                <Package className="w-4 h-4" />
                <span className="text-sm">Novo Insumo</span>
              </Link>
              <Link
                href="/dashboard/relatorios"
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Relatórios</span>
              </Link>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="mt-8 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-2">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-medium text-gray-700">FichaChef v1.0</p>
              <p className="text-xs text-gray-500">Sistema Profissional</p>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}

