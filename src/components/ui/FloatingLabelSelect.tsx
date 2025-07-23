'use client'

import React, { useState, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface FloatingLabelSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
  placeholder?: string
}

export default function FloatingLabelSelect({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  error,
  className = '',
  placeholder = 'Selecione uma opção'
}: FloatingLabelSelectProps) {
  const [isFocused, setIsFocused] = useState(false)
  const selectRef = useRef<HTMLSelectElement>(null)
  
  const hasValue = value && value.length > 0
  const isFloating = isFocused || hasValue
  
  const handleFocus = () => {
    setIsFocused(true)
  }
  
  const handleBlur = () => {
    setIsFocused(false)
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <select
          ref={selectRef}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          className={`
            peer w-full px-4 pt-6 pb-2 text-slate-800 bg-white/80 backdrop-blur-sm border-2 rounded-xl
            transition-all duration-300 ease-out appearance-none cursor-pointer
            focus:outline-none focus:ring-0
            disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20' 
              : isFocused 
                ? 'border-blue-500 focus:border-blue-600 focus:shadow-lg focus:shadow-blue-500/20' 
                : 'border-slate-300 hover:border-slate-400'
            }
          `}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <label
          className={`
            absolute left-4 transition-all duration-300 ease-out cursor-pointer pointer-events-none
            ${isFloating
              ? 'top-2 text-xs font-semibold bg-white px-2 rounded z-50'
              : 'top-1/2 -translate-y-1/2 text-base z-30'
            }
            ${error
              ? 'text-red-500'
              : isFocused
                ? 'text-blue-600'
                : 'text-slate-500'
            }
          `}
          onClick={() => selectRef.current?.focus()}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <ChevronDown className={`
          absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none
          transition-all duration-300 ease-out
          ${isFocused ? 'rotate-180 text-blue-600' : 'text-slate-500'}
        `} />
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
