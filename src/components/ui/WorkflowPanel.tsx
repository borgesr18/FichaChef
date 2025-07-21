'use client'

import React, { useState } from 'react'
import { Star, Clock, X, Heart, Trash2 } from 'lucide-react'
import { useWorkflow } from '../providers/WorkflowProvider'
import { useRouter } from 'next/navigation'

interface WorkflowPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function WorkflowPanel({ isOpen, onClose }: WorkflowPanelProps) {
  const [activeTab, setActiveTab] = useState<'favorites' | 'recent'>('favorites')
  const { favorites, recentItems, removeFavorite, clearRecentItems } = useWorkflow()
  const router = useRouter()

  if (!isOpen) return null

  const handleItemClick = (href: string) => {
    router.push(href)
    onClose()
  }

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-l border-gray-200 shadow-lg z-40">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Workflow</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'favorites'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Star className="h-4 w-4 inline mr-2" />
          Favoritos ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'recent'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          Recentes ({recentItems.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'favorites' ? (
          favorites.length > 0 ? (
            <div className="space-y-2">
              {favorites.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer group"
                  onClick={() => handleItemClick(item.href)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.module}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFavorite(item.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Star className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhum favorito ainda</p>
              <p className="text-xs text-gray-400 mt-1">
                Clique no ícone ⭐ nos itens para adicioná-los aos favoritos
              </p>
            </div>
          )
        ) : (
          <div>
            {recentItems.length > 0 && (
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-500">Últimos acessos</span>
                <button
                  onClick={clearRecentItems}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3 w-3 inline mr-1" />
                  Limpar
                </button>
              </div>
            )}
            
            {recentItems.length > 0 ? (
              <div className="space-y-2">
                {recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={() => handleItemClick(item.href)}
                  >
                    <div className="font-medium text-sm text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500">
                      {item.module} • {new Date(item.lastAccessed).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhum item recente</p>
                <p className="text-xs text-gray-400 mt-1">
                  Navegue pelos módulos para ver os itens recentes aqui
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">⌘K</kbd> Busca Global</div>
          <div><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">⌘⇧F</kbd> Toggle Favoritos</div>
          <div><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">⌘⇧I</kbd> Insumos</div>
          <div><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">⌘⇧T</kbd> Fichas Técnicas</div>
        </div>
      </div>
    </div>
  )
}
