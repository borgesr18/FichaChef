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
      primary: 'bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] hover:from-[#0F1B2E] hover:to-[#4A9FE7] text-white shadow-lg hover:shadow-xl focus:ring-[#5AC8FA]/50 hover:scale-[1.02] active:scale-[0.98]',
      secondary: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl focus:ring-slate-500 hover:scale-[1.02] active:scale-[0.98]',
      outline: 'border-2 border-[#5AC8FA]/30 hover:border-[#5AC8FA] text-[#1B2E4B] hover:text-[#5AC8FA] bg-white hover:bg-blue-50 focus:ring-[#5AC8FA]/50 hover:scale-[1.02] active:scale-[0.98]',
      ghost: 'text-[#1B2E4B] hover:text-[#5AC8FA] hover:bg-blue-50 focus:ring-[#5AC8FA]/50 hover:scale-[1.02] active:scale-[0.98]',
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
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
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

Button.displayName = 'Button'

export default Button

