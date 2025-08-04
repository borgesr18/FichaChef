'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'

export default function Home() {
  const router = useRouter()
  const { user, loading, isConfigured } = useSupabase()

  useEffect(() => {
    console.log('🔍 Root page useEffect:', { loading, user: !!user, userEmail: user?.email, isConfigured })
    
    if (loading) {
      console.log('🚫 Root page: Still loading, waiting...')
      return
    }
    
    if (user) {
      console.log('✅ Root page: User authenticated, redirecting to dashboard:', user.email)
      router.push('/dashboard')
      return
    }
    
    if (isConfigured && !user) {
      console.log('🔒 Root page: No user, redirecting to login')
      router.push('/login')
      return
    }
    
    if (!isConfigured) {
      console.log('🔧 Root page: Not configured, redirecting to dashboard')
      router.push('/dashboard')
      return
    }
  }, [router, user, loading, isConfigured])

  return null
}
