import React from 'react'
import { clsx } from 'clsx'
import { LucideIcon } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl focus:ring-blue-500 hover:scale-[1.02] active:scale-[0.98]',
      secondary: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl focus:ring-slate-500 hover:scale-[1.02] active:scale-[0.98]',
      outline: 'border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 glass-morphism hover:shadow-elegant focus:ring-slate-500 hover:scale-[1.02] active:scale-[0.98]',
      ghost: 'text-slate-600 hover:text-slate-800 hover:bg-slate-100 focus:ring-slate-500 hover:scale-[1.02] active:scale-[0.98]',
      danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl focus:ring-red-500 hover:scale-[1.02] active:scale-[0.98]'
    }
    
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base'
    }

    return (
      <button
        className={clsx(
          baseClasses,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {Icon && iconPosition === 'left' && !loading && (
          <Icon className={clsx('h-4 w-4', children && 'mr-2')} />
        )}
        {children}
        {Icon && iconPosition === 'right' && !loading && (
          <Icon className={clsx('h-4 w-4', children && 'ml-2')} />
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button

