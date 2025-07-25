'use client'

import React, { Suspense } from 'react'
import LoginPageContent from './LoginPageContent'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// ✅ Componente de loading para o Suspense
function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Carregando página de login...</p>
      </div>
    </div>
  )
}

// ✅ Wrapper principal com Suspense boundary
export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  )
}

