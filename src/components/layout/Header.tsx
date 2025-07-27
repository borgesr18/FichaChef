import React, { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useRouter } from 'next/navigation'
import { LogOut, User, Bell, Search, Star, ChefHat, Menu } from 'lucide-react'
import { withRequestDeduplication } from '@/lib/request-cache'

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  prioridade: string
  lida: boolean
  createdAt: string
}

interface HeaderProps {
  onGlobalSearch?: () => void
  onToggleWorkflow?: () => void
  onMenuClick?: () => void
}

export default function Header({ onGlobalSearch, onToggleWorkflow, onMenuClick }: HeaderProps = {}) {
  const { user, signOut } = useSupabase()
  const router = useRouter()
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  const fetchNotificacoes = useCallback(async () => {
    try {
      const response = await withRequestDeduplication('notifications', () => 
        fetch('/api/notificacoes?lida=false'))
      if (response.ok) {
        const data = await response.json()
        setNotificacoes(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchNotificacoes()
      const interval = setInterval(fetchNotificacoes, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [user, fetchNotificacoes])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notificacoes/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lida: true })
      })
      setNotificacoes(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'text-red-600 bg-red-100'
      case 'media': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  return (
    <header className="modern-header sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo e Menu Mobile */}
        <div className="flex items-center gap-4">
          {/* Botão Menu Mobile */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">FichaChef</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Sistema de Gestão Gastronômica</p>
            </div>
          </div>
        </div>

        {/* Data e Hora */}
        <div className="hidden md:block text-center">
          <p className="text-sm font-medium text-gray-700">
            {formatDateTime(currentDateTime)}
          </p>
        </div>

        {/* Ações do Header */}
        <div className="flex items-center gap-3">
          {/* Busca Global */}
          {onGlobalSearch && (
            <button
              onClick={onGlobalSearch}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Busca Global"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Workflow Toggle */}
          {onToggleWorkflow && (
            <button
              onClick={onToggleWorkflow}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Workflow"
            >
              <Star className="w-5 h-5" />
            </button>
          )}

          {/* Notificações */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              {notificacoes.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificacoes.length}
                </span>
              )}
            </button>

            {/* Dropdown de Notificações */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Notificações</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notificacoes.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma notificação</p>
                    </div>
                  ) : (
                    notificacoes.map((notificacao) => (
                      <div
                        key={notificacao.id}
                        className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                        onClick={() => markAsRead(notificacao.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 mb-1">
                              {notificacao.titulo}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {notificacao.mensagem}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(notificacao.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notificacao.prioridade)}`}>
                            {notificacao.prioridade}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Menu do Usuário */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {user?.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">Chef</p>
              </div>
            </button>

            {/* Dropdown do Usuário */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {user?.email?.split('@')[0] || 'Usuário'}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push('/dashboard/configuracoes')
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Perfil</span>
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para fechar dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false)
            setShowUserMenu(false)
          }}
        />
      )}
    </header>
  )
}

