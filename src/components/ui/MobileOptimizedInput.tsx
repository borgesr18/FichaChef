'use client'

import React from 'react'
import { useProfileInterface } from '@/hooks/useProfileInterface'

interface MobileOptimizedInputProps {
  label?: string
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export default function MobileOptimizedInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = ''
}: MobileOptimizedInputProps) {
  const { config } = useProfileInterface()

  return (
    <div className={`${config?.compactMode ? 'space-y-1' : 'space-y-2'}`}>
      {label && (
        <label className={`block font-medium text-gray-700 ${config?.compactMode ? 'text-sm' : 'text-base'}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full rounded-lg border border-gray-300 
          ${config?.compactMode ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-base'}
          focus:ring-2 focus:ring-orange-500 focus:border-orange-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-all duration-300
          touch-manipulation
          mobile-full-width
          ${className}
        `}
      />
    </div>
  )
}
