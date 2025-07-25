'use client'

import React, { useState } from 'react'
import { useProfileInterface } from '@/hooks/useProfileInterface'
import DesignSystemButton from './DesignSystemButton'
import { Palette, Layout, Bell, Keyboard } from 'lucide-react'

interface PersonalizationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function PersonalizationPanel({ isOpen, onClose }: PersonalizationPanelProps) {
  const { config } = useProfileInterface()
  const [activeTab, setActiveTab] = useState('appearance')
  const [settings, setSettings] = useState({
    theme: config?.primaryColor || 'orange',
    compactMode: config?.compactMode || false,
    showNotifications: config?.showNotifications !== false,
    autoRefresh: config?.autoRefresh !== false,
    dashboardLayout: config?.dashboardLayout || 'executive',
    quickActions: config?.quickActions || [],
    hiddenModules: config?.hiddenModules || []
  })

  const tabs = [
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'shortcuts', label: 'Atalhos', icon: Keyboard }
  ]

  const themes = [
    { id: 'orange', name: 'Laranja', color: 'bg-orange-500' },
    { id: 'blue', name: 'Azul', color: 'bg-blue-500' },
    { id: 'green', name: 'Verde', color: 'bg-green-500' }
  ]

  const layouts = [
    { id: 'executive', name: 'Executivo', description: 'Dashboard completo com KPIs e métricas' },
    { id: 'operational', name: 'Operacional', description: 'Foco em controle de custos e relatórios' },
    { id: 'simplified', name: 'Simplificado', description: 'Interface limpa para produção' }
  ]

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Personalização</h2>
              <p className="text-sm text-gray-600 mt-1">Configure sua experiência</p>
            </div>
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Tema de Cores</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {themes.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSettings(prev => ({ ...prev, theme: theme.id }))}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            settings.theme === theme.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-8 h-8 ${theme.color} rounded-full mx-auto mb-2`} />
                          <p className="text-sm font-medium text-gray-900">{theme.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.compactMode}
                        onChange={(e) => setSettings(prev => ({ ...prev, compactMode: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Modo Compacto</p>
                        <p className="text-sm text-gray-600">Interface mais densa com menos espaçamento</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'layout' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Layout do Dashboard</h4>
                    <div className="space-y-3">
                      {layouts.map((layout) => (
                        <label key={layout.id} className="flex items-start space-x-3">
                          <input
                            type="radio"
                            name="layout"
                            value={layout.id}
                            checked={settings.dashboardLayout === layout.id}
                            onChange={(e) => setSettings(prev => ({ ...prev, dashboardLayout: e.target.value as 'executive' | 'operational' | 'simplified' }))}
                            className="mt-1 border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{layout.name}</p>
                            <p className="text-sm text-gray-600">{layout.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Mostrar Notificações</p>
                        <p className="text-sm text-gray-600">Exibir alertas e notificações do sistema</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.showNotifications}
                        onChange={(e) => setSettings(prev => ({ ...prev, showNotifications: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Atualização Automática</p>
                        <p className="text-sm text-gray-600">Atualizar dados automaticamente</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoRefresh}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'shortcuts' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Atalhos de Teclado</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Busca Global</span>
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">⌘K</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Toggle Favoritos</span>
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">⌘⇧F</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Insumos</span>
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">⌘⇧I</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Fichas Técnicas</span>
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">⌘⇧T</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <DesignSystemButton variant="ghost" onClick={onClose}>
                Cancelar
              </DesignSystemButton>
              <DesignSystemButton variant="primary" onClick={handleSave}>
                Salvar Configurações
              </DesignSystemButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
