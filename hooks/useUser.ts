'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  email?: string
  role?: string
  nome?: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/perfil-usuario')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasRole = (role: string) => {
    return user?.role === role
  }

  const hasAnyRole = (roles: string[]) => {
    return user?.role && roles.includes(user.role)
  }

  return { user, loading, hasRole, hasAnyRole, refetch: fetchUser }
}
