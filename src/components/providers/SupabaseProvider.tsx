'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

type UserRole = 'chef' | 'gerente' | 'cozinheiro' | null

interface SupabaseContextType {
  user: User | null
  userRole: UserRole
  loading: boolean
  refreshUserRole: () => Promise<void>
  clearCache: () => void
  isConfigured: boolean
  isInitialized: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  const [clearCache, setClearCache] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // ✅ VERIFICAR SE SUPABASE ESTÁ CONFIGURADO
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  // ✅ CONTROLE DE LOOP: Evitar requisições infinitas
  const isLoadingRole = useRef(false)
  const maxRetries = useRef(3)
  const currentRetries = useRef(0)
  const lastSuccessfulRole = useRef<UserRole>(null)

  // ✅ FUNÇÃO HÍBRIDA: Tenta banco, usa fallback inteligente se falhar
  const refreshUserRole = useCallback(async () => {
    if (!user || isLoadingRole.current) {
      console.log('🚫 refreshUserRole: Bloqueado (sem usuário ou já carregando)')
      return
    }

    // ✅ AGUARDAR INICIALIZAÇÃO: Evitar consultas antes da autenticação estar pronta
    if (!isInitialized) {
      console.log('🕐 refreshUserRole: Aguardando inicialização da autenticação...')
      return
    }

    // ✅ LIMITE DE TENTATIVAS: Evitar loops infinitos
    if (currentRetries.current >= maxRetries.current) {
      console.warn('⚠️ refreshUserRole: Máximo de tentativas atingido, usando fallback')
      
      // ✅ FALLBACK INTELIGENTE: Usar último role conhecido ou chef para admin
      const fallbackRole = lastSuccessfulRole.current || 
                          (user.email === 'rba1807@gmail.com' ? 'chef' : 'cozinheiro')
      
      setUserRole(fallbackRole)
      setLoading(false)
      return
    }

    isLoadingRole.current = true
    currentRetries.current += 1

    try {
      console.log(`🔄 refreshUserRole: Tentativa ${currentRetries.current}/${maxRetries.current}`)
      console.log('👤 Usuário:', { id: user.id, email: user.email })

      // ✅ ESTRATÉGIA 1: Buscar por user_id (mais confiável)
      console.log('🔍 Tentando buscar por user_id...')
      const { data, error } = await supabase
        .from('perfis_usuarios')
        .select('role, nome, email')
        .eq('user_id', user.id)
        .single()

      if (!error && data?.role) {
        console.log('✅ Role encontrado com sucesso:', data.role)
        console.log('👤 Dados do perfil:', data)
        
        setUserRole(data.role as UserRole)
        lastSuccessfulRole.current = data.role as UserRole
        currentRetries.current = 0 // ✅ Reset contador em caso de sucesso
        
        // ✅ Salvar no cache
        localStorage.setItem('fichachef-user-role', data.role)
        localStorage.setItem('fichachef-user-email', data.email || '')
        
        // ✅ LOG ESPECÍFICO PARA CHEF
        if (data.role === 'chef') {
          console.log('👨‍🍳 USUÁRIO É CHEF - Deve ter acesso completo!')
        }
        
        setLoading(false)
        return
      }

      // ✅ ESTRATÉGIA 2: Buscar por email como backup (só se strategy 1 falhar)
      console.log('🔄 Tentando buscar por email como backup...')
      const { data: backupData, error: backupError } = await supabase
        .from('perfis_usuarios')
        .select('role, nome, email')
        .eq('email', user.email)
        .single()

      if (!backupError && backupData?.role) {
        console.log('✅ Backup funcionou! Role encontrado:', backupData.role)
        setUserRole(backupData.role as UserRole)
        lastSuccessfulRole.current = backupData.role as UserRole
        currentRetries.current = 0 // ✅ Reset contador em caso de sucesso
        
        // ✅ Salvar no cache
        localStorage.setItem('fichachef-user-role', backupData.role)
        setLoading(false)
        return
      }

      // ✅ ESTRATÉGIA 3: Fallback inteligente baseado no email
      console.warn('⚠️ Ambas as estratégias falharam, usando fallback inteligente')
      
      let fallbackRole: UserRole = 'cozinheiro' // Default geral
      
      // ✅ FALLBACK ESPECÍFICO: Admin conhecido
      if (user.email === 'rba1807@gmail.com') {
        fallbackRole = 'chef'
        console.log('👨‍🍳 Fallback: Email admin detectado, definindo como chef')
      }
      
      // ✅ FALLBACK: Usar role do cache se disponível
      const cachedRole = localStorage.getItem('fichachef-user-role')
      if (cachedRole && ['chef', 'gerente', 'cozinheiro'].includes(cachedRole)) {
        fallbackRole = cachedRole as UserRole
        console.log('💾 Fallback: Usando role do cache:', cachedRole)
      }
      
      setUserRole(fallbackRole)
      lastSuccessfulRole.current = fallbackRole

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar role:', error)
      
      // ✅ FALLBACK DE EMERGÊNCIA
      const emergencyRole = user.email === 'rba1807@gmail.com' ? 'chef' : 'cozinheiro'
      setUserRole(emergencyRole)
      lastSuccessfulRole.current = emergencyRole
      
    } finally {
      isLoadingRole.current = false
      setLoading(false)
    }
  }, [user, clearCache, isInitialized]) // ✅ isInitialized adicionado para controle de timing

