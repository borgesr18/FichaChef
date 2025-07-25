'use client'

import React, { useState } from 'react'
import Modal from './Modal'
import DesignSystemButton from './DesignSystemButton'
import FloatingLabelInput from './FloatingLabelInput'
import FloatingLabelSelect from './FloatingLabelSelect'
import { BatchOperation, BatchField, executeBatchOperation } from '@/lib/batch-operations'
import { AlertTriangle, Check } from 'lucide-react'

interface BatchOperationsModalProps {
  isOpen: boolean
  onClose: () => void
  operation: BatchOperation
  selectedIds: string[]
  onComplete: () => void
}

export default function BatchOperationsModal({
  isOpen,
  onClose,
  operation,
  selectedIds,
  onComplete
}: BatchOperationsModalProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: value }))
  }

  const handleExecute = async () => {
    setLoading(true)
    try {
      const result = await executeBatchOperation(operation.id, selectedIds, fieldValues)
      if (result.success) {
        onComplete()
        onClose()
      } else {
        alert(result.message)
      }
    } catch {
      alert('Erro ao executar operação')
    } finally {
      setLoading(false)
    }
  }

  const renderField = (field: BatchField) => {
    switch (field.type) {
      case 'select':
        return (
          <FloatingLabelSelect
            key={field.name}
            label={field.label}
            value={String(fieldValues[field.name] || '')}
            onChange={(value) => handleFieldChange(field.name, value)}
            options={field.options || []}
          />
        )
      case 'boolean':
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              checked={Boolean(fieldValues[field.name])}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
              {field.label}
            </label>
          </div>
        )
      default:
        return (
          <FloatingLabelInput
            key={field.name}
            label={field.label}
            type={field.type}
            value={String(fieldValues[field.name] || '')}
            onChange={(value) => handleFieldChange(field.name, value)}
          />
        )
    }
  }

  if (showConfirmation) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Operação" size="md">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Atenção</h3>
              <p className="text-sm text-yellow-700">
                {operation.confirmationMessage?.replace('{count}', selectedIds.length.toString()) ||
                 `Deseja executar a operação "${operation.name}" em ${selectedIds.length} itens?`}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <DesignSystemButton
              variant="ghost"
              onClick={() => setShowConfirmation(false)}
            >
              Cancelar
            </DesignSystemButton>
            <DesignSystemButton
              variant="primary"
              onClick={handleExecute}
              loading={loading}
              icon={Check}
            >
              Confirmar
            </DesignSystemButton>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={operation.name} size="lg">
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-1">{operation.name}</h3>
          <p className="text-sm text-blue-700">{operation.description}</p>
          <p className="text-xs text-blue-600 mt-2">
            {selectedIds.length} item(s) selecionado(s)
          </p>
        </div>

        {operation.fields && operation.fields.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Configurações:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operation.fields.map(renderField)}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <DesignSystemButton variant="ghost" onClick={onClose}>
            Cancelar
          </DesignSystemButton>
          <DesignSystemButton
            variant="primary"
            onClick={() => setShowConfirmation(true)}
          >
            Executar
          </DesignSystemButton>
        </div>
      </div>
    </Modal>
  )
}
