'use client'

import React from 'react'
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface ChartData {
  label: string
  value: number
  color?: string
  trend?: 'up' | 'down' | 'stable'
}

interface ModernChartProps {
  title: string
  data: ChartData[]
  type?: 'bar' | 'line' | 'donut' | 'area'
  height?: number
  showTrend?: boolean
  className?: string
}

export default function ModernChart({ 
  title, 
  data, 
  type = 'bar', 
  height = 300, 
  showTrend = false,
  className = '' 
}: ModernChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  const getBarHeight = (value: number) => {
    return (value / maxValue) * (height - 80)
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-slate-500" />
    }
  }

  const getDefaultColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-emerald-500 to-emerald-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600'
    ]
    return colors[index % colors.length]
  }

  if (type === 'bar') {
    return (
      <div className={`glass-morphism p-6 rounded-2xl shadow-floating border border-white/20 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
            {title}
          </h3>
          <BarChart3 className="h-6 w-6 text-slate-500" />
        </div>
        
        <div className="flex items-end justify-between space-x-4" style={{ height: `${height}px` }}>
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="relative w-full flex justify-center mb-2">
                <div
                  className={`w-full max-w-16 bg-gradient-to-t ${item.color || getDefaultColor(index)} rounded-t-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative overflow-hidden`}
                  style={{ height: `${getBarHeight(item.value)}px`, minHeight: '20px' }}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {item.value.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 mb-1">{item.label}</p>
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-xs text-slate-500">{item.value.toLocaleString()}</span>
                  {showTrend && getTrendIcon(item.trend)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'donut') {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let cumulativePercentage = 0

    return (
      <div className={`glass-morphism p-6 rounded-2xl shadow-floating border border-white/20 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-3"></div>
            {title}
          </h3>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="20"
              />
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100
                const strokeDasharray = `${percentage * 5.02} 502`
                const strokeDashoffset = -cumulativePercentage * 5.02
                cumulativePercentage += percentage
                
                return (
                  <circle
                    key={index}
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={`url(#gradient-${index})`}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    style={{ animationDelay: `${index * 200}ms` }}
                  />
                )
              })}
              <defs>
                {data.map((item, index) => (
                  <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={`hsl(${index * 60}, 70%, 55%)`} />
                    <stop offset="100%" stopColor={`hsl(${index * 60}, 70%, 45%)`} />
                  </linearGradient>
                ))}
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{total.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
            </div>
          </div>
          
          <div className="ml-8 space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ background: `hsl(${index * 60}, 70%, 50%)` }}
                ></div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-500">
                    {item.value.toLocaleString()} ({((item.value / total) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
