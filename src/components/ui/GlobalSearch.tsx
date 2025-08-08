'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Modal from './Modal'

interface SearchResult {
  id: string
  title: string
  subtitle: string
  module: string
  href: string
  type: 'insumo' | 'ficha' | 'produto' | 'fornecedor' | 'menu'
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const searchAcrossModules = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const [insumos, fichas, produtos, fornecedores, menus] = await Promise.all([
        fetch(`/api/insumos?search=${encodeURIComponent(searchQuery)}`).then(r => r.ok ? r.json() : []),
        fetch(`/api/fichas-tecnicas?search=${encodeURIComponent(searchQuery)}`).then(r => r.ok ? r.json() : []),
        fetch(`/api/produtos?search=${encodeURIComponent(searchQuery)}`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
        fetch(`/api/fornecedores?search=${encodeURIComponent(searchQuery)}`).then(r => r.ok ? r.json() : []),
        fetch(`/api/menus?search=${encodeURIComponent(searchQuery)}`).then(r => r.ok ? r.json() : [])
      ])

      const searchResults: SearchResult[] = [
        ...insumos.map((item: { id: string; nome: string; categoria?: { nome: string } }) => ({
          id: item.id,
          title: item.nome,
          subtitle: item.categoria?.nome || 'Insumo',
          module: 'Insumos',
          href: '/dashboard/insumos',
          type: 'insumo' as const
        })),
        ...fichas.map((item: { id: string; nome: string; categoria?: { nome: string } }) => ({
          id: item.id,
          title: item.nome,
          subtitle: item.categoria?.nome || 'Ficha Técnica',
          module: 'Fichas Técnicas',
          href: '/dashboard/fichas-tecnicas',
          type: 'ficha' as const
        })),
        ...produtos.map((item: { id: string; nome: string; peso?: number; preco?: number }) => ({
          id: item.id,
          title: item.nome,
          subtitle: `${item.peso || 0}g - R$ ${item.preco?.toFixed(2) || '0.00'}`,
          module: 'Produtos',
          href: '/dashboard/produtos',
          type: 'produto' as const
        })),
        ...fornecedores.map((item: { id: string; nome: string; email?: string; telefone?: string }) => ({
          id: item.id,
          title: item.nome,
          subtitle: item.email || item.telefone || 'Fornecedor',
          module: 'Fornecedores',
          href: '/dashboard/fornecedores',
          type: 'fornecedor' as const
        })),
        ...menus.map((item: { id: string; nome: string; descricao?: string }) => ({
          id: item.id,
          title: item.nome,
          subtitle: item.descricao || 'Menu',
          module: 'Cardápios',
          href: '/dashboard/cardapios',
          type: 'menu' as const
        }))
      ]

      setResults(searchResults.slice(0, 10))
    } catch (error) {
      console.error('Global search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchAcrossModules(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, searchAcrossModules])

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href)
    onClose()
    setQuery('')
  }

  const handleClose = () => {
    onClose()
    setQuery('')
    setResults([])
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Busca Global" size="lg">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar em todos os módulos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Buscando...</div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
                >
                  <div className="font-medium text-gray-900">{result.title}</div>
                  <div className="text-sm text-gray-500">{result.module} • {result.subtitle}</div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="text-center py-8 text-gray-500">Nenhum resultado encontrado</div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Digite para buscar em todos os módulos</p>
              <p className="text-xs text-gray-400 mt-1">Insumos, Fichas Técnicas, Produtos, Fornecedores e Cardápios</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
