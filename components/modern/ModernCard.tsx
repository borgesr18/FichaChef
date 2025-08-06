"use client"

import React from 'react'

interface ModernCardProps {
  children: React.ReactNode
  variant?: 'default' | 'gradient-orange' | 'gradient-blue' | 'gradient-green'
  className?: string
  onClick?: () => void
  hover?: boolean
  animated?: boolean
  delay?: number
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  hover = true,
  animated = false,
  delay = 0
}) => {
  // Classes base do card
  const baseClasses = 'fc-card'
  
  // Classes de variante (gradiente)
  const variantClasses = variant !== 'default' ? `fc-card-${variant}` : ''
  
  // Classes de hover
  const hoverClasses = hover ? 'fc-hover-lift' : ''
  
  // Classes de clique
  const clickableClasses = onClick ? 'cursor-pointer' : ''
  
  // Classes de animação
  const animationClasses = animated ? 'fc-animate-slide-in-up' : ''
  
  // Classes de delay
  const delayClasses = delay > 0 ? `fc-delay-${delay}` : ''
  
  // Combinar todas as classes
  const allClasses = [
    baseClasses,
    variantClasses,
    hoverClasses,
    clickableClasses,
    animationClasses,
    delayClasses,
    className
  ].filter(Boolean).join(' ')

  // Estilos inline para delay customizado
  const inlineStyles = delay > 500 ? { animationDelay: `${delay}ms` } : {}

  return (
    <div 
      className={allClasses} 
      onClick={onClick}
      style={inlineStyles}
    >
      {children}
    </div>
  )
}

// Componente para estatísticas do dashboard
interface StatCardProps {
  icon: string
  number: string | number
  label: string
  variant?: 'gradient-orange' | 'gradient-blue' | 'gradient-green' | 'default'
  animated?: boolean
  delay?: number
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  number,
  label,
  variant = 'default',
  animated = true,
  delay = 0
}) => {
  return (
    <ModernCard 
      variant={variant} 
      hover={true} 
      animated={animated} 
      delay={delay}
      className="fc-stat-card"
    >
      <div className="fc-stat-icon">{icon}</div>
      <div className="fc-stat-number">{number}</div>
      <div className="fc-stat-label">{label}</div>
    </ModernCard>
  )
}

// Componente para ações rápidas
interface ActionCardProps {
  icon: string
  title: string
  description?: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'success'
  animated?: boolean
  delay?: number
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  description,
  onClick,
  variant = 'primary',
  animated = true,
  delay = 0
}) => {
  const variantMap = {
    primary: 'gradient-orange',
    secondary: 'gradient-blue', 
    success: 'gradient-green'
  } as const

  return (
    <ModernCard 
      variant={variantMap[variant]}
      onClick={onClick}
      hover={true}
      animated={animated}
      delay={delay}
      className="fc-action-card text-center cursor-pointer"
    >
      <div className="fc-stat-icon">{icon}</div>
      <div className="fc-font-semibold fc-mb-2">{title}</div>
      {description && (
        <div className="fc-text-sm opacity-90">{description}</div>
      )}
    </ModernCard>
  )
}

export default ModernCard

