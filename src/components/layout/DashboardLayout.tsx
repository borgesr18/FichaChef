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
  const { user, loading, isConfigured } = useSupabase()
  const [isHydrated, setIsHydrated] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ✅ CORRIGIDO: Aguardar hidratação antes de renderizar
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // ✅ CORRIGIDO: Redirecionamento apenas após hidratação e carregamento
  useEffect(() => {
    console.log('🔍 DashboardLayout useEffect:', { isHydrated, loading, isConfigured, user: !!user, userEmail: user?.email })
    
    if (!isHydrated || loading) {
      console.log('🚫 DashboardLayout: Aguardando hidratação ou loading')
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
  }, [isHydrated, loading, isConfigured, user, router])

  // ✅ LOADING: Mostrar spinner durante hidratação ou carregamento
  if (!isHydrated || loading) {
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
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  // ✅ RENDERIZAÇÃO: Layout principal
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ✅ Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
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

      {/* ✅ Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

