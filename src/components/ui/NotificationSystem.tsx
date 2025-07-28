'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  persistent?: boolean
}

interface NotificationSystemProps {
  notifications: Notification[]
  onRemove: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

const NotificationItem: React.FC<{
  notification: Notification
  onRemove: (id: string) => void
}> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = useCallback(() => {
    setIsRemoving(true)
    setTimeout(() => {
      onRemove(notification.id)
    }, 300)
  }, [notification.id, onRemove])

  useEffect(() => {
    if (!notification.persistent && notification.duration !== 0) {
      const duration = notification.duration || 5000
      const timer = setTimeout(() => {
        handleRemove()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [notification, handleRemove])


  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-emerald-500" />
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-amber-500" />
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />
      default:
        return <Info className="h-6 w-6 text-slate-500" />
    }
  }

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 shadow-emerald-500/20'
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-red-500/20'
      case 'warning':
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 shadow-amber-500/20'
      case 'info':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-blue-500/20'
      default:
        return 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200 shadow-slate-500/20'
    }
  }

  return (
    <div
      className={`
        relative overflow-hidden backdrop-blur-sm border rounded-2xl shadow-xl p-4 mb-3 max-w-md
        transition-all duration-300 ease-out
        ${getColorClasses()}
        ${isVisible && !isRemoving 
          ? 'transform translate-x-0 opacity-100 scale-100' 
          : 'transform translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-800 mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            {notification.message}
          </p>
        </div>
        
        <button
          onClick={handleRemove}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-all duration-300 group"
        >
          <X className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
        </button>
      </div>
      
      {/* Progress bar for timed notifications */}
      {!notification.persistent && notification.duration !== 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-slate-400 to-slate-500 animate-shrink"
            style={{ 
              animationDuration: `${notification.duration || 5000}ms`,
              animationTimingFunction: 'linear'
            }}
          />
        </div>
      )}
    </div>
  )
}

export default function NotificationSystem({
  notifications,
  onRemove,
  position = 'top-right'
}: NotificationSystemProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2'
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2'
      default:
        return 'top-4 right-4'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [idCounter, setIdCounter] = useState(0)

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${idCounter}`
    setIdCounter(prev => prev + 1)
    setNotifications(prev => [...prev, { ...notification, id }])
  }, [idCounter])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  }
}
