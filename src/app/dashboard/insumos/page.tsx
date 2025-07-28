'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import TacoSearchModal from '@/components/ui/TacoSearchModal'
import FloatingLabelInput from '@/components/ui/FloatingLabelInput'
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect'
import ModernTable from '@/components/ui/ModernTable'
import { useNotifications } from '@/components/ui/NotificationSystem'
import { Package, Plus, Search, Edit, Trash2 } from 'lucide-react'
import { convertFormDataToNumbers } from '@/lib/form-utils'

interface Insumo {
  id: string
  nome: string
  marca?: string
  fornecedor?: string
  fornecedorId?: string
  categoriaId: string
  unidadeCompraId: string
  pesoLiquidoGramas: number
  precoUnidade: number
  calorias?: number
  proteinas?: number
  carboidratos?: number
  gorduras?: number
  fibras?: number
  sodio?: number
  codigoTaco?: number
  fonteDados?: string
  categoria: { nome: string }
  unidadeCompra: { nome: string; simbolo: string }
  fornecedorRel?: { nome: string }
}

interface Categoria {
  id: string
  nome: string
}

interface UnidadeMedida {
  id: string
  nome: string
  simbolo: string
}

interface Fornecedor {
  id: string
  nome: string
  ativo: boolean
}

export default function InsumosPage() {
  const { addNotification } = useNotifications()
  const [searchTerm, setSearchTerm] = useState('')
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isTacoModalOpen, setIsTacoModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    marca: '',
    fornecedor: '',
    fornecedorId: '',
    categoriaId: '',
    unidadeCompraId: '',
    pesoLiquidoGramas: '',
    precoUnidade: '',
    calorias: '',
    proteinas: '',
    carboidratos: '',
    gorduras: '',
    fibras: '',
    sodio: '',
    codigoTaco: '',
    fonteDados: 'manual'
  })

  useEffect(() => {
    fetchInsumos()
    fetchCategorias()
    fetchUnidades()
    fetchFornecedores()
  }, [])

  const fetchInsumos = async () => {
    try {
      const response = await fetch('/api/insumos')
      if (response.ok) {
        const data = await response.json()
        setInsumos(data)
      }
    } catch (error) {
      console.error('Error fetching insumos:', error)
    }
  }

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias-insumos')
      if (response.ok) {
        const data = await response.json()
        setCategorias(data)
      }
    } catch (error) {
      console.error('Error fetching categorias:', error)
    }
  }

  const fetchUnidades = async () => {
    try {
      const response = await fetch('/api/unidades-medida')
      if (response.ok) {
        const data = await response.json()
        setUnidades(data)
      }
    } catch (error) {
      console.error('Error fetching unidades:', error)
    }
  }

  const fetchFornecedores = async () => {
    try {
      const response = await fetch('/api/fornecedores')
      if (response.ok) {
        const data = await response.json()
        setFornecedores(data.filter((f: Fornecedor) => f.ativo))
      }
    } catch (error) {
      console.error('Error fetching fornecedores:', error)
    }
  }

  const handleOpenModal = (insumo?: Insumo) => {
    setEditingInsumo(insumo || null)
    if (insumo) {
      setFormData({
        nome: insumo.nome,
        marca: insumo.marca || '',
        fornecedor: insumo.fornecedor || '',
        fornecedorId: insumo.fornecedorId || '',
        categoriaId: insumo.categoriaId,
        unidadeCompraId: insumo.unidadeCompraId,
        pesoLiquidoGramas: insumo.pesoLiquidoGramas.toString(),
        precoUnidade: insumo.precoUnidade.toString(),
        calorias: insumo.calorias?.toString() || '',
        proteinas: insumo.proteinas?.toString() || '',
        carboidratos: insumo.carboidratos?.toString() || '',
        gorduras: insumo.gorduras?.toString() || '',
        fibras: insumo.fibras?.toString() || '',
        sodio: insumo.sodio?.toString() || '',
        codigoTaco: insumo.codigoTaco?.toString() || '',
        fonteDados: insumo.fonteDados || 'manual'
      })
    } else {
      setFormData({
        nome: '',
        marca: '',
        fornecedor: '',
        fornecedorId: '',
        categoriaId: '',
        unidadeCompraId: '',
        pesoLiquidoGramas: '',
        precoUnidade: '',
        calorias: '',
        proteinas: '',
        carboidratos: '',
        gorduras: '',
        fibras: '',
        sodio: '',
        codigoTaco: '',
        fonteDados: 'manual'
      })
    }
    setIsModalOpen(true)
    setError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingInsumo(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingInsumo ? `/api/insumos/${editingInsumo.id}` : '/api/insumos'
      const method = editingInsumo ? 'PUT' : 'POST'

      const convertedData = convertFormDataToNumbers(formData, [
        'pesoLiquidoGramas', 
        'precoUnidade',
        'calorias',
        'proteinas', 
        'carboidratos',
        'gorduras',
        'fibras',
        'sodio'
      ])

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(convertedData)
      })

      if (response.ok) {
        handleCloseModal()
        fetchInsumos()
        addNotification({
          type: 'success',
          title: 'Sucesso!',
          message: editingInsumo ? 'Insumo atualizado com sucesso' : 'Insumo criado com sucesso',
          duration: 3000
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar insumo')
        addNotification({
          type: 'error',
          title: 'Erro',
          message: 'Falha ao salvar insumo',
          duration: 5000
        })
      }
    } catch {
      setError('Erro ao salvar insumo')
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Falha ao salvar insumo',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTacoSelect = (alimento: { id: number; energyKcal?: number; proteinG?: number; carbohydrateG?: number; lipidG?: number; fiberG?: number; sodiumMg?: number }) => {
    setFormData(prev => ({
      ...prev,
      calorias: alimento.energyKcal?.toString() || '',
      proteinas: alimento.proteinG?.toString() || '',
      carboidratos: alimento.carbohydrateG?.toString() || '',
      gorduras: alimento.lipidG?.toString() || '',
      fibras: alimento.fiberG?.toString() || '',
      sodio: alimento.sodiumMg?.toString() || '',
      codigoTaco: alimento.id.toString(),
      fonteDados: 'taco'
    }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este insumo?')) return

    try {
      const response = await fetch(`/api/insumos/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchInsumos()
        addNotification({
          type: 'success',
          title: 'Sucesso!',
          message: 'Insumo excluído com sucesso',
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Error deleting insumo:', error)
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Falha ao excluir insumo',
        duration: 5000
      })
    }
  }

  const filteredInsumos = insumos.filter(insumo =>
    insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insumo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insumo.categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center group">
            <div className="p-2 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl mr-3 group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
              <Package className="h-6 w-6 text-orange-600 transition-transform duration-200 group-hover:rotate-12" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Insumos</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center transition-all duration-300 hover:shadow-lg hover:shadow-orange-200/50 hover:scale-[1.02] backdrop-blur-sm border border-orange-400/20 btn-modern shadow-elegant"
          >
            <Plus className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
            <span className="font-medium">Novo Insumo</span>
          </button>
        </div>

        <div className="glass-morphism rounded-2xl shadow-floating border border-white/20 hover:shadow-floating transition-all duration-300 card-modern">
          <div className="p-6 border-b border-slate-200/60">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-all duration-200 group-focus-within:text-orange-500 group-focus-within:scale-110" />
              <input
                type="text"
                placeholder="Buscar insumos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-md"
              />
            </div>
          </div>

          <ModernTable
            columns={[
              { key: 'nome', label: 'Nome', sortable: true },
              { key: 'marca', label: 'Marca', sortable: true },
              { key: 'categoria.nome', label: 'Categoria', sortable: true },
              { key: 'pesoLiquidoGramas', label: 'Peso (g)', sortable: true, align: 'right',
                render: (value) => `${value}g` },
              { key: 'precoUnidade', label: 'Preço (R$)', sortable: true, align: 'right',
                render: (value) => `R$ ${Number(value).toFixed(2)}` },
              { key: 'custoGrama', label: 'Custo/g', sortable: false, align: 'right',
                render: (_, row) => `R$ ${(Number(row.precoUnidade) / Number(row.pesoLiquidoGramas)).toFixed(4)}/g` },
              { key: 'actions', label: 'Ações', align: 'center',
                render: (_, row) => (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(row as unknown as Insumo)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id as string)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
            ]}
            data={filteredInsumos as unknown as Record<string, unknown>[]}
            searchable={false}
            pagination={true}
            pageSize={10}
            loading={loading}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingInsumo ? 'Editar Insumo' : 'Novo Insumo'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Nome do Insumo"
              value={formData.nome}
              onChange={(value) => setFormData({ ...formData, nome: value })}
              required
              error={error && !formData.nome ? 'Nome é obrigatório' : ''}
            />

            <FloatingLabelInput
              label="Marca"
              value={formData.marca}
              onChange={(value) => setFormData({ ...formData, marca: value })}
            />

            <FloatingLabelSelect
              label="Fornecedor"
              value={formData.fornecedorId}
              onChange={(value) => setFormData({ ...formData, fornecedorId: value })}
              options={fornecedores.map(fornecedor => ({ value: fornecedor.id, label: fornecedor.nome }))}
            />

            <FloatingLabelSelect
              label="Categoria"
              value={formData.categoriaId}
              onChange={(value) => setFormData({ ...formData, categoriaId: value })}
              options={categorias.map(categoria => ({ value: categoria.id, label: categoria.nome }))}
              required
              error={error && !formData.categoriaId ? 'Categoria é obrigatória' : ''}
            />

            <FloatingLabelSelect
              label="Unidade de Compra"
              value={formData.unidadeCompraId}
              onChange={(value) => setFormData({ ...formData, unidadeCompraId: value })}
              options={unidades.map(unidade => ({ value: unidade.id, label: `${unidade.nome} (${unidade.simbolo})` }))}
              required
              error={error && !formData.unidadeCompraId ? 'Unidade é obrigatória' : ''}
            />

            <FloatingLabelInput
              label="Peso Líquido (gramas)"
              type="number"
              value={formData.pesoLiquidoGramas}
              onChange={(value) => setFormData({ ...formData, pesoLiquidoGramas: value })}
              required
              error={error && !formData.pesoLiquidoGramas ? 'Peso é obrigatório' : ''}
            />

            <FloatingLabelInput
              label="Preço por Unidade (R$)"
              type="number"
              step="0.01"
              value={formData.precoUnidade}
              onChange={(value) => setFormData({ ...formData, precoUnidade: value })}
              required
              error={error && !formData.precoUnidade ? 'Preço é obrigatório' : ''}
            />
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200/60">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-slate-800">Informações Nutricionais (por 100g)</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Opcional</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTacoModalOpen(true)}
                className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Buscar TACO</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FloatingLabelInput
                label="Calorias (kcal)"
                type="number"
                step="0.01"
                value={formData.calorias}
                onChange={(value) => setFormData({ ...formData, calorias: value })}
              />

              <FloatingLabelInput
                label="Proteínas (g)"
                type="number"
                step="0.01"
                value={formData.proteinas}
                onChange={(value) => setFormData({ ...formData, proteinas: value })}
              />

              <FloatingLabelInput
                label="Carboidratos (g)"
                type="number"
                step="0.01"
                value={formData.carboidratos}
                onChange={(value) => setFormData({ ...formData, carboidratos: value })}
              />

              <FloatingLabelInput
                label="Gorduras (g)"
                type="number"
                step="0.01"
                value={formData.gorduras}
                onChange={(value) => setFormData({ ...formData, gorduras: value })}
              />

              <FloatingLabelInput
                label="Fibras (g)"
                type="number"
                step="0.01"
                value={formData.fibras}
                onChange={(value) => setFormData({ ...formData, fibras: value })}
              />

              <FloatingLabelInput
                label="Sódio (mg)"
                type="number"
                step="0.01"
                value={formData.sodio}
                onChange={(value) => setFormData({ ...formData, sodio: value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200/60">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 font-medium hover:scale-[1.02] transform"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 btn-modern shadow-elegant"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <span className="font-medium">Salvar</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <TacoSearchModal
        isOpen={isTacoModalOpen}
        onClose={() => setIsTacoModalOpen(false)}
        onSelect={handleTacoSelect}
      />
    </DashboardLayout>
  )
}
