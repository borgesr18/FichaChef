'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import Header from './Header'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { user, loading, isConfigured, isInitialized } = useSupabase()
  const [isHydrated, setIsHydrated] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ✅ CORRIGIDO: Aguardar hidratação antes de renderizar
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // ✅ CORRIGIDO: Redirecionamento apenas após hidratação e inicialização
  useEffect(() => {
    console.log('🔍 DashboardLayout useEffect:', { isHydrated, isInitialized, loading, isConfigured, user: !!user, userEmail: user?.email })
    
    if (!isHydrated || !isInitialized) {
      console.log('🚫 DashboardLayout: Aguardando hidratação ou inicialização')
      return
    }

    // ✅ Se Supabase está configurado mas usuário não está logado
    if (isConfigured && !user) {
      console.log('🔒 DashboardLayout: Usuário não autenticado, redirecionando para login')
      router.push('/login')
      return
    }

    // ✅ Se Supabase não está configurado, permitir acesso (modo desenvolvimento)
    if (!isConfigured) {
      console.log('🔧 DashboardLayout: Modo desenvolvimento - Supabase não configurado')
    } else if (user) {
      console.log('✅ DashboardLayout: Usuário autenticado, permitindo acesso ao dashboard:', user.email)
    }
  }, [isHydrated, isInitialized, loading, isConfigured, user, router])

  // ✅ LOADING: Mostrar spinner durante hidratação ou inicialização
  if (!isHydrated || !isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Carregando sistema...</p>
        </div>
      </div>
    )
  }

  // ✅ VERIFICAÇÃO: Se Supabase configurado mas sem usuário, não renderizar
  if (isConfigured && !user) {
    return null
  }

  // ✅ RENDERIZAÇÃO: Layout principal
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ✅ Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onToggle={() => setSidebarOpen(prev => !prev)}
      />

      {/* ✅ Main Content */}
      <div className="lg:pl-64">
        {/* ✅ Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* ✅ Page Content */}
        <main className="min-h-screen pt-16">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay duplicado removido: o componente `Sidebar` já renderiza seu próprio overlay no mobile */}
    </div>
  )
}

