import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import { Search, Check } from 'lucide-react'

interface TacoAlimento {
  id: number
  description: string
  category: string
  energyKcal?: number
  proteinG?: number
  carbohydrateG?: number
  lipidG?: number
  fiberG?: number
  sodiumMg?: number
}

interface TacoSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (alimento: TacoAlimento) => void
}

export default function TacoSearchModal({ isOpen, onClose, onSelect }: TacoSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [alimentos, setAlimentos] = useState<TacoAlimento[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const searchTaco = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/taco/search?q=${encodeURIComponent(searchTerm)}`)
        if (response.ok) {
          const data = await response.json()
          setAlimentos(data)
        }
      } catch (error) {
        console.error('Error searching TACO:', error)
      } finally {
        setLoading(false)
      }
    }

    if (searchTerm.length >= 2) {
      searchTaco()
    } else {
      setAlimentos([])
    }
  }, [searchTerm])

  const handleSelect = (alimento: TacoAlimento) => {
    onSelect(alimento)
    onClose()
    setSearchTerm('')
    setAlimentos([])
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar Alimento TACO">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Digite o nome do alimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#5AC8FA] focus:border-[#5AC8FA]"
            autoFocus
          />
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200/30 border-t-[#5AC8FA] border-r-[#1B2E4B] mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Buscando alimentos...</p>
          </div>
        )}

        {alimentos.length > 0 && (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {alimentos.map((alimento) => (
              <div
                key={alimento.id}
                onClick={() => handleSelect(alimento)}
                className="p-3 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-[#5AC8FA] cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">{alimento.description}</h3>
                    <p className="text-sm text-slate-600">{alimento.category}</p>
                    {alimento.energyKcal && (
                      <p className="text-xs text-slate-500 mt-1">
                        {alimento.energyKcal} kcal/100g
                      </p>
                    )}
                  </div>
                  <Check className="h-5 w-5 text-[#5AC8FA]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {searchTerm.length >= 2 && !loading && alimentos.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-600">Nenhum alimento encontrado</p>
            <p className="text-sm text-slate-500 mt-1">Tente usar termos diferentes</p>
          </div>
        )}

        {searchTerm.length < 2 && (
          <div className="text-center py-8">
            <p className="text-slate-600">Digite pelo menos 2 caracteres para buscar</p>
          </div>
        )}
      </div>
    </Modal>
  )
}


