'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Settings, Plus } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('categorias-insumos')

  const tabs = [
    { id: 'categorias-insumos', label: 'Categorias de Insumos' },
    { id: 'categorias-receitas', label: 'Categorias de Receitas' },
    { id: 'unidades-medida', label: 'Unidades de Medida' },
    { id: 'usuarios', label: 'Usuários' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Settings className="h-6 w-6 text-gray-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'categorias-insumos' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Categorias de Insumos</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Categoria
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-center">Nenhuma categoria cadastrada</p>
                </div>
              </div>
            )}

            {activeTab === 'categorias-receitas' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Categorias de Receitas</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Categoria
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-center">Nenhuma categoria cadastrada</p>
                </div>
              </div>
            )}

            {activeTab === 'unidades-medida' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Unidades de Medida</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Unidade
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-center">Nenhuma unidade cadastrada</p>
                </div>
              </div>
            )}

            {activeTab === 'usuarios' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Controle de Usuários</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Usuário
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-center">Nenhum usuário cadastrado</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
