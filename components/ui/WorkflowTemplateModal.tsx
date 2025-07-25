'use client'

import React, { useState } from 'react'
import Modal from './Modal'
import DesignSystemButton from './DesignSystemButton'
import FloatingLabelInput from './FloatingLabelInput'
import FloatingLabelSelect from './FloatingLabelSelect'
import { WorkflowTemplate, FormField } from '@/lib/workflow-templates'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'

interface WorkflowTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template: WorkflowTemplate
  onComplete: (data: Record<string, unknown>) => void
}

export default function WorkflowTemplateModal({
  isOpen,
  onClose,
  template,
  onComplete
}: WorkflowTemplateModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>(template.defaultData || {})
  const [loading, setLoading] = useState(false)

  const currentStep = template.steps[currentStepIndex]
  const isLastStep = currentStepIndex === template.steps.length - 1

  const handleNext = async () => {
    if (!currentStep) return
    
    if (currentStep.action === 'confirmation') {
      setLoading(true)
      try {
        if (currentStep.apiEndpoint) {
          const response = await fetch(currentStep.apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          })
          if (response.ok) {
            onComplete(formData)
            onClose()
          }
        }
      } catch (error) {
        console.error('Workflow execution error:', error)
      } finally {
        setLoading(false)
      }
    } else {
      setCurrentStepIndex(prev => Math.min(prev + 1, template.steps.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStepIndex(prev => Math.max(prev - 1, 0))
  }

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
  }

  const renderFormField = (field: FormField) => {
    switch (field.type) {
      case 'select':
        return (
          <FloatingLabelSelect
            key={field.name}
            label={field.label}
            value={String(formData[field.name] || '')}
            onChange={(value) => handleFieldChange(field.name, value)}
            options={field.options || []}
            required={field.required}
          />
        )
      case 'textarea':
        return (
          <div key={field.name} className="relative">
            <textarea
              value={String(formData[field.name] || '')}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.label}
              required={field.required}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            />
          </div>
        )
      default:
        return (
          <FloatingLabelInput
            key={field.name}
            label={field.label}
            type={field.type}
            value={String(formData[field.name] || '')}
            onChange={(value) => handleFieldChange(field.name, value)}
            required={field.required}
          />
        )
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={template.name} size="lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {template.steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index <= currentStepIndex 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {index < currentStepIndex ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {index < template.steps.length - 1 && (
                <div className={`w-12 h-1 mx-2 ${
                  index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentStep?.title}</h3>
          <p className="text-gray-600 text-sm">{currentStep?.description}</p>
        </div>

        {currentStep?.action === 'form' && currentStep.formFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentStep.formFields.map(renderFormField)}
          </div>
        )}

        {currentStep?.action === 'confirmation' && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Dados para confirmação:</h4>
            <div className="space-y-2">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-blue-700 capitalize">{key}:</span>
                  <span className="text-blue-900 font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <DesignSystemButton
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            icon={ChevronLeft}
          >
            Anterior
          </DesignSystemButton>

          <DesignSystemButton
            variant="primary"
            onClick={handleNext}
            loading={loading}
            icon={isLastStep ? Check : ChevronRight}
            iconPosition="right"
          >
            {isLastStep ? 'Finalizar' : 'Próximo'}
          </DesignSystemButton>
        </div>
      </div>
    </Modal>
  )
}
