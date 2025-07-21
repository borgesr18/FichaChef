'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface FavoriteItem {
  id: string
  title: string
  href: string
  module: string
  type: string
}

interface RecentItem extends FavoriteItem {
  lastAccessed: string
}

interface WorkflowContextType {
  favorites: FavoriteItem[]
  recentItems: RecentItem[]
  addFavorite: (item: FavoriteItem) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  addRecentItem: (item: Omit<RecentItem, 'lastAccessed'>) => void
  clearRecentItems: () => void
}

const WorkflowContext = createContext<WorkflowContextType>({
  favorites: [],
  recentItems: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
  addRecentItem: () => {},
  clearRecentItems: () => {}
})

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('fichachef-favorites')
      const savedRecent = localStorage.getItem('fichachef-recent')
      
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites))
        } catch (error) {
          console.error('Error loading favorites:', error)
        }
      }
      if (savedRecent) {
        try {
          setRecentItems(JSON.parse(savedRecent))
        } catch (error) {
          console.error('Error loading recent items:', error)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fichachef-favorites', JSON.stringify(favorites))
    }
  }, [favorites])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fichachef-recent', JSON.stringify(recentItems))
    }
  }, [recentItems])

  const addFavorite = (item: FavoriteItem) => {
    setFavorites(prev => [...prev.filter(f => f.id !== item.id), item])
  }

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id))
  }

  const isFavorite = (id: string) => {
    return favorites.some(f => f.id === id)
  }

  const addRecentItem = (item: Omit<RecentItem, 'lastAccessed'>) => {
    const recentItem: RecentItem = {
      ...item,
      lastAccessed: new Date().toISOString()
    }
    
    setRecentItems(prev => {
      const filtered = prev.filter(r => r.id !== item.id)
      return [recentItem, ...filtered].slice(0, 10)
    })
  }

  const clearRecentItems = () => {
    setRecentItems([])
  }

  return (
    <WorkflowContext.Provider value={{
      favorites,
      recentItems,
      addFavorite,
      removeFavorite,
      isFavorite,
      addRecentItem,
      clearRecentItems
    }}>
      {children}
    </WorkflowContext.Provider>
  )
}

export const useWorkflow = () => {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider')
  }
  return context
}
