'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useRouter } from 'next/navigation'
import { LogOut, Bell, Search, Star } from 'lucide-react'

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

export default function Header({ onGlobalSearch, onToggleWorkflow }: HeaderProps = {}) {
  const { user, userRole, signOut, displayName } = useSupabase()
  const router = useRouter()
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  const fetchNotificacoes = useCallback(async () => {
    try {
      const response = await fetch('/api/notificacoes?lida=false', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        const parsed = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
        setNotificacoes(parsed)
      } else {
        setNotificacoes([])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotificacoes([])
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

  const marcarComoLida = async (ids: string[]) => {
    try {
      await fetch('/api/notificacoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, lida: true }),
        credentials: 'include'
      })
      fetchNotificacoes()
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const notificacaoNaoLidas = notificacoes.filter(n => !n.lida)

  const userDisplayName = displayName || user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'
  const userRoleLabel = (userRole === 'chef' && 'Chef') || (userRole === 'gerente' && 'Gerente') || (userRole === 'cozinheiro' && 'Cozinheiro') || 'Usuário'
  const initials = userDisplayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word: string) => (word[0] ?? '').toUpperCase())
    .join('') || 'US'

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/40 z-30 shadow-lg shadow-slate-200/20 transition-all duration-300">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4 ml-12 lg:ml-0">
          <h1 className="text-base font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent hidden md:block">
            {currentDateTime.toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} - {currentDateTime.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </h1>
          <h1 className="text-sm font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent md:hidden">
            FichaChef
          </h1>
          
          {onGlobalSearch && (
            <button
              onClick={onGlobalSearch}
              className="hidden lg:flex items-center space-x-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-white/80 rounded-xl transition-all duration-300 border border-slate-200/60 hover:border-slate-300/80 hover:shadow-lg hover:shadow-slate-200/30 hover:scale-[1.02] backdrop-blur-sm"
            >
              <Search className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="font-medium">Buscar</span>
              <kbd className="px-2 py-1 text-xs bg-slate-100/80 text-slate-600 rounded-md font-mono transition-all duration-200 hover:bg-slate-200/80">⌘K</kbd>
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {onGlobalSearch && (
            <button
              onClick={onGlobalSearch}
              className="lg:hidden p-2 text-slate-600 hover:bg-white/80 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/30 hover:scale-110 backdrop-blur-sm touch-target"
              title="Busca Global"
            >
              <Search className="h-5 w-5 transition-transform duration-200" />
            </button>
          )}
          
          {onToggleWorkflow && (
            <button
              onClick={onToggleWorkflow}
              className="p-2 text-slate-600 hover:bg-white/80 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-200/30 hover:text-orange-500 hover:scale-110 backdrop-blur-sm touch-target"
              title="Favoritos e Recentes"
            >
              <Star className="h-5 w-5 transition-all duration-200 hover:rotate-12" />
            </button>
          )}
          
          {user && (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-white/80 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/30 hover:scale-110 backdrop-blur-sm touch-target"
                >
                  <Bell className={`h-5 w-5 transition-all duration-200 ${showNotifications ? 'rotate-12 text-orange-500' : ''}`} />
                  {notificacaoNaoLidas.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-bounce">
                      {notificacaoNaoLidas.length > 9 ? '9+' : notificacaoNaoLidas.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/40 z-50 animate-in slide-in-from-top-2 duration-300">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">Notificações</h3>
                        {notificacaoNaoLidas.length > 0 && (
                          <button
                            onClick={() => marcarComoLida(notificacaoNaoLidas.map(n => n.id))}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Marcar todas como lidas
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notificacoes.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          Nenhuma notificação
                        </div>
                      ) : (
                        notificacoes.slice(0, 5).map((notificacao) => (
                          <div
                            key={notificacao.id}
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notificacao.lida ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => marcarComoLida([notificacao.id])}
                          >
                            <div className="flex items-start">
                              <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                                notificacao.prioridade === 'critica' ? 'bg-red-500' :
                                notificacao.prioridade === 'alta' ? 'bg-orange-500' :
                                notificacao.prioridade === 'media' ? 'bg-yellow-500' : 'bg-gray-500'
                              }`} />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{notificacao.titulo}</p>
                                <p className="text-xs text-gray-600 mt-1">{notificacao.mensagem}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notificacao.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notificacoes.length > 5 && (
                      <div className="p-3 border-t border-gray-200 text-center">
                        <button
                          onClick={() => router.push('/dashboard/alertas')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Ver todas as notificações
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 hover:bg-white/90 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/30">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">{initials}</span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-slate-800">{userDisplayName}</div>
                  <div className="text-xs text-slate-600">{userRoleLabel}</div>
                </div>
              </div>
            </>
          )}
          <button
            onClick={handleLogout}
            className="group flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-all duration-300 border border-slate-200/60 hover:border-red-200/80 hover:shadow-lg hover:shadow-red-200/30 hover:scale-[1.02] backdrop-blur-sm touch-target"
          >
            <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
