export interface NutritionalInfo {
  calorias: number
  proteinas: number
  carboidratos: number
  gorduras: number
  fibras: number
  sodio: number
}

export interface InsumoWithNutrition {
  id: string
  nome: string
  pesoLiquidoGramas: number
  calorias?: number
  proteinas?: number
  carboidratos?: number
  gorduras?: number
  fibras?: number
  sodio?: number
}

export interface IngredienteWithNutrition {
  quantidadeGramas: number
  insumo: InsumoWithNutrition
}

export const calculateNutritionalPerGram = (insumo: InsumoWithNutrition) => {
  return {
    calorias: (insumo.calorias || 0) / 100,
    proteinas: (insumo.proteinas || 0) / 100,
    carboidratos: (insumo.carboidratos || 0) / 100,
    gorduras: (insumo.gorduras || 0) / 100,
    fibras: (insumo.fibras || 0) / 100,
    sodio: (insumo.sodio || 0) / 100
  }
}

export const calculateTotalNutrition = (ingredientes: IngredienteWithNutrition[]): NutritionalInfo => {
  return ingredientes.reduce((total, ing) => {
    const nutritionPerGram = calculateNutritionalPerGram(ing.insumo)
    
    return {
      calorias: total.calorias + (nutritionPerGram.calorias * ing.quantidadeGramas),
      proteinas: total.proteinas + (nutritionPerGram.proteinas * ing.quantidadeGramas),
      carboidratos: total.carboidratos + (nutritionPerGram.carboidratos * ing.quantidadeGramas),
      gorduras: total.gorduras + (nutritionPerGram.gorduras * ing.quantidadeGramas),
      fibras: total.fibras + (nutritionPerGram.fibras * ing.quantidadeGramas),
      sodio: total.sodio + (nutritionPerGram.sodio * ing.quantidadeGramas)
    }
  }, {
    calorias: 0,
    proteinas: 0,
    carboidratos: 0,
    gorduras: 0,
    fibras: 0,
    sodio: 0
  })
}

export const calculateNutritionPerPortion = (totalNutrition: NutritionalInfo, numeroPorcoes: number): NutritionalInfo => {
  return {
    calorias: totalNutrition.calorias / numeroPorcoes,
    proteinas: totalNutrition.proteinas / numeroPorcoes,
    carboidratos: totalNutrition.carboidratos / numeroPorcoes,
    gorduras: totalNutrition.gorduras / numeroPorcoes,
    fibras: totalNutrition.fibras / numeroPorcoes,
    sodio: totalNutrition.sodio / numeroPorcoes
  }
}

export const calculateNutritionPer100g = (totalNutrition: NutritionalInfo, pesoFinalGramas: number): NutritionalInfo => {
  const factor = 100 / pesoFinalGramas
  
  return {
    calorias: totalNutrition.calorias * factor,
    proteinas: totalNutrition.proteinas * factor,
    carboidratos: totalNutrition.carboidratos * factor,
    gorduras: totalNutrition.gorduras * factor,
    fibras: totalNutrition.fibras * factor,
    sodio: totalNutrition.sodio * factor
  }
}

export const formatNutritionalValue = (value: number, unit: string): string => {
  return `${value.toFixed(1)}${unit}`
}
