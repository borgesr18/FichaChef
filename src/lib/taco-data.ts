export interface TacoAlimento {
  id: number
  description: string
  category: string
  humidity_percents?: number
  energy_kcal?: number
  energy_kj?: number
  protein_g?: number
  lipid_g?: number
  cholesterol_mg?: number | string
  carbohydrate_g?: number
  fiber_g?: number
  ashes_g?: number
  calcium_mg?: number
  magnesium_mg?: number
  manganese_mg?: number
  phosphorus_mg?: number
  iron_mg?: number
  sodium_mg?: number
  potassium_mg?: number
  copper_mg?: number
  zinc_mg?: number
  retinol_mcg?: number | string
  thiamine_mg?: number
  riboflavin_mg?: number | string
  pyridoxine_mg?: number
  niacin_mg?: number | string
  vitaminC_mg?: number | string
}

export async function fetchTacoData(): Promise<TacoAlimento[]> {
  const response = await fetch('https://raw.githubusercontent.com/marcelosanto/tabela_taco/main/TACO.json')
  if (!response.ok) {
    throw new Error('Failed to fetch TACO data')
  }
  return response.json()
}

export function convertTacoToNumber(value: number | string | undefined): number | null {
  if (value === undefined || value === null || value === '' || value === 'NA' || value === 'Tr') {
    return null
  }
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(num) ? null : num
}

export function searchTacoAlimentos(alimentos: TacoAlimento[], query: string): TacoAlimento[] {
  const normalizedQuery = query.toLowerCase().trim()
  if (!normalizedQuery) return []

  return alimentos
    .filter(alimento => 
      alimento.description.toLowerCase().includes(normalizedQuery) ||
      alimento.category.toLowerCase().includes(normalizedQuery)
    )
    .sort((a, b) => {
      const aDesc = a.description.toLowerCase()
      const bDesc = b.description.toLowerCase()
      
      const aStartsWith = aDesc.startsWith(normalizedQuery)
      const bStartsWith = bDesc.startsWith(normalizedQuery)
      
      if (aStartsWith && !bStartsWith) return -1
      if (!aStartsWith && bStartsWith) return 1
      
      return aDesc.localeCompare(bDesc)
    })
    .slice(0, 20)
}
