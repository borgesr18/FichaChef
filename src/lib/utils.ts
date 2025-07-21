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

export function calculateMenuCost(
  menuItens: Array<{
    quantidade: number
    produto: {
      produtoFichas: Array<{
        quantidadeGramas: number
        fichaTecnica: {
          pesoFinalGramas: number
          ingredientes: Array<{
            quantidadeGramas: number
            insumo: {
              precoUnidade: number
              pesoLiquidoGramas: number
            }
          }>
        }
      }>
    }
  }>
): number {
  return menuItens.reduce((total, item) => {
    const produtoCusto = item.produto.produtoFichas.reduce((produtoTotal, produtoFicha) => {
      const fichaCusto = produtoFicha.fichaTecnica.ingredientes.reduce((fichaTotal, ing) => {
        const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
        return fichaTotal + (custoPorGrama * ing.quantidadeGramas)
      }, 0)
      const custoPorGramaFicha = fichaCusto / produtoFicha.fichaTecnica.pesoFinalGramas
      return produtoTotal + (custoPorGramaFicha * produtoFicha.quantidadeGramas)
    }, 0)
    return total + (produtoCusto * item.quantidade)
  }, 0)
}

export function generateWeeklyPeriods(startDate: Date, weeks: number = 4) {
  const periods = []
  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(startDate)
    weekStart.setDate(startDate.getDate() + (i * 7))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    periods.push({ dataInicio: weekStart, dataFim: weekEnd })
  }
  return periods
}
