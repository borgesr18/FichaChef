'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Palette, Plus, Edit, Trash2, FileText, Settings, BarChart3, Package } from 'lucide-react'

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

  // Calcular estatísticas
  const stats = {
    totalTemplates: templates.length,
    templatesAtivos: templates.length, // Todos são considerados ativos
    templatesPadrao: templates.filter(t => t.tipo === 'default').length,
    templatesPersonalizados: templates.filter(t => t.tipo !== 'default').length
  }

  const getTemplateTypeLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      'default': 'Padrão (Todos)',
      'custos': 'Análise de Custos',
      'producao': 'Relatório de Produção',
      'estoque': 'Controle de Estoque',
      'fichas': 'Fichas Mais Utilizadas',
      'rentabilidade': 'Relatório de Rentabilidade',
      'abc-insumos': 'Análise ABC de Insumos',
      'desperdicio': 'Relatório de Desperdício'
    }
    return labels[tipo] || tipo
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5AC8FA]"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] bg-clip-text text-transparent">
                Templates de Relatórios
              </h1>
              <p className="text-gray-600 mt-1">Personalize a aparência dos seus relatórios</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Template
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total de Templates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTemplates}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Templates Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.templatesAtivos}</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                <Settings className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Templates Padrão</p>
                <p className="text-2xl font-bold text-gray-900">{stats.templatesPadrao}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl">
                <BarChart3 className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Personalizados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.templatesPersonalizados}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <Package className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Templates */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Palette className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template encontrado</h3>
              <p className="text-gray-600 mb-4">Clique em &quot;Novo Template&quot; para começar.</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Criar Primeiro Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{template.nome}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingTemplate(template)
                          setFormData(template)
                          setShowModal(true)
                        }}
                        className="text-[#5AC8FA] hover:text-[#1B2E4B] transition-colors p-2 rounded-lg hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(template.id!)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tipo:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {getTemplateTypeLabel(template.tipo)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cores:</span>
                      <div className="flex space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: template.configuracao.cores.primaria }}
                          title="Cor Primária"
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: template.configuracao.cores.secundaria }}
                          title="Cor Secundária"
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: template.configuracao.cores.texto }}
                          title="Cor do Texto"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fonte:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {template.configuracao.fonte.familia} {template.configuracao.fonte.tamanho}px
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Logo:</span>
                      <span className={`text-sm font-medium ${template.configuracao.layout.logoEmpresa ? 'text-green-600' : 'text-gray-400'}`}>
                        {template.configuracao.layout.logoEmpresa ? 'Incluído' : 'Não incluído'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingTemplate ? 'Editar Template' : 'Novo Template'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Template
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
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
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configuração de Cores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor Primária
                      </label>
                      <div className="flex items-center space-x-3">
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
                          className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
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
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor Secundária
                      </label>
                      <div className="flex items-center space-x-3">
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
                          className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
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
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor do Texto
                      </label>
                      <div className="flex items-center space-x-3">
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
                          className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
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
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configuração de Fonte</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-[#5AC8FA] focus:ring-2 focus:ring-[#5AC8FA]/20 focus:outline-none transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configuração de Layout</h3>
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
                      className="h-4 w-4 text-[#5AC8FA] focus:ring-[#5AC8FA] border-gray-300 rounded"
                    />
                    <label htmlFor="logoEmpresa" className="ml-2 block text-sm text-gray-900">
                      Incluir logo da empresa nos relatórios
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    {editingTemplate ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
