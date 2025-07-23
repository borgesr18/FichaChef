'use client'

import React, { useState, useRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface FloatingLabelInputProps {
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'datetime-local'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
  step?: string
  min?: string
  max?: string
}

export default function FloatingLabelInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  step,
  min,
  max
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const hasValue = value && value.length > 0
  const isFloating = isFocused || hasValue
  
  const handleFocus = () => {
    setIsFocused(true)
  }
  
  const handleBlur = () => {
    setIsFocused(false)
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }
  
  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? placeholder : ''}
          required={required}
          disabled={disabled}
          step={step}
          min={min}
          max={max}
          className={`
            peer w-full px-4 pt-6 pb-2 text-slate-800 bg-white/80 backdrop-blur-sm border-2 rounded-xl
            transition-all duration-300 ease-out
            focus:outline-none focus:ring-0
            disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20' 
              : isFocused 
                ? 'border-blue-500 focus:border-blue-600 focus:shadow-lg focus:shadow-blue-500/20' 
                : 'border-slate-300 hover:border-slate-400'
            }
            ${type === 'password' ? 'pr-12' : ''}
          `}
        />
        
        <label
          className={`
            absolute left-4 transition-all duration-300 ease-out cursor-text pointer-events-none z-30
            ${isFloating
              ? 'top-2 text-xs font-semibold bg-white/90 px-2 rounded shadow-sm'
              : 'top-1/2 -translate-y-1/2 text-base'
            }
            ${error
              ? 'text-red-500'
              : isFocused
                ? 'text-blue-600'
                : 'text-slate-500'
            }
          `}
          onClick={() => inputRef.current?.focus()}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700 transition-colors duration-200"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <div className="mt-2 flex items-center space-x-2">
          <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}
      
      {/* Focus indicator */}
      <div className={`
        absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full
        transition-all duration-300 ease-out
        ${isFocused ? 'w-full' : 'w-0'}
      `} />
    </div>
  )
}
