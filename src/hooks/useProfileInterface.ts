'use client'

import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useMemo } from 'react'

export interface ProfileConfig {
  dashboardLayout: 'executive' | 'operational' | 'simplified'
  primaryColor: string
  accentColor: string
  showAdvancedFeatures: boolean
  defaultView: string
  quickActions: string[]
  hiddenModules: string[]
  compactMode: boolean
  showNotifications: boolean
  autoRefresh: boolean
}

const profileConfigs: Record<string, ProfileConfig> = {
  chef: {
    dashboardLayout: 'executive',
    primaryColor: 'orange',
    accentColor: 'amber',
    showAdvancedFeatures: true,
    defaultView: '/dashboard',
    quickActions: ['usuarios', 'relatorios', 'configuracoes', 'auditoria'],
    hiddenModules: [],
    compactMode: false,
    showNotifications: true,
    autoRefresh: true
  },
  gerente: {
    dashboardLayout: 'operational',
    primaryColor: 'blue',
    accentColor: 'indigo',
    showAdvancedFeatures: true,
    defaultView: '/dashboard/relatorios',
    quickActions: ['estoque', 'fornecedores', 'calculo-preco', 'analise-temporal'],
    hiddenModules: ['usuarios', 'configuracoes', 'auditoria'],
    compactMode: false,
    showNotifications: true,
    autoRefresh: true
  },
  cozinheiro: {
    dashboardLayout: 'simplified',
    primaryColor: 'green',
    accentColor: 'emerald',
    showAdvancedFeatures: false,
    defaultView: '/dashboard/fichas-tecnicas',
    quickActions: ['fichas-tecnicas', 'producao', 'impressao', 'alertas'],
    hiddenModules: [
      'usuarios', 'configuracoes', 'auditoria', 'fornecedores', 
      'calculo-preco', 'analise-temporal', 'relatorios', 'produtos',
      'cardapios', 'relatorios/templates', 'relatorios/agendamentos'
    ],
    compactMode: true,
    showNotifications: true,
    autoRefresh: false
  }
}

export function useProfileInterface() {
  const { userRole, loading } = useSupabase()

  const config = useMemo(() => {
    if (loading || !userRole) {
      return profileConfigs.chef // Default fallback
    }
    return profileConfigs[userRole] || profileConfigs.chef
  }, [userRole, loading])

  const getColorClasses = (variant: 'primary' | 'accent' | 'background' = 'primary') => {
    if (loading || !userRole) {
      const defaultColorMap = {
        primary: 'bg-orange-500 hover:bg-orange-600 text-white',
        accent: 'bg-orange-100 text-orange-800 border-orange-200',
        background: 'bg-gradient-to-br from-orange-50 to-amber-50'
      }
      return defaultColorMap[variant]
    }

    const colorMap = {
      orange: {
        primary: 'bg-orange-500 hover:bg-orange-600 text-white',
        accent: 'bg-orange-100 text-orange-800 border-orange-200',
        background: 'bg-gradient-to-br from-orange-50 to-amber-50'
      },
      blue: {
        primary: 'bg-blue-500 hover:bg-blue-600 text-white',
        accent: 'bg-blue-100 text-blue-800 border-blue-200',
        background: 'bg-gradient-to-br from-blue-50 to-indigo-50'
      },
      green: {
        primary: 'bg-green-500 hover:bg-green-600 text-white',
        accent: 'bg-green-100 text-green-800 border-green-200',
        background: 'bg-gradient-to-br from-green-50 to-emerald-50'
      }
    }

    return colorMap[config?.primaryColor as keyof typeof colorMap]?.[variant] || colorMap.orange[variant]
  }

  const isModuleVisible = (moduleHref: string) => {
    if (!config?.hiddenModules) return true
    return !config.hiddenModules.some(hidden => moduleHref.includes(hidden))
  }

  const isQuickAction = (moduleHref: string) => {
    if (!config?.quickActions) return false
    return config.quickActions.some(action => moduleHref.includes(action))
  }

  return {
    config,
    userRole,
    loading,
    getColorClasses,
    isModuleVisible,
    isQuickAction
  }
}
