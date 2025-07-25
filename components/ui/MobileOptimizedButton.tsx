'use client'

import React from 'react'
import { useProfileInterface } from '@/hooks/useProfileInterface'
import { LucideIcon } from 'lucide-react'

interface MobileOptimizedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  disabled?: boolean
  className?: string
}

export default function MobileOptimizedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  className = ''
}: MobileOptimizedButtonProps) {
  const { config, getColorClasses } = useProfileInterface()

  const sizeClasses = {
    sm: config?.compactMode ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
    md: config?.compactMode ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base',
    lg: config?.compactMode ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg'
  }

  const variantClasses = {
    primary: getColorClasses('primary'),
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    outline: 'border-2 border-current bg-transparent hover:bg-current hover:text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-medium
        transition-all duration-200 touch-manipulation
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${className}
      `}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  )
}
