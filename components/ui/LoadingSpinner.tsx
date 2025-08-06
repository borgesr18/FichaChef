'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  variant?: 'default' | 'dots' | 'pulse' | 'ring'
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
        <div className={`${dotSize[size]} bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${dotSize[size]} bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${dotSize[size]} bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] rounded-full animate-pulse ${className}`}></div>
    )
  }

  if (variant === 'ring') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="animate-spin rounded-full h-full w-full border-4 border-gray-200/30 border-t-[#5AC8FA] border-r-[#1B2E4B]"></div>
      </div>
    )
  }

  // Default variant - spinner moderno UXPilot
  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-2 border-gray-200/30 border-t-[#5AC8FA] border-r-[#1B2E4B] ${className}`}></div>
  )
}

