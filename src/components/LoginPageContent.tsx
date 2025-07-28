'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
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

  // ✅ Aguardar hidratação
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // ✅ CORRIGIDO: Redirecionamento apenas após hidratação
  useEffect(() => {
    if (!isHydrated || authLoading) return

    // ✅ Se usuário já está logado, redirecionar
    if (user) {
      const redirect = searchParams.get('redirect') || '/dashboard'
      console.log('✅ Login: Usuário já autenticado, redirecionando para:', redirect)
      router.push(redirect)
    }
  }, [isHydrated, authLoading, user, router, searchParams])

  // ✅ CORRIGIDO: Função de login com tratamento de erros
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    setLoading(true)
    setError('')

    try {
      // ✅ Se Supabase não está configurado, simular login
      if (!isConfigured) {
        console.log('🔧 Login: Modo desenvolvimento - simulando login')
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay
        router.push('/dashboard')
        return
      }

      // ✅ Login real com Supabase
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      if (loginError) {
        console.error('❌ Login: Erro na autenticação:', loginError.message)
        
        // ✅ Mensagens de erro mais amigáveis
        if (loginError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos')
        } else if (loginError.message.includes('Email not confirmed')) {
          setError('Email não confirmado. Verifique sua caixa de entrada.')
        } else {
          setError(loginError.message)
        }
        return
      }

      if (data.user) {
        console.log('✅ Login: Usuário autenticado com sucesso:', data.user.email)
        
        // ✅ Aguardar um pouco para garantir que o estado seja atualizado
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const redirect = searchParams.get('redirect') || '/dashboard'
        router.push(redirect)
      }

    } catch (error) {
      console.error('❌ Login: Erro inesperado:', error)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ LOADING: Durante hidratação ou carregamento de auth
  if (!isHydrated || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Carregando sistema...</p>
        </div>
      </div>
    )
  }

  // ✅ Se usuário já está logado, mostrar redirecionamento
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* ✅ Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-elegant mb-2">FichaChef</h1>
          <p className="text-slate-600">Sistema de Gestão Gastronômica</p>
          
          {/* ✅ Indicador de modo */}
          {!isConfigured && (
            <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                🔧 Modo Desenvolvimento
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Supabase não configurado
              </p>
            </div>
          )}
        </div>

        {/* ✅ Form */}
        <div className="glass-morphism rounded-2xl shadow-floating p-8 border border-white/20">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* ✅ Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="seu@email.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* ✅ Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="Sua senha"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* ✅ Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-sm text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* ✅ Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-elegant hover:shadow-glow-orange btn-modern"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* ✅ Dados de teste */}
          {!isConfigured && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                🧪 Dados para teste:
              </p>
              <div className="text-xs text-slate-600 space-y-1">
                <p><strong>Email:</strong> qualquer@email.com</p>
                <p><strong>Senha:</strong> qualquer senha</p>
                <p className="text-slate-500 mt-2">
                  (Modo desenvolvimento - qualquer credencial funciona)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            © 2025 FichaChef. Sistema de Gestão Gastronômica.
          </p>
        </div>
      </div>
    </div>
  )
}

