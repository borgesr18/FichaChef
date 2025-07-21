import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`
  }
  return `${grams.toFixed(0)} g`
}

export function calculateProportionalCost(
  totalWeightGrams: number,
  totalPrice: number,
  usedWeightGrams: number
): number {
  return (usedWeightGrams / totalWeightGrams) * totalPrice
}

export function scaleRecipeIngredients(
  originalIngredients: Array<{quantidadeGramas: number, insumo: {nome: string, precoUnidade: number, pesoLiquidoGramas: number}}>,
  originalPortions: number,
  targetPortions: number
) {
  const scaleFactor = targetPortions / originalPortions
  
  return originalIngredients.map(ingredient => ({
    ...ingredient,
    quantidadeGramas: ingredient.quantidadeGramas * scaleFactor
  }))
}

export function scaleRecipeTime(originalTime: number | undefined, originalPortions: number, targetPortions: number): number | undefined {
  if (!originalTime) return undefined
  
  const scaleFactor = Math.sqrt(targetPortions / originalPortions)
  return Math.round(originalTime * scaleFactor)
}

export function calculateScaledCost(scaledIngredients: Array<{quantidadeGramas: number, insumo: {precoUnidade: number, pesoLiquidoGramas: number}}>) {
  return scaledIngredients.reduce((total, ing) => {
    const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
    return total + (custoPorGrama * ing.quantidadeGramas)
  }, 0)
}
