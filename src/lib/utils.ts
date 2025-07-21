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

export interface PricePoint {
  date: Date
  price: number
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable'
  slope: number
  correlation: number
  averageMonthlyChange: number
  volatility: number
}

export interface CostProjection {
  date: Date
  projectedPrice: number
  confidence: number
}

export function calculateLinearTrend(priceHistory: PricePoint[]): TrendAnalysis {
  if (priceHistory.length < 2) {
    return {
      trend: 'stable',
      slope: 0,
      correlation: 0,
      averageMonthlyChange: 0,
      volatility: 0
    }
  }

  const sortedPrices = [...priceHistory].sort((a, b) => a.date.getTime() - b.date.getTime())
  
  if (sortedPrices.length === 0) {
    return {
      trend: 'stable',
      slope: 0,
      correlation: 0,
      averageMonthlyChange: 0,
      volatility: 0
    }
  }

  const firstDate = sortedPrices[0]!.date.getTime()
  const dataPoints = sortedPrices.map(point => ({
    x: (point.date.getTime() - firstDate) / (1000 * 60 * 60 * 24),
    y: point.price
  }))

  const n = dataPoints.length
  const sumX = dataPoints.reduce((sum, point) => sum + point.x, 0)
  const sumY = dataPoints.reduce((sum, point) => sum + point.y, 0)
  const sumXY = dataPoints.reduce((sum, point) => sum + point.x * point.y, 0)
  const sumXX = dataPoints.reduce((sum, point) => sum + point.x * point.x, 0)
  const sumYY = dataPoints.reduce((sum, point) => sum + point.y * point.y, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)

  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))

  const meanPrice = sumY / n
  const volatility = Math.sqrt(
    dataPoints.reduce((sum, point) => sum + Math.pow(point.y - meanPrice, 2), 0) / n
  )

  const averageMonthlyChange = slope * 30

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  if (Math.abs(slope) > 0.01) {
    trend = slope > 0 ? 'increasing' : 'decreasing'
  }

  return {
    trend,
    slope,
    correlation: isNaN(correlation) ? 0 : correlation,
    averageMonthlyChange,
    volatility
  }
}

export function projectFutureCosts(
  priceHistory: PricePoint[], 
  monthsAhead: number = 6
): CostProjection[] {
  if (priceHistory.length < 2) {
    return []
  }

  const trendAnalysis = calculateLinearTrend(priceHistory)
  const lastPrice = priceHistory[priceHistory.length - 1]
  
  if (!lastPrice) {
    return []
  }

  const projections: CostProjection[] = []

  for (let month = 1; month <= monthsAhead; month++) {
    const futureDate = new Date(lastPrice.date)
    futureDate.setMonth(futureDate.getMonth() + month)

    const projectedPrice = lastPrice.price + (trendAnalysis.averageMonthlyChange * month)
    
    const baseConfidence = Math.abs(trendAnalysis.correlation) * 0.8
    const timeDecay = Math.exp(-month * 0.1)
    const confidence = Math.max(0.1, baseConfidence * timeDecay)

    projections.push({
      date: futureDate,
      projectedPrice: Math.max(0, projectedPrice),
      confidence
    })
  }

  return projections
}

export function groupPricesByPeriod(
  priceHistory: PricePoint[], 
  period: 'monthly' | 'quarterly' | 'yearly'
): Array<{ period: string; averagePrice: number; priceCount: number; minPrice: number; maxPrice: number }> {
  const groups: Record<string, PricePoint[]> = {}

  priceHistory.forEach(point => {
    let key: string
    const date = point.date

    switch (period) {
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1
        key = `${date.getFullYear()}-Q${quarter}`
        break
      case 'yearly':
        key = String(date.getFullYear())
        break
    }

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key]!.push(point)
  })

  return Object.entries(groups)
    .map(([period, prices]) => ({
      period,
      averagePrice: prices.reduce((sum, p) => sum + p.price, 0) / prices.length,
      priceCount: prices.length,
      minPrice: Math.min(...prices.map(p => p.price)),
      maxPrice: Math.max(...prices.map(p => p.price))
    }))
    .sort((a, b) => a.period.localeCompare(b.period))
}

export function calculatePriceVolatility(priceHistory: PricePoint[]): {
  volatility: number
  riskLevel: 'low' | 'medium' | 'high'
} {
  if (priceHistory.length < 2) {
    return { volatility: 0, riskLevel: 'low' }
  }

  const prices = priceHistory.map(p => p.price)
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length
  const volatility = Math.sqrt(variance)
  
  const coefficientOfVariation = volatility / mean

  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (coefficientOfVariation > 0.3) {
    riskLevel = 'high'
  } else if (coefficientOfVariation > 0.15) {
    riskLevel = 'medium'
  }

  return { volatility, riskLevel }
}