  // ✅ FUNÇÃO DE LIMPEZA: Reset completo
  const handleClearCache = useCallback(() => {
    console.log('🧹 Limpando cache e resetando contadores...')
    
    // ✅ Limpar cache
    localStorage.removeItem('fichachef-user-role')
    localStorage.removeItem('fichachef-user-email')
    
    // ✅ Reset contadores
    currentRetries.current = 0
    lastSuccessfulRole.current = null
    isLoadingRole.current = false
    
    // ✅ Forçar re-render
    setClearCache(prev => prev + 1)
    setUserRole(null)
    setLoading(true)
  }, [])

  // ✅ EFEITO: Monitorar mudanças de autenticação
  useEffect(() => {
    // ✅ INICIALIZAÇÃO: Verificar sessão existente primeiro
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔄 Inicializando autenticação...', session ? 'Sessão encontrada' : 'Sem sessão')
        
        if (session?.user) {
          setUser(session.user)
          setLoading(true)
          currentRetries.current = 0
          lastSuccessfulRole.current = null
        }
        
        // ✅ SINALIZAR INICIALIZAÇÃO COMPLETA
        setIsInitialized(true)
        console.log('✅ Autenticação inicializada - pronto para consultas')
        
      } catch (error) {
        console.error('❌ Erro na inicialização:', error)
        setIsInitialized(true) // Mesmo com erro, permitir tentativas
      }
    }

    initializeAuth()

    // ✅ MONITORAR MUDANÇAS
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event)
        
        if (session?.user) {
          setUser(session.user)
          setLoading(true)
          
          // ✅ Reset contadores para novo usuário
          currentRetries.current = 0
          lastSuccessfulRole.current = null
          
        } else {
          setUser(null)
          setUserRole(null)
          setLoading(false)
          
          // ✅ Limpar tudo no logout
          currentRetries.current = 0
          lastSuccessfulRole.current = null
          isLoadingRole.current = false
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ✅ EFEITO: Carregar role quando usuário muda E autenticação está inicializada
  useEffect(() => {
    if (user && isInitialized && !isLoadingRole.current) {
      console.log('🚀 Condições atendidas: usuário logado e autenticação inicializada')
      // ✅ DELAY PEQUENO: Evitar chamadas muito rápidas
      const timer = setTimeout(() => {
        refreshUserRole()
      }, 100)
      
      return () => clearTimeout(timer)
    } else if (user && !isInitialized) {
      console.log('🕐 Usuário presente mas aguardando inicialização...')
    }
  }, [user, isInitialized, refreshUserRole])

  const value = {
    user,
    userRole,
    loading,
    refreshUserRole,
    clearCache: handleClearCache,
    isConfigured,
    isInitialized
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

