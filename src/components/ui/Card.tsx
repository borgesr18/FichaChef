import React from 'react'
import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hover = false, children, ...props }, ref) => {
    const baseClasses = 'bg-white rounded-2xl transition-all duration-300'
    
    const variants = {
      default: 'border border-slate-200/60 shadow-sm',
      elevated: 'shadow-lg hover:shadow-xl border border-slate-100',
      outlined: 'border-2 border-slate-200 hover:border-slate-300',
      glass: 'backdrop-blur-md bg-white/80 border border-white/20 shadow-xl'
    }
    
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    }
    
    const hoverClasses = hover ? 'hover:scale-[1.02] hover:shadow-lg cursor-pointer' : ''

    return (
      <div
        ref={ref}
        className={clsx(
          baseClasses,
          variants[variant],
          paddings[padding],
          hoverClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('flex items-start justify-between space-y-1.5 pb-4', className)}
        {...props}
      >
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-slate-900 leading-none tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-slate-600">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    )
  }
)

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('text-slate-700', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('flex items-center pt-4 border-t border-slate-100', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardContent, CardFooter }

