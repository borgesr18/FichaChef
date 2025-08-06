'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, ChefHat, Lock, Mail, AlertCircle } from 'lucide-react'

export default function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, isConfigured } = useSupabase()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  
  // 🔧 CORREÇÃO: Usar estado ao invés de ref para permitir reset
  const [redirectExecuted, setRedirectExecuted] = useState(false)
  const mountedRef = useRef(true)

  // ✅ Aguardar hidratação
  useEffect(() => {
    setIsHydrated(true)
    return () => {
      mountedRef.current = false
    }
  }, [])

  // ✅ CORRIGIDO: useEffect simplificado com reset de redirect
  useEffect(() => {
    // 🚫 Verificações de segurança
    if (!isHydrated) {
      console.log('🚫 [LOGIN] Aguardando hidratação')
      return
    }

    if (authLoading) {
      console.log('🚫 [LOGIN] Auth ainda carregando')
      return
    }

    if (!mountedRef.current) {
      console.log('🚫 [LOGIN] Componente desmontado, ignorando')
      return
    }

    // ✅ Se usuário já está logado, redirecionar
    if (user && !redirectExecuted) {
      const redirect = searchParams.get('redirect') || '/dashboard'
      
      console.log('✅ [LOGIN] Usuário autenticado detectado:', {
        email: user.email,
        redirect,
        redirectExecuted,
        timestamp: new Date().toISOString()
      })
      
      // 🔧 Marcar redirect como executado
      setRedirectExecuted(true)
      
      // 🔧 USAR APENAS router.push
      console.log('🚀 [LOGIN] Executando redirecionamento para:', redirect)
      router.push(redirect)
      
    } else if (!user && redirectExecuted) {
      // 🔧 RESET: Se usuário foi deslogado, permitir novo redirect
      console.log('🔄 [LOGIN] Usuário deslogado, resetando redirect')
      setRedirectExecuted(false)
    } else {
      console.log('🔍 [LOGIN] Estado atual:', {
        hasUser: !!user,
        redirectExecuted,
        authLoading
      })
    }
  }, [isHydrated, authLoading, user, router, searchParams, redirectExecuted])

  // ✅ CORRIGIDO: Função de login que reseta redirect
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    if (loading) {
      console.log('🚫 [LOGIN] Login já em andamento, ignorando')
      return
    }

    // 🔧 RESET: Permitir novo redirect ao fazer login
    setRedirectExecuted(false)
    setLoading(true)
    setError('')

    try {
      // ✅ Se Supabase não está configurado, simular login
      if (!isConfigured) {
        console.log('🔧 [LOGIN] Modo desenvolvimento - simulando login')
        
        // 🔧 Simular delay de autenticação
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 🔧 Em modo dev, redirecionar diretamente
        const redirect = searchParams.get('redirect') || '/dashboard'
        console.log('🚀 [LOGIN] Modo dev - redirecionando para:', redirect)
        
        if (mountedRef.current) {
          router.push(redirect)
        }
        return
      }

      // ✅ Login real com Supabase
      console.log('🔐 [LOGIN] Tentando autenticação com Supabase para:', email.trim())
      
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      if (loginError) {
        console.error('❌ [LOGIN] Erro na autenticação:', loginError.message)
        
        // ✅ Mensagens de erro mais amigáveis
        if (loginError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos')
        } else if (loginError.message.includes('Email not confirmed')) {
          setError('Email não confirmado. Verifique sua caixa de entrada.')
        } else if (loginError.message.includes('Too many requests')) {
          setError('Muitas tentativas. Aguarde alguns minutos.')
        } else {
          setError(loginError.message)
        }
        return
      }

      if (data.user) {
        console.log('✅ [LOGIN] Usuário autenticado com sucesso:', data.user.email)
        
        // 🔧 AGUARDAR APENAS 300ms para sincronização mínima
        console.log('⏳ [LOGIN] Aguardando sincronização de estado...')
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // 🔧 O useEffect vai detectar a mudança de user e fazer o redirect
        console.log('✅ [LOGIN] Autenticação concluída, aguardando useEffect para redirecionamento')
      } else {
        console.warn('⚠️ [LOGIN] Supabase retornou sucesso mas sem usuário')
        setError('Erro na autenticação. Tente novamente.')
      }

    } catch (error) {
      console.error('❌ [LOGIN] Erro inesperado:', error)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* ✅ Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#1B2E4B] to-[#5AC8FA] rounded-3xl mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <ChefHat className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent mb-3">
            FichaChef
          </h1>
          <p className="text-gray-600 text-lg font-medium">Sistema de Gestão Gastronômica</p>
          
          {/* ✅ Indicador de modo */}
          {!isConfigured && (
            <div className="mt-6 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl shadow-lg">
              <p className="text-sm text-blue-800 font-semibold">
                🔧 Modo Desenvolvimento
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Supabase não configurado
              </p>
            </div>
          )}
        </div>

        {/* ✅ Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 hover:shadow-3xl transition-all duration-300">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* ✅ Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#5AC8FA]/50 focus:border-[#5AC8FA] transition-all duration-300 hover:bg-white/80"
                  placeholder="seu@email.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* ✅ Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-14 py-4 border border-gray-200 rounded-2xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#5AC8FA]/50 focus:border-[#5AC8FA] transition-all duration-300 hover:bg-white/80"
                  placeholder="Sua senha"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100/50 rounded-r-2xl transition-colors duration-200"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* ✅ Error */}
            {error && (
              <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-2xl shadow-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-sm text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* ✅ Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] hover:from-[#0F1B2E] hover:to-[#4A9FE7] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* ✅ Dados de teste */}
          {!isConfigured && (
            <div className="mt-8 p-6 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                🧪 Dados para teste:
              </p>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                  <span className="font-medium">Email:</span>
                  <span className="text-gray-500">qualquer@email.com</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                  <span className="font-medium">Senha:</span>
                  <span className="text-gray-500">qualquer senha</span>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  (Modo desenvolvimento - qualquer credencial funciona)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 FichaChef. Sistema de Gestão Gastronômica.
          </p>
        </div>
      </div>
    </div>
  )
}

// 🎯 CORREÇÃO PRINCIPAL APLICADA:
// ✅ Mudado redirectExecuted de useRef para useState
// ✅ Reset de redirectExecuted ao fazer novo login
// ✅ Reset de redirectExecuted quando usuário é deslogado
// ✅ Logs mais detalhados para debug
// ✅ Verificação de redirectExecuted no useEffect
// ✅ Mantida toda funcionalidade de correção de loops
