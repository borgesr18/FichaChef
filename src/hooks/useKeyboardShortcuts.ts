'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface ShortcutHandlers {
  onGlobalSearch: () => void
  onToggleFavorites: () => void
}

export function useKeyboardShortcuts({ onGlobalSearch, onToggleFavorites }: ShortcutHandlers) {
  const router = useRouter()

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'k':
          event.preventDefault()
          onGlobalSearch()
          break
        case 'f':
          if (event.shiftKey) {
            event.preventDefault()
            onToggleFavorites()
          }
          break
      }

      if (event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case 'i':
            event.preventDefault()
            router.push('/dashboard/insumos')
            break
          case 't':
            event.preventDefault()
            router.push('/dashboard/fichas-tecnicas')
            break
          case 'p':
            event.preventDefault()
            router.push('/dashboard/produtos')
            break
          case 'e':
            event.preventDefault()
            router.push('/dashboard/estoque')
            break
          case 'u':
            event.preventDefault()
            router.push('/dashboard/usuarios')
            break
          case 'r':
            event.preventDefault()
            router.push('/dashboard/relatorios')
            break
          case 'c':
            event.preventDefault()
            router.push('/dashboard/cardapios')
            break
          case 'a':
            event.preventDefault()
            router.push('/dashboard/alertas')
            break
        }
      }
    }
  }, [router, onGlobalSearch, onToggleFavorites])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
