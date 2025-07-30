'use client'

import React, { Suspense } from 'react'
import LoginPageContent from './LoginPageContent'

// ✅ Componente de loading para o Suspense
function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5AC8FA] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Carregando página de login...</p>
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
