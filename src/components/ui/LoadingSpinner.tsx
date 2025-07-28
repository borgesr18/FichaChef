'use client'

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  variant?: 'default' | 'dots' | 'pulse'
}

export default function LoadingSpinner({ size = 'md', className = '', variant = 'default' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  if (variant === 'dots') {
    const dotSize = {
      sm: 'h-1 w-1',
      md: 'h-2 w-2',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4'
    }

    return (
      <div className={`flex space-x-1 ${className}`}>
        <div className={`${dotSize[size]} bg-orange-500 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${dotSize[size]} bg-orange-500 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${dotSize[size]} bg-orange-500 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse ${className}`}></div>
    )
  }

  return (
    <Loader2 className={`animate-spin text-orange-500 shadow-elegant ${sizeClasses[size]} ${className}`} style={{ 
      animation: 'spin 1s linear infinite, pulse 2s ease-in-out infinite alternate' 
    }} />
  )
}

