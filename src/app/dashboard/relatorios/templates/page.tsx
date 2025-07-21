'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import { Palette, Plus, Edit, Trash2 } from 'lucide-react'

interface ExportTemplate {
  id?: string
  nome: string
  tipo: string
  configuracao: {
    cores: {
      primaria: string
      secundaria: string
      texto: string
    }
    fonte: {
      familia: string
      tamanho: number
    }
    layout: {
      margens: number
      espacamento: number
      logoEmpresa: boolean
    }
  }
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ExportTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ExportTemplate | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'default',
    configuracao: {
      cores: {
        primaria: '#2563eb',
        secundaria: '#64748b',
        texto: '#1f2937'
      },
      fonte: {
        familia: 'Arial',
        tamanho: 12
      },
      layout: {
        margens: 20,
        espacamento: 8,
        logoEmpresa: true
      }
    }
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/relatorio-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingTemplate ? `/api/relatorio-templates/${editingTemplate.id}` : '/api/relatorio-templates'
      const method = editingTemplate ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchTemplates()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return
    
    try {
      const response = await fetch(`/api/relatorio-templates/${templateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTemplates()
      }
    } catch (error) {
      console.error('Error deleting template:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'default',
      configuracao: {
        cores: {
          primaria: '#2563eb',
          secundaria: '#64748b',
          texto: '#1f2937'
        },
        fonte: {
          familia: 'Arial',
          tamanho: 12
        },
        layout: {
          margens: 20,
          espacamento: 8,
          logoEmpresa: true
        }
      }
    })
    setEditingTemplate(null)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Palette className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Templates de Relatórios</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">{template.nome}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingTemplate(template)
                      setFormData(template)
                      setShowModal(true)
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(template.id!)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: template.configuracao.cores.primaria }}
                  />
                  <span className="text-sm text-gray-600">Cor Primária</span>
                </div>
                <div className="text-sm text-gray-600">
                  Fonte: {template.configuracao.fonte.familia} {template.configuracao.fonte.tamanho}px
                </div>
                <div className="text-sm text-gray-600">
                  Tipo: {template.tipo}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            resetForm()
          }}
          title={editingTemplate ? 'Editar Template' : 'Novo Template'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Template
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Relatório
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="default">Padrão (Todos)</option>
                <option value="custos">Análise de Custos</option>
                <option value="producao">Relatório de Produção</option>
                <option value="estoque">Controle de Estoque</option>
                <option value="fichas">Fichas Mais Utilizadas</option>
                <option value="rentabilidade">Relatório de Rentabilidade</option>
                <option value="abc-insumos">Análise ABC de Insumos</option>
                <option value="desperdicio">Relatório de Desperdício</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Primária
                </label>
                <input
                  type="color"
                  value={formData.configuracao.cores.primaria}
                  onChange={(e) => setFormData({
                    ...formData,
                    configuracao: {
                      ...formData.configuracao,
                      cores: {
                        ...formData.configuracao.cores,
                        primaria: e.target.value
                      }
                    }
                  })}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Secundária
                </label>
                <input
                  type="color"
                  value={formData.configuracao.cores.secundaria}
                  onChange={(e) => setFormData({
                    ...formData,
                    configuracao: {
                      ...formData.configuracao,
                      cores: {
                        ...formData.configuracao.cores,
                        secundaria: e.target.value
                      }
                    }
                  })}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor do Texto
                </label>
                <input
                  type="color"
                  value={formData.configuracao.cores.texto}
                  onChange={(e) => setFormData({
                    ...formData,
                    configuracao: {
                      ...formData.configuracao,
                      cores: {
                        ...formData.configuracao.cores,
                        texto: e.target.value
                      }
                    }
                  })}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Família da Fonte
                </label>
                <select
                  value={formData.configuracao.fonte.familia}
                  onChange={(e) => setFormData({
                    ...formData,
                    configuracao: {
                      ...formData.configuracao,
                      fonte: {
                        ...formData.configuracao.fonte,
                        familia: e.target.value
                      }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times">Times</option>
                  <option value="Courier">Courier</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho da Fonte
                </label>
                <input
                  type="number"
                  min="8"
                  max="24"
                  value={formData.configuracao.fonte.tamanho}
                  onChange={(e) => setFormData({
                    ...formData,
                    configuracao: {
                      ...formData.configuracao,
                      fonte: {
                        ...formData.configuracao.fonte,
                        tamanho: parseInt(e.target.value)
                      }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="logoEmpresa"
                checked={formData.configuracao.layout.logoEmpresa}
                onChange={(e) => setFormData({
                  ...formData,
                  configuracao: {
                    ...formData.configuracao,
                    layout: {
                      ...formData.configuracao.layout,
                      logoEmpresa: e.target.checked
                    }
                  }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="logoEmpresa" className="ml-2 block text-sm text-gray-900">
                Incluir logo da empresa
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingTemplate ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
