import React from 'react'
import { clsx } from 'clsx'
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label,
    error,
    helperText,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    const baseClasses = 'block w-full px-4 py-3 text-slate-900 bg-white border rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const stateClasses = error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500 hover:border-slate-400'

    return (
      <div className={clsx('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {Icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-slate-400" />
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              baseClasses,
              stateClasses,
              Icon && iconPosition === 'left' && 'pl-10',
              Icon && iconPosition === 'right' && 'pr-10',
              className
            )}
            {...props}
          />
          
          {Icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-slate-400" />
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 flex items-center">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

