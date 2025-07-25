'use client'

import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useMemo, useCallback } from 'react'

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

// ✅ CORRIGIDO: Configurações com roles corretos do schema
const profileConfigs: Record<string, ProfileConfig> = {
  chef: {
    dashboardLayout: 'executive',
    primaryColor: 'orange',
    accentColor: 'amber',
    showAdvancedFeatures: true,
    defaultView: '/dashboard',
    quickActions: ['dashboard', 'insumos', 'fichas-tecnicas', 'produtos', 'fornecedores', 'estoque', 'producao', 'impressao'],
    hiddenModules: [], // ✅ Chef vê tudo
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
    hiddenModules: ['usuarios', 'configuracoes', 'auditoria'], // ✅ Gerente não vê admin
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
    ], // ✅ Cozinheiro vê apenas o essencial
    compactMode: true,
    showNotifications: true,
    autoRefresh: false
  }
}

export function useProfileInterface() {
  const { userRole, loading } = useSupabase()

  const config = useMemo(() => {
    if (loading || !userRole) {
      // ✅ CORRIGIDO: Fallback para cozinheiro em vez de chef
      return profileConfigs.cozinheiro
    }
    
    // ✅ CORRIGIDO: Garantir que sempre retorne uma configuração válida
    return profileConfigs[userRole] || profileConfigs.cozinheiro
  }, [userRole, loading])

  const getColorClasses = (variant: 'primary' | 'accent' | 'background' = 'primary') => {
    if (loading || !userRole) {
      // ✅ CORRIGIDO: Cores padrão para cozinheiro
      const defaultColorMap = {
        primary: 'bg-green-500 hover:bg-green-600 text-white',
        accent: 'bg-green-100 text-green-800 border-green-200',
        background: 'bg-gradient-to-br from-green-50 to-emerald-50'
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

    return colorMap[config?.primaryColor as keyof typeof colorMap]?.[variant] || colorMap.green[variant]
  }

  // ✅ ADICIONADO: Função para verificar se módulo está visível
  const isModuleVisible = useCallback((moduleName: string) => {
    return !config.hiddenModules.includes(moduleName)
  }, [config.hiddenModules])

  // ✅ ADICIONADO: Função para verificar se ação rápida está disponível
  const isQuickActionAvailable = useCallback((actionName: string) => {
    return config.quickActions.includes(actionName)
  }, [config.quickActions])

  // ✅ ADICIONADO: Função para obter título baseado no role
  const getRoleTitle = useCallback(() => {
    switch (userRole) {
      case 'chef':
        return 'Chef Executivo'
      case 'gerente':
        return 'Gerente'
      case 'cozinheiro':
        return 'Cozinheiro'
      default:
        return 'Usuário'
    }
  }, [userRole])

  // ✅ ADICIONADO: Função para obter descrição do role
  const getRoleDescription = useCallback(() => {
    switch (userRole) {
      case 'chef':
        return 'Acesso completo ao sistema'
      case 'gerente':
        return 'Gestão operacional e relatórios'
      case 'cozinheiro':
        return 'Produção e fichas técnicas'
      default:
        return 'Acesso básico'
    }
  }, [userRole])

  return {
    config,
    getColorClasses,
    isModuleVisible,
    isQuickActionAvailable,
    getRoleTitle,
    getRoleDescription,
    userRole,
    loading
  }
}

