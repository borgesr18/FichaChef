'use client'

import React from 'react'
import { generateAnvisaLabel, NutritionalInfo } from '@/lib/nutritional-utils'

interface AnvisaLabelProps {
  nutrition: NutritionalInfo
  porcaoGramas?: number
  nomeAlimento: string
  className?: string
}

export default function AnvisaLabel({ nutrition, porcaoGramas = 100, nomeAlimento, className = '' }: AnvisaLabelProps) {
  const label = generateAnvisaLabel(nutrition, porcaoGramas)

  return (
    <div className={`bg-white border-2 border-black p-4 font-mono text-sm max-w-md ${className}`}>
      <div className="text-center border-b-2 border-black pb-2 mb-3">
        <h3 className="font-bold text-lg">INFORMAÇÃO NUTRICIONAL</h3>
        <p className="text-sm">{nomeAlimento}</p>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between border-b border-black pb-1">
          <span className="font-bold">Porção de {porcaoGramas}g</span>
        </div>

        <div className="flex justify-between items-center py-1">
          <span className="font-bold">Valor energético</span>
          <span className="font-bold">{label.valorEnergetico}</span>
        </div>

        <div className="border-t-2 border-black pt-2">
          <div className="flex justify-between text-xs font-bold">
            <span></span>
            <span>%VD*</span>
          </div>
        </div>

        <div className="flex justify-between">
          <span>Carboidratos</span>
          <div className="flex space-x-4">
            <span>{label.carboidratos}</span>
            <span className="w-8 text-right">{label.percentualVD.carboidratos}</span>
          </div>
        </div>

        <div className="flex justify-between">
          <span>Proteínas</span>
          <div className="flex space-x-4">
            <span>{label.proteinas}</span>
            <span className="w-8 text-right">{label.percentualVD.proteinas}</span>
          </div>
        </div>

        <div className="flex justify-between">
          <span>Gorduras totais</span>
          <div className="flex space-x-4">
            <span>{label.gordurasTotais}</span>
            <span className="w-8 text-right">{label.percentualVD.gordurasTotais}</span>
          </div>
        </div>

        <div className="flex justify-between">
          <span>Fibra alimentar</span>
          <div className="flex space-x-4">
            <span>{label.fibras}</span>
            <span className="w-8 text-right">{label.percentualVD.fibras}</span>
          </div>
        </div>

        <div className="flex justify-between">
          <span>Sódio</span>
          <div className="flex space-x-4">
            <span>{label.sodio}</span>
            <span className="w-8 text-right">{label.percentualVD.sodio}</span>
          </div>
        </div>

        <div className="border-t border-black pt-2 mt-3">
          <p className="text-xs">
            *Percentual de valores diários fornecidos pela porção.
          </p>
        </div>
      </div>
    </div>
  )
}
