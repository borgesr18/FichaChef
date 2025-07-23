'use client'

import React from 'react'
import { useProfileInterface } from '@/hooks/useProfileInterface'

interface MobileOptimizedFormProps {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  className?: string
}

export default function MobileOptimizedForm({ 
  children, 
  onSubmit,
  className = '' 
}: MobileOptimizedFormProps) {
  const { config } = useProfileInterface()

  return (
    <form 
      onSubmit={onSubmit}
      className={`
        space-y-4 
        ${config?.compactMode ? 'space-y-3' : 'space-y-4'}
        mobile-stack mobile-gap-2
        ${className}
      `}
    >
      {children}
    </form>
  )
}
