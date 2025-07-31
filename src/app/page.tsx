'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'

export default function Home() {
  const router = useRouter()
  const { user, loading, isConfigured } = useSupabase()

  useEffect(() => {
    if (loading) return
    
    if (user) {
      router.push('/dashboard')
      return
    }
    
    if (isConfigured && !user) {
      router.push('/login')
      return
    }
    
    if (!isConfigured) {
      router.push('/dashboard')
      return
    }
  }, [router, user, loading, isConfigured])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">FichaChef</h1>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
}
