"use client"

import React from 'react'

interface AnimatedButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  fullWidth?: boolean
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  fullWidth = false
}) => {
  // Classes base
  const baseClasses = 'fc-btn'
  
  // Classes de variante
  const variantClasses = `fc-btn-${variant}`
  
  // Classes de tamanho
  const sizeClasses = size !== 'md' ? `fc-btn-${size}` : ''
  
  // Classes de estado
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
  
  // Classes de largura
  const widthClasses = fullWidth ? 'w-full' : ''
  
  // Combinar todas as classes
  const allClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    disabledClasses,
    widthClasses,
    className
  ].filter(Boolean).join(' ')

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick()
    }
  }

  return (
    <button
      type={type}
      className={allClasses}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <LoadingSpinner size={size} />
      ) : icon ? (
        <span className="fc-btn-icon">{icon}</span>
      ) : null}
      <span className="fc-btn-text">{children}</span>
    </button>
  )
}

// Componente de Loading Spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'white' | 'orange' | 'blue' | 'green'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'white'
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  const colorMap = {
    white: 'border-white border-t-transparent',
    orange: 'border-orange-500 border-t-transparent',
    blue: 'border-blue-500 border-t-transparent',
    green: 'border-green-500 border-t-transparent'
  }

  return (
    <div 
      className={`fc-animate-spin border-2 rounded-full ${sizeMap[size]} ${colorMap[color]}`}
      role="status"
      aria-label="Carregando..."
    >
      <span className="sr-only">Carregando...</span>
    </div>
  )
}

// Componente de Botão com Ícone específico
interface IconButtonProps {
  icon: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
  className?: string
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  variant = 'outline',
  size = 'md',
  tooltip,
  className = ''
}) => {
  const sizeMap = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  }

  return (
    <button
      className={`fc-btn fc-btn-${variant} ${sizeMap[size]} rounded-full ${className}`}
      onClick={onClick}
      title={tooltip}
      aria-label={tooltip}
    >
      {icon}
    </button>
  )
}

// Componente de Grupo de Botões
interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
  direction?: 'horizontal' | 'vertical'
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  spacing = 'md',
  direction = 'horizontal'
}) => {
  const spacingMap = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const directionClasses = direction === 'vertical' ? 'flex-col' : 'flex-row'

  return (
    <div className={`fc-flex ${directionClasses} ${spacingMap[spacing]} ${className}`}>
      {children}
    </div>
  )
}

// Componente de Botão Flutuante (FAB)
interface FloatingActionButtonProps {
  icon: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'success'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  tooltip?: string
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  variant = 'primary',
  position = 'bottom-right',
  tooltip
}) => {
  const positionMap = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-20 right-6',
    'top-left': 'fixed top-20 left-6'
  }

  return (
    <button
      className={`fc-btn fc-btn-${variant} fc-btn-lg rounded-full p-4 shadow-lg z-50 ${positionMap[position]} fc-hover-scale`}
      onClick={onClick}
      title={tooltip}
      aria-label={tooltip}
    >
      {icon}
    </button>
  )
}

export default AnimatedButton

