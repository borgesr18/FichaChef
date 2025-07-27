"use client"

import React from 'react'

interface GradientTextProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success'
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  animated?: boolean
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  variant = 'primary',
  className = '',
  as: Component = 'span',
  animated = false
}) => {
  // Classes de gradiente baseadas na variante
  const gradientClasses = {
    primary: 'fc-gradient-text',
    secondary: 'fc-gradient-text-blue', 
    success: 'fc-gradient-text-green'
  }

  // Classes de animação
  const animationClasses = animated ? 'fc-animate-pulse' : ''
  
  // Combinar classes
  const allClasses = [
    gradientClasses[variant],
    animationClasses,
    className
  ].filter(Boolean).join(' ')

  return (
    <Component className={allClasses}>
      {children}
    </Component>
  )
}

// Componente específico para títulos com gradiente
interface GradientHeadingProps {
  children: React.ReactNode
  level: 1 | 2 | 3 | 4 | 5 | 6
  variant?: 'primary' | 'secondary' | 'success'
  className?: string
  animated?: boolean
  centered?: boolean
}

export const GradientHeading: React.FC<GradientHeadingProps> = ({
  children,
  level,
  variant = 'primary',
  className = '',
  animated = false,
  centered = false
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements
  
  // Classes de tamanho baseadas no nível
  const sizeClasses = {
    1: 'fc-text-4xl fc-font-bold',
    2: 'fc-text-3xl fc-font-bold', 
    3: 'fc-text-2xl fc-font-semibold',
    4: 'fc-text-xl fc-font-semibold',
    5: 'fc-text-lg fc-font-medium',
    6: 'fc-text-base fc-font-medium'
  }

  const centerClasses = centered ? 'fc-text-center' : ''

  return (
    <GradientText
      as={Component}
      variant={variant}
      animated={animated}
      className={`${sizeClasses[level]} ${centerClasses} ${className}`}
    >
      {children}
    </GradientText>
  )
}

// Componente para logo com gradiente
interface GradientLogoProps {
  text: string
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  onClick?: () => void
}

export const GradientLogo: React.FC<GradientLogoProps> = ({
  text,
  icon,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick
}) => {
  const sizeClasses = {
    sm: 'fc-text-lg',
    md: 'fc-text-2xl',
    lg: 'fc-text-3xl',
    xl: 'fc-text-4xl'
  }

  const iconSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl', 
    lg: 'text-3xl',
    xl: 'text-4xl'
  }

  const clickableClasses = onClick ? 'cursor-pointer fc-hover-scale' : ''

  return (
    <div 
      className={`fc-flex fc-items-center fc-gap-3 ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {icon && (
        <span className={iconSizeClasses[size]}>
          {icon}
        </span>
      )}
      <GradientText
        variant={variant}
        className={`${sizeClasses[size]} fc-font-bold`}
      >
        {text}
      </GradientText>
    </div>
  )
}

// Componente para badge com gradiente
interface GradientBadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  outlined?: boolean
}

export const GradientBadge: React.FC<GradientBadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  outlined = false
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const gradientBgClasses = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600',
    secondary: 'bg-gradient-to-r from-blue-500 to-blue-600',
    success: 'bg-gradient-to-r from-green-500 to-green-600'
  }

  const outlinedClasses = outlined 
    ? `border-2 bg-transparent ${variant === 'primary' ? 'border-orange-500' : variant === 'secondary' ? 'border-blue-500' : 'border-green-500'}`
    : `${gradientBgClasses[variant]} text-white`

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${outlinedClasses} ${className}`}>
      {outlined ? (
        <GradientText variant={variant}>
          {children}
        </GradientText>
      ) : (
        children
      )}
    </span>
  )
}

// Componente para texto com efeito de digitação
interface TypingTextProps {
  text: string
  variant?: 'primary' | 'secondary' | 'success'
  speed?: number
  className?: string
  onComplete?: () => void
}

export const TypingText: React.FC<TypingTextProps> = ({
  text,
  variant = 'primary',
  speed = 100,
  className = '',
  onComplete
}) => {
  const [displayText, setDisplayText] = React.useState('')
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return (
    <GradientText variant={variant} className={className}>
      {displayText}
      <span className="fc-animate-pulse">|</span>
    </GradientText>
  )
}

export default GradientText

