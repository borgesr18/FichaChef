'use client'

import React from 'react'
import { useProfileInterface } from '@/hooks/useProfileInterface'

interface MobileOptimizedCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export default function MobileOptimizedCard({ 
  children, 
  className = '', 
  padding = 'md',
  hover = true 
}: MobileOptimizedCardProps) {
  const { config } = useProfileInterface()

  const paddingClasses = {
    sm: config?.compactMode ? 'p-3' : 'p-4',
    md: config?.compactMode ? 'p-4' : 'p-6',
    lg: config?.compactMode ? 'p-6' : 'p-8'
  }

  return (
    <div className={`
      glass-morphism rounded-xl shadow-elegant border border-white/20
      ${hover ? 'hover:shadow-floating hover:border-white/30 card-modern' : ''}
      ${paddingClasses[padding]}
      transition-all duration-300
      touch-manipulation
      ${className}
    `}>
      {children}
    </div>
  )
}
