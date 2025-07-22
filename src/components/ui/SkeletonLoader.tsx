'use client'

import React from 'react'

interface SkeletonLoaderProps {
  variant?: 'card' | 'table' | 'text' | 'avatar' | 'button'
  count?: number
  className?: string
}

export default function SkeletonLoader({ variant = 'card', count = 1, className = '' }: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count }, (_, index) => {
    switch (variant) {
      case 'card':
        return (
          <div key={index} className={`bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/60 animate-pulse ${className}`}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-3/4"></div>
                <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-1/2"></div>
              </div>
            </div>
          </div>
        )
      
      case 'table':
        return (
          <tr key={index} className="animate-pulse">
            <td className="px-6 py-4">
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-24"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-32"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-20"></div>
            </td>
            <td className="px-6 py-4">
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg"></div>
                <div className="h-8 w-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg"></div>
              </div>
            </td>
          </tr>
        )
      
      case 'text':
        return (
          <div key={index} className={`space-y-2 ${className}`}>
            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-full animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-4/6 animate-pulse"></div>
          </div>
        )
      
      case 'avatar':
        return (
          <div key={index} className={`flex items-center space-x-3 ${className}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full animate-pulse"></div>
            <div className="space-y-1">
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-24 animate-pulse"></div>
              <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-16 animate-pulse"></div>
            </div>
          </div>
        )
      
      case 'button':
        return (
          <div key={index} className={`h-10 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl w-24 animate-pulse ${className}`}></div>
        )
      
      default:
        return (
          <div key={index} className={`h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse ${className}`}></div>
        )
    }
  })

  return <>{skeletons}</>
}
