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

export function formatNutritionalValueSimple(value: number | undefined): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'N/A'
  }
  return value.toFixed(1)
}

export interface TacoNutritionalData {
  calorias: number
  proteinas: number
  carboidratos: number
  gorduras: number
  fibras: number
  sodio: number
  calcio: number
  ferro: number
  magnesio: number
  fosforo: number
  potassio: number
  zinco: number
  vitaminaC: number
}

export function mapTacoToNutritionalInfo(taco: { energyKcal?: number; proteinG?: number; carbohydrateG?: number; lipidG?: number; fiberG?: number; sodiumMg?: number; calciumMg?: number; ironMg?: number; magnesiumMg?: number; phosphorusMg?: number; potassiumMg?: number; zincMg?: number; vitaminCMg?: number }): TacoNutritionalData {
  return {
    calorias: taco.energyKcal || 0,
    proteinas: taco.proteinG || 0,
    carboidratos: taco.carbohydrateG || 0,
    gorduras: taco.lipidG || 0,
    fibras: taco.fiberG || 0,
    sodio: taco.sodiumMg || 0,
    calcio: taco.calciumMg || 0,
    ferro: taco.ironMg || 0,
    magnesio: taco.magnesiumMg || 0,
    fosforo: taco.phosphorusMg || 0,
    potassio: taco.potassiumMg || 0,
    zinco: taco.zincMg || 0,
    vitaminaC: taco.vitaminCMg || 0
  }
}

export interface AnvisaLabel {
  valorEnergetico: string
  carboidratos: string
  proteinas: string
  gordurasTotais: string
  fibras: string
  sodio: string
  percentualVD: {
    carboidratos: string
    proteinas: string
    gordurasTotais: string
    fibras: string
    sodio: string
  }
}

export function generateAnvisaLabel(nutrition: NutritionalInfo, porcaoGramas: number = 100): AnvisaLabel {
  const VD = {
    carboidratos: 300,
    proteinas: 75,
    gordurasTotais: 55,
    fibras: 25,
    sodio: 2400
  }

  const factor = porcaoGramas / 100
  const adjustedNutrition = {
    calorias: nutrition.calorias * factor,
    carboidratos: nutrition.carboidratos * factor,
    proteinas: nutrition.proteinas * factor,
    gorduras: nutrition.gorduras * factor,
    fibras: nutrition.fibras * factor,
    sodio: nutrition.sodio * factor
  }

  return {
    valorEnergetico: `${adjustedNutrition.calorias.toFixed(0)} kcal`,
    carboidratos: `${adjustedNutrition.carboidratos.toFixed(1)}g`,
    proteinas: `${adjustedNutrition.proteinas.toFixed(1)}g`,
    gordurasTotais: `${adjustedNutrition.gorduras.toFixed(1)}g`,
    fibras: `${adjustedNutrition.fibras.toFixed(1)}g`,
    sodio: `${adjustedNutrition.sodio.toFixed(0)}mg`,
    percentualVD: {
      carboidratos: `${((adjustedNutrition.carboidratos / VD.carboidratos) * 100).toFixed(0)}%`,
      proteinas: `${((adjustedNutrition.proteinas / VD.proteinas) * 100).toFixed(0)}%`,
      gordurasTotais: `${((adjustedNutrition.gorduras / VD.gordurasTotais) * 100).toFixed(0)}%`,
      fibras: `${((adjustedNutrition.fibras / VD.fibras) * 100).toFixed(0)}%`,
      sodio: `${((adjustedNutrition.sodio / VD.sodio) * 100).toFixed(0)}%`
    }
  }
}
